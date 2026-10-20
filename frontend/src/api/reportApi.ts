import apiClient from './axios';
import { Report } from '../types';

export interface GenerateReportDTO {
  submissionId: string;
  studentId: string;
  assignmentId: string;
  textContent?: string;
  filePath?: string;
}

export const reportApi = {
  getAllReports: async (): Promise<Report[]> => {
    const response = await apiClient.get<Report[]>('/api/reports');
    return response.data;
  },

  getReportById: async (reportId: string): Promise<Report> => {
    const response = await apiClient.get<Report>(`/api/reports/${reportId}`);
    return response.data;
  },

  getReportBySubmission: async (submissionId: string): Promise<Report> => {
    const response = await apiClient.get<Report>(`/api/reports/submission/${submissionId}`);
    return response.data;
  },

  getReportsByStudent: async (studentId: string): Promise<Report[]> => {
    const response = await apiClient.get<Report[]>(`/api/reports/student/${studentId}`);
    return response.data;
  },

  getReportsByAssignment: async (assignmentId: string): Promise<Report[]> => {
    const response = await apiClient.get<Report[]>(`/api/reports/assignment/${assignmentId}`);
    return response.data;
  },

  generateReport: async (data: GenerateReportDTO): Promise<Report> => {
    const response = await apiClient.post<Report>('/api/reports', data);
    return response.data;
  },

  deleteReport: async (reportId: string): Promise<void> => {
    await apiClient.delete(`/api/reports/${reportId}`);
  },

  reviewReport: async (reportId: string, data: { facultyRemarks?: string; decision?: string }): Promise<Report> => {
    const response = await apiClient.put<Report>(`/api/reports/${reportId}/review`, data);
    return response.data;
  },
};
