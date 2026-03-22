# Implementation Plan: Account Page Redesign

## Overview

Incrementally update `client/src/pages/User/Account.tsx` and related files to match the redesign spec: clean up the AccountHub hero, add ImagePreviewGrid and email verification to ProfilePage, replace the inline AddressForm with a modal-based AddressModal with inline validation, add a password strength checklist, rename DangerZone to PrivacyPage with a two-step PolicyModal for both deactivation and deletion, and add a `deleteAccount` export to `accountService.ts`.

## Tasks

- [x] 1. Extend accountService with deleteAccount function
  - Add `deleteAccount(password: string): Promise<void>` to `client/src/services/storefront/accountService.ts` calling `DELETE /auth/account` with `{ password, action: "delete" }`
  - Keep existing `deactivateAccount` unchanged (it sends `action: "deactivate"` or relies on existing endpoint)
  - _Requirements: 10.5_

- [x] 2. Refactor AccountHub hero and navigation cards
  - [x] 2.1 Remove phone, gender, DOB pills from the hero banner in `AccountHub`
    - Delete the pill row (`d-flex flex-wrap justify-content-center gap-2 mt-3`) from the hero
    - Remove the `fmt` and `fmtDOB` helper functions if no longer used
    - _Requirements: 1.5_
  - [x] 2.2 Remove "Edit Profile" button from the hero banner
    - Delete the `<button onClick={() => navigate("/account/profile")} ...>Edit Profile</button>` element
    - _Requirements: 1.6_
  - [x] 2.3 Add Sign Out button to AccountHub
    - Import `useAuth` and call `logout()` on click
    - Place button below the hero or inside the hero area
    - _Requirements: 1.3_
  - [x] 2.4 Update the sixth navigation card label from "Danger Zone" to "Privacy & Account Control"
    - Update the `CARDS` array entry for `id: "danger"` — change `label` to `"Privacy & Account Control"` and update `subs` to reflect the new framing
    - _Requirements: 7.2, 1.2_
  - [ ]* 2.5 Write property test for AccountHub identity rendering
    - **Property 1: AccountHub always renders user identity**
    - **Validates: Requirements 1.1**

- [x] 3. Implement ImagePreviewGrid and update ProfilePage
  - [x] 3.1 Create `ImagePreviewGrid` component inside `Account.tsx`
    - Accept `{ file: File; previewUrl: string; onRemove: () => void }` props
    - Render the preview image and a remove button
    - _Requirements: 2.1, 2.2_
  - [x] 3.2 Wire ImagePreviewGrid into ProfilePage avatar selection
    - After file selection, set `avatarFile` and `avatarPreview` state and render `<ImagePreviewGrid>` below the avatar circle
    - On remove, clear both states and hide the grid
    - _Requirements: 2.1, 2.2_
  - [x] 3.3 Add URL revocation on ProfilePage unmount
    - In a `useEffect` cleanup, call `URL.revokeObjectURL(avatarPreview)` when the component unmounts or preview changes
    - _Requirements: 2.5_
  - [x] 3.4 Add read-only email field and Verify button to ProfilePage
    - Render a disabled/read-only `<input>` showing `profile.email`
    - Add a "Verify" button next to it; on click call the email verification API and show "Verification email sent" or an inline error
    - Disable the button while the request is in flight
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
  - [ ]* 3.5 Write unit tests for ImagePreviewGrid
    - Test render with a mock File/URL
    - Test that `onRemove` callback fires on button click
    - _Requirements: 2.1, 2.2_

