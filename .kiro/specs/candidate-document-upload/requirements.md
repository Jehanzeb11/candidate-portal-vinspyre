# Requirements Document

## Introduction

This document describes the **Candidate Document Upload** feature for the Vinspyre candidate portal (Next.js frontend). After a candidate's job offer has been accepted by HR, the candidate enters the "documents" stage of the recruitment pipeline and must upload three mandatory onboarding documents — CNIC, Payslip, and Utility Bill — via a structured form. The feature replaces the existing generic multi-file drop zone (`DocumentsUploadSection`) with a new dedicated, field-specific upload UI backed by `POST /api/v1/recruitment/candidate-profile/documents`.

## Glossary

- **Candidate_Portal**: The Next.js web application used by job candidates to track their recruitment progress and submit required documents.
- **Document_Upload_Form**: The UI component that presents three named upload slots (CNIC, Payslip, Bill) and submits them as a single `multipart/form-data` request.
- **Upload_Hook**: The custom React hook (`useDocumentUpload`) that manages form state, validation, and the API call for document submission.
- **Offer_Gate**: The backend enforcement that returns `403 Forbidden` when a candidate attempts to upload documents without an accepted offer.
- **CandidateProfile**: The profile object stored in the Zustand auth store; contains `recruitmentProgress`, `offerAccess`, and `candidateDocumentSubmissions`.
- **offerAccess**: A sub-object on `CandidateProfile` with the boolean field `canUploadDocuments` that indicates whether the backend will accept a document submission.
- **CNIC**: Computerised National Identity Card — one of the three required documents (PDF or image).
- **Payslip**: A recent pay slip document (PDF or image).
- **Bill**: A recent utility bill document (PDF or image).
- **ApiError**: The typed error class thrown by `apiFetch` that exposes a numeric `status` field.
- **Documents_Stage**: The recruitment pipeline stage with key `"documents"` as represented in `recruitmentProgress.stages`.
- **Submission_Success_State**: The UI state rendered after a successful upload, replacing the form with a confirmation message.

---

## Requirements

### Requirement 1: Dedicated Three-Field Document Upload Form

**User Story:** As a candidate in the documents stage, I want to upload my CNIC, Payslip, and Utility Bill through clearly labelled, individual file slots, so that I know exactly which document belongs in which slot and cannot accidentally mix them up.

#### Acceptance Criteria

1. THE `Document_Upload_Form` SHALL render three distinct, labelled upload slots: one for CNIC, one for Payslip, and one for Bill.
2. WHEN a candidate selects a file for a slot, THE `Document_Upload_Form` SHALL display the selected file's name and size within that slot.
3. WHEN a candidate activates the remove control on a selected file, THE `Document_Upload_Form` SHALL clear that slot and return it to its empty state without affecting the other two slots.
4. THE `Document_Upload_Form` SHALL accept files of type `application/pdf`, `image/jpeg`, `image/png`, and `image/webp` in each slot.
5. IF a candidate selects a file whose MIME type is not in `[application/pdf, image/jpeg, image/png, image/webp]`, THEN THE `Document_Upload_Form` SHALL display an inline validation error for that slot and reject the file.
6. IF a candidate selects a file larger than 10 MB, THEN THE `Document_Upload_Form` SHALL display an inline validation error for that slot and reject the file.
7. THE `Document_Upload_Form` SHALL support drag-and-drop file selection for each individual upload slot.

---

### Requirement 2: Submit Button Guarded by Complete Selection

**User Story:** As a candidate, I want the submit button to clearly indicate when I can submit, so that I do not attempt an upload that the backend will reject due to missing files.

#### Acceptance Criteria

1. WHILE one or more upload slots are empty, THE `Document_Upload_Form` SHALL render the submit button in a disabled state.
2. WHEN all three slots contain valid files and no slot has a validation error, THE `Document_Upload_Form` SHALL render the submit button in an enabled state.
3. WHILE a submission request is in progress, THE `Document_Upload_Form` SHALL render the submit button with a loading indicator and prevent a second submission.
4. THE `Document_Upload_Form` SHALL send a single `POST` request to `ENDPOINTS.UPLOAD_DOCUMENTS` (`/recruitment/candidate-profile/documents`) with form fields `cnic`, `payslip`, and `bill` as a `multipart/form-data` body.
5. THE `Document_Upload_Form` SHALL include the `Authorization: Bearer <token>` header, sourced from the Zustand auth store, on every submission request.

---

