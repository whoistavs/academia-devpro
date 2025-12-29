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
    *   Create separate translation keys or conditional logic to load the correct legal text based on the user's locale.
    *   Ensure the "Terms" and "Privacy" pages render the appropriate legal clauses.
    *   Update the `i18n` JSON files with verified legal texts in each language.

3.  **Validation**:
    *   Verify that users in different regions see the laws applicable to them (or at least the language-appropriate laws).

## Current State
*   All languages currently use the Portuguese (Brazil) text for Terms and Privacy to ensure the "demo" nature is clear and to avoid incorrect legal advice in other languages until properly translated/localized.
