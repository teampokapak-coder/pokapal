/**
 * One-pass scans of card collections for admin + battleset pickers.
 */
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { getAllPokemonCards } from './firebasePokemon'

/**
 * Distinct illustrator values from card_en + card_ja with total card counts.
 * @returns {Promise<Array<{ id: string, label: string, cardCount: number }>>}
 */
export async function aggregateIllustratorCounts () {
  const counts = new Map()
  for (const collName of ['card_en', 'card_ja']) {
    const snap = await getDocs(collection(db, collName))
    snap.docs.forEach((d) => {
      const ill = d.data()?.illustrator
      if (typeof ill !== 'string') return
      const key = ill.trim()
      if (!key) return
      counts.set(key, (counts.get(key) || 0) + 1)
    })
  }
  return Array.from(counts.entries())
    .map(([label, cardCount]) => ({ id: label, label, cardCount }))
    .sort((a, b) => b.cardCount - a.cardCount || a.label.localeCompare(b.label))
}

/**
 * MVP trainer name matching — same text blob as StartMasterSet getTrainerCardsMvp.
 * @param {Array<{ trainerName?: string, id?: string }>} trainers
 * @returns {Promise<Array<Record<string, unknown> & { cardCount: number }>>}
 */
export async function computeTrainerCardCounts (trainers) {
  const result = await getAllPokemonCards({ language: 'all' })
  if (!result.success || !result.data) {
    return trainers.map((t) => ({ ...t, cardCount: 0 }))
  }
  const cards = result.data
  return trainers.map((trainer) => {
    const trainerName = (trainer?.trainerName || '').toLowerCase().trim()
    if (!trainerName) return { ...trainer, cardCount: 0 }
    let n = 0
    for (const card of cards) {
      const textBlob = [
        card.name,
        card.cardName,
        card.trainerName,
        card.flavorText,
        Array.isArray(card.rules) ? card.rules.join(' ') : '',
        Array.isArray(card.text) ? card.text.join(' ') : ''
      ].join(' ').toLowerCase()
      if (textBlob.includes(trainerName)) n++
    }
    return { ...trainer, cardCount: n }
  })
}
