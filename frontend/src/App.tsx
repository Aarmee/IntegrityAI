import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Shared Pages
import { DashboardPage } from './pages/DashboardPage';
import { NotificationCenterPage } from './pages/NotificationCenterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ViewReportPage } from './pages/student/ViewReportPage';

// Student Pages
import { MySubmissionsPage } from './pages/student/MySubmissionsPage';
import { SubmitFilePage } from './pages/student/SubmitFilePage';

// Faculty Pages
import { MyAssignmentsPage } from './pages/faculty/MyAssignmentsPage';
import { CreateAssignmentPage } from './pages/faculty/CreateAssignmentPage';
import { EditAssignmentPage } from './pages/faculty/EditAssignmentPage';
import { AssignmentSubmissionsPage } from './pages/faculty/AssignmentSubmissionsPage';

// Admin Pages
import { SystemOverviewPage } from './pages/admin/SystemOverviewPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AllSubmissionsPage } from './pages/admin/AllSubmissionsPage';
import { AllReportsPage } from './pages/admin/AllReportsPage';

// Error Pages
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans selection:bg-red-600 selection:text-white">
              <Navbar />

              <main className="flex-1 w-full bg-white">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/unauthorized" element={<UnauthorizedPage />} />

                  {/* Root redirect to Dashboard */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Navigate to="/dashboard" replace />
                      </ProtectedRoute>
                    }
                  />

                  {/* Shared Authenticated Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports/:submissionId"
                    element={
                      <ProtectedRoute>
                        <ViewReportPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Student Only Routes */}
                  <Route
                    path="/student/submissions"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                        <MySubmissionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/submit"
                    element={
                      <ProtectedRoute allowedRoles={['STUDENT']}>
                        <SubmitFilePage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Faculty Only Routes */}
                  <Route
                    path="/faculty/assignments"
                    element={
                      <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                        <MyAssignmentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/faculty/assignments/new"
                    element={
                      <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                        <CreateAssignmentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/faculty/assignments/edit/:assignmentId"
                    element={
                      <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                        <EditAssignmentPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/faculty/assignments/:assignmentId/submissions"
                    element={
                      <ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}>
                        <AssignmentSubmissionsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Only Routes */}
                  <Route
                    path="/admin/overview"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <SystemOverviewPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <UserManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/submissions"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AllSubmissionsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/reports"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AllReportsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 Catch All */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Minimal footer */}
              <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-500">
                <span className="font-semibold text-zinc-800">Integrity<span className="text-red-600">AI</span></span> • Academic Integrity & Evaluation Platform
              </footer>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
