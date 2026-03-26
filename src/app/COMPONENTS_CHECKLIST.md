# Mobile app (`src/app`) — rebuild checklist

Use this list for **feature parity** with the web app. Prefer **reusing** `src/components/*`, `src/views/*`, and shared composables; add `src/app/*` only for native shell UX or mobile-specific presentation.

Legend: **Shell** = app chrome · **Reuse** = keep using web component/view · **Adapt** = wrap or restyle for app · **Rebuild** = new mobile-first component

## Phase 1 — Shell (store-ready navigation)

| Item | Status | Notes |
|------|--------|--------|
| `layouts/MobileShell.vue` | Done | Safe areas + main slot |
| `components/AppTabBar.vue` | Done | Primary destinations |
| `components/AppTopBar.vue` | Done | Title + overflow links |
| `composables/useIsNativeApp.js` | Done | Capacitor + `VITE_FORCE_NATIVE_SHELL` |
| Wire `App.vue` for native shell | Done | Web unchanged |

**Preview the shell in a desktop browser:** add `VITE_FORCE_NATIVE_SHELL=true` to `.env` (Capacitor sets the same behavior automatically in real app builds).

## Phase 2 — Global web components → app decision

| Web file | Suggested approach |
|----------|-------------------|
| `Navigation.vue` | **Reuse** via web only; app uses `AppTabBar` + `AppTopBar` |
| `Footer.vue` | **Omit** in shell; legal/links can move to Profile / Settings later |
| `FeedbackWidget.vue` | **Reuse** (floating) or **Adapt** (sheet on small screens) |
| `LoginModal.vue` | **Adapt** if used inline; else **Reuse** with `Login.vue` |
| `LoadingSpinner.vue` | **Reuse** |
| `SuccessNotification.vue` | **Reuse** or toast plugin later |

## Phase 3 — Domain UI (cards, lists, modals)

| Web file | Suggested approach |
|----------|-------------------|
| `PokemonCard.vue` | **Reuse**; optional `app/components` wrapper for full-bleed |
| `PokemonCardMS.vue` | **Reuse** |
| `CardModal.vue` | **Adapt** → full-screen sheet on native |
| `PokemonListItem.vue` | **Reuse** |
| `TrainerListItem.vue` | **Reuse** |
| `PokeballIcon.vue` | **Reuse** |
| `RichTextEditor.vue` | **Reuse** (admin/blog); test keyboard on device |
| `StartMasterSetModal.vue` | **Adapt** → full-screen on native |

## Phase 4 — Screens (`src/views`)

Track each route; most need **responsive polish** only, not a second implementation.

- [ ] `Home.vue`
- [ ] `Login.vue`
- [ ] `Profile.vue`
- [ ] `StartMasterSet.vue`
- [ ] `BrowseCards.vue`
- [ ] `BrowsePokemon.vue`
- [ ] `PokemonDetail.vue`
- [ ] `BrowseTrainers.vue`
- [ ] `TrainerDetail.vue`
- [ ] `AllSets.vue`
- [ ] `SetDetail.vue`
- [ ] `ChallengeDetails.vue` (challenges + master sets)
- [ ] `BlogList.vue` / `BlogDetail.vue`
- [ ] `AdminSimplified.vue` / `AdminPokemon.vue` / `AdminSets.vue` / `AdminBlog.vue`
- [ ] Legacy / optional: `Picker.vue`, `Checklist.vue`, `Groups.vue`, `GroupDashboard.vue` (if still routed)

## Phase 5 — Native / store hardening

- [ ] Add Capacitor (`ios/`, `android/`), `cap sync` after `vite build`
- [ ] Google sign-in: redirect or native plugin (popup unreliable in WebView)
- [ ] Deep links (password reset, shared URLs)
- [ ] Icons, splash screens, `Info.plist` / Android manifest copy
- [ ] Optional: push, haptics (`src/app/composables`)

---

Update the **Status** column as you complete Phase 1+ items.
