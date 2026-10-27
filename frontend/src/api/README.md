# Frontend — API Client Layer

## 🎯 Purpose of this Package
Centralizes all HTTP network requests from the React single-page application (SPA) to the backend. Configures Axios with global request/response interceptors and dynamic environment resolution.

---

## 📄 Files in this Package

### 1. `axios.ts`
- **Why it is used**: Configures the shared Axios instance (`apiClient`).
- **Key Features**:
  - **Dynamic Gateway BaseURL**: Automatically routes to `http://localhost:8080` in local development and `https://integrityai-gateway.onrender.com` in cloud environments.
  - **Request Interceptor**: Automatically pulls the JWT token from `localStorage` and attaches `Authorization: Bearer <token>` to every outgoing request.
  - **Response Interceptor**: Intercepts `401 Unauthorized` responses and cleanly redirects expired sessions to `/login?session_expired=true`.
  - **`getErrorMessage()`**: Translates technical SQL, HTTP, or validation exceptions into user-friendly notifications.

### 2. `authApi.ts`
- Exposes `login()`, `register()`, `updateProfile()`, and `getUserById()`.

### 3. `assignmentApi.ts`
- Exposes `createAssignment()`, `getAllAssignments()`, `getAssignmentById()`, and `deleteAssignment()`.

### 4. `submissionApi.ts`
- Exposes `submitAssignment()` (multipart file upload with progress tracking), `getStudentSubmissions()`, and `getSubmissionById()`.

### 5. `reportApi.ts`
- Exposes `getReportBySubmissionId()`, `getAllReports()`, and `reviewReport()`.

### 6. `notificationApi.ts`
- Exposes `getUserNotifications()`, `markAsRead()`, and `markAllAsRead()`.
