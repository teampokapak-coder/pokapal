const admin = require('firebase-admin')
const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { logger } = require('firebase-functions')

admin.initializeApp()
const db = admin.firestore()
const messaging = admin.messaging()

const CHALLENGE_UPDATE_RATE_LIMIT_MS = 30 * 60 * 1000

const getUserDisplayName = async (userId) => {
  if (!userId) return 'Someone'
  const userSnap = await db.collection('users').doc(userId).get()
  if (!userSnap.exists) return 'Someone'
  const data = userSnap.data() || {}
  return data.displayName || data.email || 'Someone'
}

const getMasterSetName = async (masterSetId) => {
  if (!masterSetId) return 'your battle set'
  const masterSetSnap = await db.collection('masterSets').doc(masterSetId).get()
  if (!masterSetSnap.exists) return 'your battle set'
  return masterSetSnap.data()?.name || 'your battle set'
}

const fetchUserNotificationPrefs = async (userId) => {
  if (!userId) return { invitesEnabled: true, challengeUpdatesEnabled: true }
  const userSnap = await db.collection('users').doc(userId).get()
  const notifications = userSnap.data()?.notifications || {}
  return {
    invitesEnabled: notifications.invitesEnabled !== false,
    challengeUpdatesEnabled: notifications.challengeUpdatesEnabled !== false
  }
}

const fetchUserPushTokens = async (userId) => {
  if (!userId) return []
  const tokensSnap = await db.collection('users').doc(userId).collection('pushTokens').get()
  if (tokensSnap.empty) return []
  return tokensSnap.docs
    .map((docSnap) => docSnap.data()?.token)
    .filter((token) => typeof token === 'string' && token.length > 0)
}

const cleanupInvalidTokens = async (userId, tokens, responses) => {
  if (!userId || !tokens.length || !responses.length) return
  const invalidCodes = new Set([
    'messaging/invalid-registration-token',
    'messaging/registration-token-not-registered'
  ])

  const deletes = []
  responses.forEach((response, index) => {
    if (response.success) return
    const code = response.error?.code
    if (!invalidCodes.has(code)) return
    const token = tokens[index]
    if (!token) return
    const tokenDocId = encodeURIComponent(token).replace(/%/g, '_')
    deletes.push(db.collection('users').doc(userId).collection('pushTokens').doc(tokenDocId).delete())
  })

  if (deletes.length) {
    await Promise.allSettled(deletes)
  }
}

const sendPushToUser = async (userId, payload) => {
  const tokens = await fetchUserPushTokens(userId)
  if (!tokens.length) return { sentCount: 0, tokensChecked: 0 }

  const message = {
    tokens,
    notification: {
      title: payload.title,
      body: payload.body
    },
    data: payload.data || {},
    apns: {
      payload: {
        aps: {
          sound: 'default'
        }
      }
    }
  }

  const response = await messaging.sendEachForMulticast(message)
  await cleanupInvalidTokens(userId, tokens, response.responses)
  return { sentCount: response.successCount, tokensChecked: tokens.length }
}

const challengeRoute = (challengeId) => `/master-set/${challengeId}`

exports.sendInviteNotificationOnAssignmentCreate = onDocumentCreated('assignments/{assignmentId}', async (event) => {
  const assignment = event.data?.data()
  if (!assignment) return
  if (assignment.status !== 'pending') return

  const recipientId = assignment.userId || null
  const createdBy = assignment.createdBy || null
  const masterSetId = assignment.masterSetId || null
  if (!masterSetId) return
  if (!recipientId || recipientId === createdBy) return

  const prefs = await fetchUserNotificationPrefs(recipientId)
  if (!prefs.invitesEnabled) return

  const challengeName = await getMasterSetName(masterSetId)
  const result = await sendPushToUser(recipientId, {
    title: 'Battle Invite',
    body: `You were invited to ${challengeName}`,
    data: {
      type: 'invite',
      challengeId: String(masterSetId),
      route: challengeRoute(masterSetId)
    }
  })

  logger.info('Invite notification sent', {
    assignmentId: event.params.assignmentId,
    recipientId,
    ...result
  })
})

exports.sendChallengeUpdateNotificationOnCollectedCardCreate = onDocumentCreated('collectedCards/{collectedCardId}', async (event) => {
  const collectedCard = event.data?.data()
  if (!collectedCard) return

  const masterSetId = collectedCard.masterSetId || null
  const actorId = collectedCard.userId || null
  if (!masterSetId || !actorId) return

  const assignmentsSnap = await db.collection('assignments').where('masterSetId', '==', masterSetId).get()
  if (assignmentsSnap.empty) return

  const recipientIds = new Set()
  assignmentsSnap.docs.forEach((docSnap) => {
    const data = docSnap.data() || {}
    if (data.isShared && Array.isArray(data.memberIds)) {
      data.memberIds.forEach((memberId) => {
        if (memberId && memberId !== actorId) recipientIds.add(memberId)
      })
      return
    }
    if (data.userId && data.userId !== actorId) recipientIds.add(data.userId)
  })

  if (!recipientIds.size) return

  const challengeName = await getMasterSetName(masterSetId)
  const actorName = await getUserDisplayName(actorId)

  for (const recipientId of recipientIds) {
    const prefs = await fetchUserNotificationPrefs(recipientId)
    if (!prefs.challengeUpdatesEnabled) continue

    const rateLimitRef = db.collection('notificationRateLimits').doc(
      `${recipientId}_${masterSetId}_challenge_update`
    )
    const nowMs = Date.now()
    const rateLimitSnap = await rateLimitRef.get()
    const lastSentMs = rateLimitSnap.exists
      ? rateLimitSnap.data()?.lastSentAt?.toMillis?.() || 0
      : 0

    if (nowMs - lastSentMs < CHALLENGE_UPDATE_RATE_LIMIT_MS) {
      continue
    }

    const sendResult = await sendPushToUser(recipientId, {
      title: 'Challenge Update',
      body: `${actorName} collected a card in ${challengeName}`,
      data: {
        type: 'challenge_update',
        challengeId: String(masterSetId),
        route: challengeRoute(masterSetId)
      }
    })

    if (sendResult.sentCount > 0) {
      await rateLimitRef.set({
        recipientId,
        challengeId: masterSetId,
        type: 'challenge_update',
        lastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true })
    }
  }

  logger.info('Challenge update notifications processed', {
    collectedCardId: event.params.collectedCardId,
    masterSetId,
    recipients: recipientIds.size
  })
})
