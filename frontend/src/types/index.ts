export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  rollNumber?: string;
  phoneNumber?: string;
  course?: string;
  semester?: string;
  department?: string;
  assignedCourses?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  token: string;
  message: string;
  userId?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  rollNumber?: string;
  phoneNumber?: string;
  course?: string;
  semester?: string;
  department?: string;
  assignedCourses?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  rollNumber?: string;
  phoneNumber?: string;
  course?: string;
  semester?: string;
  department?: string;
  assignedCourses?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phoneNumber?: string;
  rollNumber?: string;
  course?: string;
  semester?: string;
  department?: string;
  assignedCourses?: string;
  password?: string;
}

export interface Assignment {
  assignmentId: string;
  facultyId: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  targetCourse?: string;
  targetSemester?: string;
  createdAt: string;
}

export type SubmissionStatus = 'UPLOADED' | 'PROCESSING' | 'COMPLETED' | 'DONE' | 'FAILED';

export interface Submission {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  fileType: string;
  fileUrl?: string;
  status: SubmissionStatus;
  studentName?: string;
  rollNumber?: string;
  course?: string;
  semester?: string;
  isDraft?: boolean;
  draftScoreAi?: number | null;
  draftScoreSimilarity?: number | null;
  submittedAt: string;
}

export type ReportStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type RiskScore = 'Low' | 'Medium' | 'High';
export type ReportDecision = 'Approved' | 'Rejected' | 'Pending';

export interface SentenceBreakdown {
  sentence?: string;
  text?: string;
  ai_score: number;
  similarity_score?: number;
  is_ai?: boolean;
  is_plagiarized?: boolean;
  label?: string;
  match_source?: string | null;
  reason?: string;
}

export interface Report {
  reportId: string;
  submissionId: string;
  studentId: string;
  assignmentId: string;
  analysisId?: string;
  status: ReportStatus;
  plagiarismScore: number | null;
  aiDetectionScore: number | null;
  codeSimilarityScore?: number | null;
  riskScore?: RiskScore;
  decision?: ReportDecision;
  facultyRemarks?: string | null;
  pdfUrl?: string | null;
  summary: string | null;
  analysisResult?: string | null;
  generatedAt: string;
}

export type NotificationType = 
  | 'SUBMISSION_RECEIVED' 
  | 'REPORT_READY' 
  | 'ANALYSIS_COMPLETE' 
  | 'ASSIGNMENT_DEADLINE'
  | 'WELCOME'
  | 'GENERAL';

export interface Notification {
  notificationId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  recipientEmail?: string;
  emailSent?: boolean;
  createdAt: string;
}
