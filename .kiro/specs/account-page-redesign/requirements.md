# Requirements Document

## Introduction

This document defines the requirements for the Account Page Redesign feature. The redesign updates `client/src/pages/User/Account.tsx` and its sub-pages to improve visual consistency, UX patterns, and safety around destructive account actions. Key changes include: a cleaner Account Hub hero, an image preview grid for avatar uploads, a modal-based address form with inline validation, an email verification flow, and a renamed "Privacy & Account Control" sub-page with a two-step policy-gated flow for both account deactivation and permanent deletion — each with a 30-day grace period before final purge.

---

## Glossary

- **AccountHub**: The landing screen at `/account` showing the user's identity, navigation cards, and sign-out action.
- **ProfilePage**: The sub-page at `/account/profile` for editing personal details and uploading an avatar.
- **AddressModal**: The modal overlay used for both adding and editing a saved delivery address.
- **PasswordPage**: The sub-page at `/account/password` for changing the account password.
- **SupportPage**: The sub-page at `/account/support` showing contact details and quick links.
- **PrivacyPage**: The sub-page at `/account/danger` (renamed label: "Privacy & Account Control") for account deactivation and deletion.
- **PolicyModal**: The multi-step modal opened from PrivacyPage that gates destructive actions behind policy acceptance and password confirmation.
- **ImagePreviewGrid**: A UI component shown below the avatar circle after a file is selected, displaying the chosen image with a remove option.
- **AuthContext**: The React context providing `user`, `logout()`, and `updateUser()` to all sub-pages.
- **AccountService**: The `accountService.ts` module providing API calls for profile, addresses, password, and account lifecycle actions.
- **Grace_Period**: The 30-day window after a deactivation or deletion request during which the user may log back in to cancel the action.

---

## Requirements

### Requirement 1: Account Hub

**User Story:** As a customer, I want a clean account landing page that shows my identity and lets me navigate to all account sections, so that I can quickly find what I need.

#### Acceptance Criteria

1. THE AccountHub SHALL display the authenticated user's avatar, name, and email in the hero banner.
2. THE AccountHub SHALL render exactly six navigation cards linking to: Account Info, My Orders, Addresses, Password & Security, Help & Support, and Privacy & Account Control.
3. THE AccountHub SHALL provide a Sign Out button that calls `AuthContext.logout()` when clicked.
4. WHEN the user is not authenticated, THE AccountHub SHALL redirect to `/auth`.
5. THE AccountHub SHALL NOT display phone number, gender, or date of birth pills in the hero banner.
6. THE AccountHub SHALL NOT display an "Edit Profile" button in the hero banner.

---

### Requirement 2: Profile Page — Avatar Upload & Preview

**User Story:** As a customer, I want to preview my chosen profile photo before saving it, so that I can confirm my selection without committing immediately.

#### Acceptance Criteria

1. WHEN a user selects an image file via the camera icon, THE ProfilePage SHALL display an `ImagePreviewGrid` below the avatar circle showing the selected image.
2. THE ImagePreviewGrid SHALL provide a remove button that clears the selected file and hides the preview grid.
3. WHEN the user clicks "Save Changes" with a selected file, THE ProfilePage SHALL upload the file via `AccountService.updateProfile(FormData)`.
4. WHEN the upload succeeds, THE ProfilePage SHALL replace the preview with the saved avatar URL returned by the API.
5. WHEN the ProfilePage unmounts, THE ProfilePage SHALL revoke any active `createObjectURL` preview to prevent memory leaks.

---

### Requirement 3: Profile Page — Email & Verification

**User Story:** As a customer, I want to see my email address on the profile page and be able to trigger email verification, so that I know my contact details are confirmed.

#### Acceptance Criteria

1. THE ProfilePage SHALL display the user's email address in a read-only input field.
2. THE ProfilePage SHALL render a "Verify" button adjacent to the email field.
3. WHEN the user clicks "Verify", THE ProfilePage SHALL call the email verification API and display a confirmation message "Verification email sent".
4. IF the email verification API call fails, THEN THE ProfilePage SHALL display an inline error message.
5. WHILE the verification request is in flight, THE ProfilePage SHALL disable the "Verify" button.
6. THE ProfilePage SHALL NOT allow the user to edit the email field.

---

### Requirement 4: Address Management — Modal Flow

**User Story:** As a customer, I want to add and edit delivery addresses in a modal overlay with inline validation, so that I get clear feedback without leaving the addresses page.

