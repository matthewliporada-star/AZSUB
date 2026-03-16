# CIS Sections Integration TODO

Current status: Plan approved. Connecting all missing sections into CIS.jsx.

**Completed:**

- [x] Analyzed file structure (20+ section components identified)
- [x] Read CIS.jsx (8 sections already imported/rendered)
- [x] Sampled missing sections (BankDetails, PropertyDetails, SpouseDetails, AssetsLiabilities)
- [x] User confirmed plan

**Todo Steps:**

1. [x] Add states & handlers for SpouseDetails, BankDetails in CIS.jsx
2. [x] Import & render SpouseDetails, BankDetails after existing sections
3. [x] Add states & handlers for PropertyDetails, AssetsLiabilities
4. [x] Import & render PropertyDetails, AssetsLiabilities
5. Identify & connect remaining sections (PersonalIncome, PolicyBeneficiary, etc.)
6. Extend handleSubmit with inserts for new tables (bank_details, property_details, spouse_details, assets_liabilities, etc.)
7. Update form reset for new states
8. Test: Run dev server, check rendering/submission
9. Update TODO with completions
10. attempt_completion

**Next:** Step 1-2