- [x] 4. Implement AddressModal replacing inline AddressForm
  - [x] 4.1 Create address field validation helpers
    - Write pure functions: `validateLine1`, `validateCity`, `validateState`, `validateZip`
    - Rules: line1 non-empty ≥5 chars; city/state non-empty letters+spaces only; zip exactly 6 digits (`/^\d{6}$/`)
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  - [ ]* 4.2 Write property tests for address validation helpers
    - **Property 2: line1 validator rejects strings shorter than 5 chars**
    - **Validates: Requirements 4.3**
    - **Property 3: city/state validators reject strings with digits or special chars**
    - **Validates: Requirements 4.4, 4.5**
    - **Property 4: zip validator rejects non-6-digit strings**
    - **Validates: Requirements 4.6**
  - [x] 4.3 Build AddressModal component
    - Accept `{ mode: "add" | "edit"; initial?: Partial<AddressFormData>; onSave: (d: AddressFormData) => Promise<void>; onClose: () => void }` props
    - Render inside a Bootstrap modal overlay (conditionally mounted)
    - Run validation on blur and on submit attempt; show per-field error messages below each input
    - On successful `onSave`, close modal; on API error, show inline error and keep modal open
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9_
  - [x] 4.4 Replace inline AddressForm usage in AddressesPage with AddressModal
    - Remove `AddressForm` component and `showForm`/`editId` inline rendering
    - Add `modalMode` and `modalInitial` state; open `<AddressModal>` for add and edit actions
    - On modal save, prepend new address or update existing in list without page reload; close modal
    - _Requirements: 4.1, 4.2, 4.8_
  - [ ]* 4.5 Write unit tests for AddressModal
    - Test that submitting with invalid fields shows all applicable errors and does not call onSave
    - Test that submitting with valid fields calls onSave and closes
    - _Requirements: 4.7, 4.8, 4.9_

- [x] 5. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement PrivacyPage with PolicyModal
  - [ ] 6.1 Create PolicyModal component
    - Accept `{ action: "deactivate" | "delete"; onClose: () => void; onConfirmed: () => void }` props
    - Step 1 (policy): render action-specific policy text and a checkbox; keep "Continue" disabled until checkbox is checked
    - Step 2 (confirm): render password input and action-specific confirm button label ("Deactivate My Account" / "Permanently Delete Account")
    - On submit: call `deactivateAccount(password)` or `deleteAccount(password)` based on action; on success call `onConfirmed()`
    - On 401/403: show "Incorrect password. Please try again." below password field
    - On network error: show inline error and re-enable confirm button
    - _Requirements: 8.1–8.9, 9.1–9.9_
  - [ ]* 6.2 Write property test for PolicyModal checkbox gate
    - **Property 5: PolicyModal checkbox gate — clicking Continue with unchecked policy never advances step**
    - **Validates: Requirements 8.3, 9.3**
  - [ ] 6.3 Rename DangerZonePage to PrivacyPage and wire PolicyModal
    - Rename the component to `PrivacyPage`; update title to "Privacy & Account Control"
    - Replace the existing inline deactivation form with two action cards: "Deactivate Account" and "Delete Account"
    - Each card opens `<PolicyModal>` with the appropriate `action` prop
    - In `onConfirmed`: call `logout()` then `navigate("/auth")`
    - _Requirements: 7.1, 7.2, 7.3, 8.1, 9.1_

- [x] 7. Verify PasswordPage strength checklist
  - Confirm the existing `pwdRules` checklist renders pass/fail per rule while typing in the new password field
  - If the checklist is only shown when `newPwd.length > 0`, ensure it appears immediately on first keystroke
  - Ensure form submission is blocked when any rule fails or confirm password doesn't match
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ]* 7.1 Write property test for password rule checklist
    - **Property 6: each rule indicator shows pass iff the rule predicate returns true for that input**
    - **Validates: Requirements 5.1**

- [x] 8. Verify SupportPage settings integration
  - Confirm `SupportPage` reads `supportEmail` and `supportPhone` from `SettingsContext` and falls back to defaults when not configured
  - Confirm quick links to `/faq`, `/shipping-policy`, and `/returns` are present
  - _Requirements: 6.1, 6.2, 6.3, 6.4_
  - [ ]* 8.1 Write property test for SupportPage settings rendering
    - **Property 7: SupportPage renders exact email and phone from SettingsContext**
    - **Validates: Requirements 6.1, 6.2**

- [x] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use `fast-check` as specified in the design
- The route `/account/danger` is preserved for backward compatibility; only the displayed label changes
- `deleteAccount` must send a discriminator so the backend applies permanent deletion, not deactivation
