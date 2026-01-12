---
description: Implement country-specific legal terms and privacy policies
---

# Future Task: International Legal Compliance

## Objective
Implement specific Terms of Use and Privacy Policies for each supported country/language, replacing the current placeholder (Portuguese LGPD) texts.

## Requirements
1.  **Research**:
    *   **GDPR (Europe)**: For English, French, German, Portuguese (PT).
    *   **CCPA (USA/California)**: For English (US).
    *   **LGPD (Brazil)**: Already implemented for PT-BR.
    *   **China**: Specific internet regulations.
    *   **Middle East**: Applicable laws for Arabic speaking regions.


2.  **Implementation**:
    *   [x] Create separate translation keys or conditional logic to load the correct legal text based on the user's locale. (Refactored `lgpd` keys to `legal`)
    *   [x] Ensure the "Terms" and "Privacy" pages render the appropriate legal clauses.
    *   [x] Update the `i18n` JSON files with verified legal texts in each language. (Completed for English, others migrated to `legal` key)

3.  **Validation**:
    *   [x] Verify that users in different regions see the laws applicable to them (English users see GDPR/CCPA, others see generic/LGPD for now).

## Current State
*   **English**: Updated to include GDPR and CCPA compliance text.
*   **Portuguese (PT/BR)**: Retains specific LGPD text.
*   **Other Languages**: Migrated to `legal` key structure but currently using translated LGPD text. Needs specific legal localization for DE, FR, ZH, AR.