#### Acceptance Criteria

1. WHEN the user clicks "Add New Address", THE AddressesPage SHALL open the AddressModal in `add` mode.
2. WHEN the user clicks the edit icon on an existing address, THE AddressesPage SHALL open the AddressModal in `edit` mode pre-populated with that address's data.
3. THE AddressModal SHALL validate `line1` as non-empty and at least 5 characters; IF the value is invalid, THEN THE AddressModal SHALL display an inline error below the field.
4. THE AddressModal SHALL validate `city` as non-empty and containing only letters and spaces; IF the value is invalid, THEN THE AddressModal SHALL display an inline error below the field.
5. THE AddressModal SHALL validate `state` as non-empty and containing only letters and spaces; IF the value is invalid, THEN THE AddressModal SHALL display an inline error below the field.
6. THE AddressModal SHALL validate `zip` as exactly 6 digits; IF the value is invalid, THEN THE AddressModal SHALL display an inline error below the field.
7. WHEN the user submits the form with one or more invalid fields, THE AddressModal SHALL display all applicable inline errors and SHALL NOT call the API.
8. WHEN the API call succeeds, THE AddressModal SHALL close and THE AddressesPage SHALL update the address list without a full page reload.
9. IF the API call fails, THEN THE AddressModal SHALL display an inline error message and SHALL remain open.

---

### Requirement 5: Password Page

**User Story:** As a customer, I want real-time feedback on my new password's strength as I type, so that I can create a password that meets all security requirements.

#### Acceptance Criteria

1. WHILE the user is typing in the new password field, THE PasswordPage SHALL display a checklist showing pass/fail status for each password rule: minimum 6 characters, no spaces, uppercase letter, lowercase letter, one number, one special character.
2. WHEN the user submits the form and the new password fails any rule, THE PasswordPage SHALL display an error and SHALL NOT call the API.
3. WHEN the user submits the form and the confirm password does not match the new password, THE PasswordPage SHALL display an error and SHALL NOT call the API.
4. WHEN the password change API call succeeds, THE PasswordPage SHALL display a success message and clear all password fields.
5. IF the password change API call fails, THEN THE PasswordPage SHALL display the error message returned by the API.

---

### Requirement 6: Help & Support Page

**User Story:** As a customer, I want to see contact details and quick links to help resources, so that I can get support without searching the site.

#### Acceptance Criteria

1. THE SupportPage SHALL display the support email address sourced from `SettingsContext`.
2. THE SupportPage SHALL display the support phone number sourced from `SettingsContext`.
3. THE SupportPage SHALL render quick links to FAQ (`/faq`), Shipping Policy (`/shipping-policy`), and Returns & Refunds (`/returns`).
4. WHERE a support email or phone is not configured in `SettingsContext`, THE SupportPage SHALL display a default fallback value.

---

### Requirement 7: Privacy & Account Control — Page Rename

**User Story:** As a customer, I want the account control section to have a clear, non-alarming label, so that I understand what actions are available without feeling intimidated.

#### Acceptance Criteria

1. THE PrivacyPage SHALL display the title "Privacy & Account Control".
2. THE PrivacyPage SHALL be accessible at the existing route `/account/danger` for backward compatibility.
3. THE PrivacyPage SHALL render two distinct action cards: one for "Deactivate Account" and one for "Delete Account".

---

### Requirement 8: Privacy & Account Control — Deactivation Flow

**User Story:** As a customer, I want to deactivate my account with a clear explanation of what happens, so that I can take a break without accidentally losing my data.

#### Acceptance Criteria

1. WHEN the user clicks "Deactivate Account", THE PrivacyPage SHALL open the PolicyModal with `action="deactivate"`.
2. THE PolicyModal SHALL display the deactivation policy: the account will go dormant, the user may log back in within 30 days to reactivate, and after 30 days the account and all data will be permanently deleted.
3. WHILE the policy checkbox is unchecked, THE PolicyModal SHALL keep the "Continue" button disabled and SHALL NOT advance to the password confirmation step.
4. WHEN the user checks the policy checkbox, THE PolicyModal SHALL enable the "Continue" button.
5. WHEN the user clicks "Continue" with the checkbox checked, THE PolicyModal SHALL advance to the password confirmation step.
6. WHEN the user submits the correct password, THE PolicyModal SHALL call the deactivation API, then call `AuthContext.logout()`, then redirect to `/auth`.
7. IF the API returns a 401 or 403 response, THEN THE PolicyModal SHALL display "Incorrect password. Please try again." below the password field.
8. IF the API call fails due to a network error, THEN THE PolicyModal SHALL display an inline error and re-enable the confirm button.
9. THE PolicyModal confirm button label SHALL be "Deactivate My Account".

