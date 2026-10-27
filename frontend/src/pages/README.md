# Frontend — Application Pages Layer

## 🎯 Purpose of this Package
Contains top-level route views rendered by React Router v6. Organized into role-specific sub-folders for Students, Faculty, and Administrators.

---

## 📄 Key Pages in this Package

### Public & Common Pages
- `LoginPage.tsx`: Authentication screen with role selector and demo credentials quick-fill.
- `RegisterPage.tsx`: Student and faculty onboarding form.
- `DashboardPage.tsx`: Role-based landing dashboard showing active assignments, recent submissions, and quick stats.
- `ProfilePage.tsx`: User profile management.
- `NotificationCenterPage.tsx`: Full notification inbox.

### Student Sub-pages (`pages/student/`)
- `SubmitFilePage.tsx`: File upload interface with live preview and assignment selection.
- `MySubmissionsPage.tsx`: Student submission history with real-time status badges (`PENDING`, `COMPLETED`, `FLAGGED`).
- `ViewReportPage.tsx`: Comprehensive audit report with `DocumentPaperViewer` and sentence breakdown.

### Faculty Sub-pages (`pages/faculty/`)
- `CreateAssignmentPage.tsx`: Assignment creation form with due date picker and similarity threshold sliders.
- `MyAssignmentsPage.tsx`: List of active assignments managed by the logged-in professor.
- `AssignmentSubmissionsPage.tsx`: Class roster submissions review table for grading and plagiarism auditing.

### Admin Sub-pages (`pages/admin/`)
- `SystemOverviewPage.tsx`: Health and topology overview of all microservices.
- `AllSubmissionsPage.tsx` / `AllReportsPage.tsx`: Global audit logs across the institution.
- `UserManagementPage.tsx`: Account management and role provisioning.
