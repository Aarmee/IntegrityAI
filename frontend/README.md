# IntegrityAI — Unified Frontend

A unified, role-based single-page application (SPA) for the **IntegrityAI Microservices Academic Integrity & Plagiarism Analysis Platform**.

---

## 🏛 Architecture Decision: Single Unified Frontend

In accordance with the system design, the application does not use fractured micro-frontends. Instead, it utilizes **one unified frontend** that:
- Connects exclusively to the **API Gateway** (`http://localhost:8080`)
- Never calls individual microservices directly
- Provides role-aware views and client-side guards for **STUDENT**, **FACULTY**, and **ADMIN**
- Automatically attaches JWT Bearer tokens to all requests via Axios interceptors
- Manages real-time notifications with unread badge polling

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** |
| Tooling & Bundler | **Vite** |
| Language | **TypeScript** |
| Routing & Guards | **React Router v6** |
| HTTP Client | **Axios** (with JWT Interceptor & 401 handler) |
| Styling | **Tailwind CSS v4** |
| Icons | **Lucide React** |
| Token Parsing | **jwt-decode** |

---

## 📄 Complete Pages Implemented (19 Total)

### Public (No Auth Required)
1. **Login Page (`/login`)**: Email & password authentication with role-based redirection and 1-click demo presets.
2. **Register Page (`/register`)**: Name, email, password, and role selector (`STUDENT` / `FACULTY`).

### Shared Authenticated Views
3. **Dashboard / Home (`/dashboard`)**:
   - **Student View**: Submissions count, latest report score, unread alerts, recent submissions list, quick submit button.
   - **Faculty View**: Active assignments count, total submissions received, assignment catalog, recent student submissions.
   - **Admin View**: Central system statistics, connected microservice topology, and recent evaluations.
4. **Notification Center (`/notifications`)**: Real-time event notifications (`SUBMISSION_RECEIVED`, `REPORT_READY`, `ANALYSIS_COMPLETE`), mark as read, mark all as read, and delete actions.
5. **Profile Page (`/profile`)**: User information from JWT claims & `GET /api/users/{userId}`, role pill, and API Gateway connection verification.

### Student Pages
6. **My Submissions (`/student/submissions`)**: Tabular view of student uploads, submission status badges (`UPLOADED`, `PROCESSING`, `COMPLETED`, `FAILED`), and links to integrity reports.
7. **Submit File (`/student/submit`)**: Dropdown selection of course assignments, assignment details preview, drag-and-drop file uploader (supports PDF, DOCX, ZIP, Python, Java, C++, JS, TS), and upload progress tracking.
8. **View My Report (`/reports/:submissionId`)**: Plagiarism similarity score gauge, AI detection score gauge, executive summary, segment breakdown findings, and print/export PDF support.

### Faculty Pages
9. **My Assignments (`/faculty/assignments`)**: Course assignments created by the faculty member, deadlines, student submission counts, and action buttons.
10. **Create Assignment (`/faculty/assignments/new`)**: Assignment title, subject code, description, and datetime picker deadline.
11. **Edit Assignment (`/faculty/assignments/edit/:assignmentId`)**: Pre-populated modification form for existing assignments.
12. **Delete Assignment**: Accessible confirmation modal with safe deletion.
13. **Assignment Submissions (`/faculty/assignments/:assignmentId/submissions`)**: List of all student submissions under the selected assignment.
14. **View Report (Faculty) (`/reports/:submissionId`)**: Inspection of student submissions with score gauges and AI summaries.
15. **Generate Report Trigger**: Direct action on submissions without an evaluation to trigger `POST /api/reports` and display results.

### Admin Pages
16. **User Management (`/admin/users`)**: System-wide user directory calling the backend `GET /api/users` endpoint, with role filtering and search.
17. **All Submissions (`/admin/submissions`)**: System-wide submission inventory calling `GET /api/submissions` with status filtering.
18. **All Reports (`/admin/reports`)**: System-wide integrity evaluation list with high-plagiarism (≥50%) and high-AI (≥70%) filters.
19. **System Overview (`/admin/overview`)**: High-level platform health, counts of users/assignments/submissions/reports/flagged items, and microservices port mappings.

---

## 🧩 Shared Components

- **Navbar**: Brand header, dynamic role navigation, unread notification counter badge with pulse indicator, and user profile/sign out menu.
- **ProtectedRoute & RoleGuard**: Route wrappers enforcing JWT authentication and user role authorizations.
- **ScoreGauge**: Visual circular & linear gauges featuring green (<20%), amber (20–50%), and red (>50%) integrity thresholds.
- **StatusBadge**: Color-coded badges for `UPLOADED`, `PROCESSING`, `COMPLETED`, and `FAILED` states.
- **FileUpload**: Drag-and-drop zone with file type validation, file size limits (50MB), and progress bar.
- **ConfirmModal**: Accessible dialog for destructive actions like assignment removal.
- **LoadingSpinner & TableSkeleton**: Polished feedback during asynchronous API requests.
- **ToastProvider**: Responsive notifications for success, error, warning, and informational feedback.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Ensure `.env` points to the running API Gateway:
```env
VITE_API_GATEWAY_URL=http://localhost:8080
```

### 3. Run Development Server
```bash
npm run dev
```
The application will launch at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
Generates optimized static assets in `dist/`.

---

## 🔑 Demo Logins

The login page provides one-click credentials for instant testing:
- **Student**: `student@example.com` / `password123`
- **Faculty**: `faculty@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
*(Or register a new account on `/register`)*
