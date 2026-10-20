import apiClient from './axios';
import { Submission } from '../types';

export interface FileUploadResponse {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  fileType: string;
  fileUrl: string;
  status: Submission['status'];
  submittedAt: string;
  message: string;
}

export const submissionApi = {
  uploadSubmission: async (
    file: File,
    studentId: string,
    assignmentId: string,
    onUploadProgress?: (progressEvent: { loaded: number; total?: number }) => void,
    isDraft: boolean = true,
    metadata?: { studentName?: string; rollNumber?: string; course?: string; semester?: string }
  ): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('studentId', studentId);
    formData.append('assignmentId', assignmentId);
    formData.append('isDraft', String(isDraft));
    if (metadata?.studentName) formData.append('studentName', metadata.studentName);
    if (metadata?.rollNumber) formData.append('rollNumber', metadata.rollNumber);
    if (metadata?.course) formData.append('course', metadata.course);
    if (metadata?.semester) formData.append('semester', metadata.semester);

    const response = await apiClient.post<FileUploadResponse>(
      '/api/submissions/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  getAllSubmissions: async (): Promise<Submission[]> => {
    const response = await apiClient.get<Submission[]>('/api/submissions');
    return response.data;
  },

  getSubmissionById: async (submissionId: string): Promise<Submission> => {
    const response = await apiClient.get<Submission>(`/api/submissions/${submissionId}`);
    return response.data;
  },

  getSubmissionsByStudent: async (studentId: string): Promise<Submission[]> => {
    const response = await apiClient.get<Submission[]>(`/api/submissions/student/${studentId}`);
    return response.data;
  },

  getSubmissionsByAssignment: async (assignmentId: string): Promise<Submission[]> => {
    const response = await apiClient.get<Submission[]>(`/api/submissions/assignment/${assignmentId}`);
    return response.data;
  },

  deleteSubmission: async (submissionId: string): Promise<void> => {
    await apiClient.delete(`/api/submissions/${submissionId}`);
  },

  confirmSubmission: async (submissionId: string): Promise<Submission> => {
    const response = await apiClient.post<Submission>(`/api/submissions/${submissionId}/confirm`);
    return response.data;
  },

  downloadSubmissionFile: async (submissionId: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(`/api/submissions/${submissionId}/download`, {
      responseType: 'blob',
    });
    const contentType = typeof response.headers['content-type'] === 'string'
      ? response.headers['content-type']
      : 'application/octet-stream';
    const blob = new Blob([response.data], {
      type: contentType,
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'submission_document');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