---

### Requirement 9: Privacy & Account Control — Deletion Flow

**User Story:** As a customer, I want to permanently delete my account with a clear warning and a recovery window, so that I can make an informed decision and have a chance to cancel if I change my mind.

#### Acceptance Criteria

1. WHEN the user clicks "Delete Account", THE PrivacyPage SHALL open the PolicyModal with `action="delete"`.
2. THE PolicyModal SHALL display the deletion policy: a 30-day grace period begins immediately; the user may log back in within 30 days to cancel; after 30 days all account data will be permanently and irrecoverably wiped.
3. WHILE the policy checkbox is unchecked, THE PolicyModal SHALL keep the "Continue" button disabled and SHALL NOT advance to the password confirmation step.
4. WHEN the user checks the policy checkbox, THE PolicyModal SHALL enable the "Continue" button.
5. WHEN the user clicks "Continue" with the checkbox checked, THE PolicyModal SHALL advance to the password confirmation step.
6. WHEN the user submits the correct password, THE PolicyModal SHALL call the deletion API (distinct from the deactivation API), then call `AuthContext.logout()`, then redirect to `/auth`.
7. IF the API returns a 401 or 403 response, THEN THE PolicyModal SHALL display "Incorrect password. Please try again." below the password field.
8. IF the API call fails due to a network error, THEN THE PolicyModal SHALL display an inline error and re-enable the confirm button.
9. THE PolicyModal confirm button label SHALL be "Permanently Delete Account".

---

### Requirement 10: Grace Period Enforcement

**User Story:** As a customer, I want my account to remain recoverable for 30 days after I request deactivation or deletion, so that I have time to change my mind.

#### Acceptance Criteria

1. WHEN a deactivation request is submitted, THE AccountService SHALL record a `scheduledDeletionAt` timestamp 30 days in the future.
2. WHEN a deletion request is submitted, THE AccountService SHALL record a `scheduledDeletionAt` timestamp 30 days in the future.
3. WHILE the Grace_Period has not elapsed, THE System SHALL allow the user to log back in and cancel the pending action, restoring the account to active status.
4. WHEN the Grace_Period elapses, THE System SHALL permanently and irrecoverably delete all account data.
5. THE AccountService SHALL expose a `deleteAccount(password: string)` function distinct from `deactivateAccount(password: string)` to allow the backend to apply the correct lifecycle action.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: AccountHub always renders user identity

*For any* authenticated user object, the AccountHub rendered output shall contain the user's name and email.

**Validates: Requirements 1.1**

---

### Property 2: Address line1 validation rejects short strings

*For any* string with fewer than 5 characters (including the empty string), the `line1` validator shall return an error.

**Validates: Requirements 4.3**

---

### Property 3: Address city/state validation rejects non-alpha strings

*For any* string containing at least one digit or special character, the city and state validators shall each return an error.

**Validates: Requirements 4.4, 4.5**

---

### Property 4: Address zip validation rejects non-6-digit strings

*For any* string that is not exactly 6 ASCII digits, the zip validator shall return an error.

**Validates: Requirements 4.6**

---

### Property 5: PolicyModal checkbox gate

*For any* PolicyModal state where `policyAccepted` is `false`, clicking the "Continue" button shall not advance `step` from `"policy"` to `"confirm"`.

**Validates: Requirements 8.3, 9.3**

---

### Property 6: Password rule checklist reflects input

*For any* password string, each rule indicator in the PasswordPage checklist shall show "pass" if and only if the corresponding rule predicate returns `true` for that string.

**Validates: Requirements 5.1**

---

### Property 7: SupportPage renders settings values

*For any* `SettingsContext` value containing a support email and phone, the SupportPage rendered output shall contain those exact values.

**Validates: Requirements 6.1, 6.2**

---

### Property 8: Grace period scheduling

*For any* deactivation or deletion request submitted at time T, the recorded `scheduledDeletionAt` value shall equal T + 30 days.

**Validates: Requirements 10.1, 10.2**
