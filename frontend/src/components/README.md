# Frontend — UI Components Layer

## 🎯 Purpose of this Package
Reusable React presentational and interactive UI components built with Tailwind CSS, Lucide icons, and Framer Motion.

---

## 📄 Key Files in this Package

### 1. `DocumentPaperViewer.tsx`
- **Why it is used**: High-end interactive document inspection viewer. Renders student submitted papers with sentence-level interactive highlights (red for high AI probability, amber for similarity matches, green for authentic student writing). Clicking a sentence displays the exact AI score and explanation card.

### 2. `SentenceHighlighter.tsx`
- **Why it is used**: Parses raw text into color-coded sentence blocks based on ML inference thresholds.

### 3. `ScoreGauge.tsx`
- **Why it is used**: Radial and linear animated progress gauges displaying overall AI content and plagiarism similarity scores.

### 4. `FileUpload.tsx`
- **Why it is used**: Drag-and-drop file upload zone supporting `.pdf`, `.docx`, `.txt`, and code files with real-time file size and type validation.

### 5. `Navbar.tsx`
- **Why it is used**: Main navigation bar with role-aware tabs (`Student`, `Faculty`, `Admin`), user profile dropdown, and real-time notification bell.

### 6. `ProtectedRoute.tsx`
- **Why it is used**: Route guard that checks if the user is authenticated and possesses the required role before granting access to dashboard views.

### 7. `SubmissionCelebrationModal.tsx` & `ConfirmModal.tsx`
- **Why it is used**: Interactive modal dialogs for submission confirmation and destructive actions (e.g. deleting an assignment).
