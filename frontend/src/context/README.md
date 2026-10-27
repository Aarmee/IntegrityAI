# Frontend — React State Context Layer

## 🎯 Purpose of this Package
Global application state management using React Context API. Eliminates prop drilling across components for user authentication, toast alerts, and real-time notifications.

---

## 📄 Files in this Package

### 1. `AuthContext.tsx`
- **Why it is used**: Stores authenticated user state, JWT token, user roles, and login/logout methods. Persists session state across page refreshes via `localStorage`.

### 2. `NotificationContext.tsx`
- **Why it is used**: Manages unread notification counts, polling for new alerts, and marking notifications as read in real-time.

### 3. `ToastContext.tsx`
- **Why it is used**: Application-wide toast notification system displaying success, warning, and error toast banners.