### Requirement 3: Offer Gate — 403 Error Handling

**User Story:** As a candidate, I want to receive a clear explanation when the system rejects my upload because my offer is not yet accepted, so that I know what action is needed and am not confused by a generic failure.

#### Acceptance Criteria

1. IF the submission request returns HTTP 403, THEN THE `Upload_Hook` SHALL surface an error message that informs the candidate that an accepted offer is required before documents can be uploaded.
2. IF the submission request returns HTTP 403, THEN THE `Document_Upload_Form` SHALL remain visible with the previously selected files intact so the candidate does not have to re-select them.
3. IF the submission request returns HTTP 400, THEN THE `Upload_Hook` SHALL surface the backend's error message verbatim (e.g., `"Please upload required documents: bill"`) as an inline form-level error.

---

### Requirement 4: Success State After Upload

**User Story:** As a candidate, I want to see a clear confirmation after successfully uploading my documents, so that I know my submission was received and what happens next.

#### Acceptance Criteria

1. WHEN the submission request returns HTTP 200, THE `Document_Upload_Form` SHALL transition to the `Submission_Success_State` and replace the upload form with a confirmation message.
2. WHEN THE `Document_Upload_Form` transitions to the `Submission_Success_State`, THE `Candidate_Portal` SHALL invoke the `onSuccess` callback prop so the parent component can trigger a profile refresh via `refetch()`.
3. THE `Submission_Success_State` SHALL display a message indicating that the HR team will review the documents.

---

### Requirement 5: Dashboard Integration — Documents Stage Gate

**User Story:** As a candidate in the documents stage, I want the document upload form to appear contextually on the dashboard only when it is relevant, so that I am not shown upload controls at stages where they do not apply.

#### Acceptance Criteria

1. WHILE `recruitmentProgress.currentStage` equals `"documents"` AND `offerAccess.canUploadDocuments` is `true` AND no prior successful submission exists in `candidateDocumentSubmissions`, THE `Candidate_Portal` dashboard SHALL render the `Document_Upload_Form`.
2. WHILE `offerAccess.canUploadDocuments` is `false` or the documents stage is marked `"done"` or `"submitted"`, THE `Candidate_Portal` dashboard SHALL NOT render the `Document_Upload_Form` upload controls.
3. WHEN the `Document_Upload_Form` transitions to `Submission_Success_State`, THE `Candidate_Portal` dashboard SHALL call `refetch()` to reload the `CandidateProfile` so that the documents stage status updates without a full page reload.

---

### Requirement 6: Endpoint and Type Registration

**User Story:** As a developer, I want all API endpoints and TypeScript types for document upload to be registered in the project's central files, so that they are discoverable, type-safe, and consistent with the existing codebase conventions.

#### Acceptance Criteria

1. THE `Candidate_Portal` SHALL register the document upload endpoint as `UPLOAD_DOCUMENTS: "/recruitment/candidate-profile/documents"` in `src/server/Endpoints.ts`.
2. THE `Candidate_Portal` SHALL define a `DocumentUploadPayload` interface in `src/types/candidate.types.ts` representing the three named file fields (`cnic`, `payslip`, `bill`).
3. THE `Candidate_Portal` SHALL define a `DocumentUploadResponse` interface in `src/types/candidate.types.ts` representing the success response shape from the backend.
4. THE `CandidateDocumentSubmission` type in `src/types/candidate.types.ts` SHALL be updated so the `documents` field is typed as `{ cnic: string; payslip: string; bill: string }` rather than `string[]`, reflecting the structured JSON the backend stores.

---

### Requirement 7: Accessibility

**User Story:** As a candidate using a keyboard or screen reader, I want the document upload form to be fully operable without a mouse, so that the portal is accessible to all candidates.

#### Acceptance Criteria

1. THE `Document_Upload_Form` SHALL assign an accessible `aria-label` to each upload slot that identifies the expected document (e.g., `"Upload CNIC document"`).
2. THE `Document_Upload_Form` SHALL associate each file input with a visible `<label>` element using `htmlFor` / `id` linkage or `aria-labelledby`.
3. WHEN a validation error is present for a slot, THE `Document_Upload_Form` SHALL link the error message to the relevant input via `aria-describedby`.
4. THE `Document_Upload_Form` SHALL be fully operable using keyboard navigation alone, including activating upload slots via the Enter and Space keys.
5. THE `Document_Upload_Form` SHALL provide visible focus indicators on all interactive elements that meet WCAG 2.1 AA contrast requirements.
