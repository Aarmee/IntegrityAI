import apiClient from './axios';
import { Assignment } from '../types';

export interface CreateAssignmentDTO {
  facultyId: string;
  title: string;
  subject: string;
  description: string;
  deadline: string;
  targetCourse?: string;
  targetSemester?: string;
}

export const assignmentApi = {
  getAllAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get<Assignment[]>('/api/assignments');
    return response.data;
  },

  getAssignmentById: async (assignmentId: string): Promise<Assignment> => {
    const response = await apiClient.get<Assignment>(`/api/assignments/${assignmentId}`);
    return response.data;
  },

  getAssignmentsByFaculty: async (facultyId: string): Promise<Assignment[]> => {
    const response = await apiClient.get<Assignment[]>(`/api/assignments/faculty/${facultyId}`);
    return response.data;
  },

  createAssignment: async (data: CreateAssignmentDTO): Promise<Assignment> => {
    const response = await apiClient.post<Assignment>('/api/assignments', data);
    return response.data;
  },

  updateAssignment: async (assignmentId: string, data: CreateAssignmentDTO): Promise<Assignment> => {
    const response = await apiClient.put<Assignment>(`/api/assignments/${assignmentId}`, data);
    return response.data;
  },

  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/api/assignments/${assignmentId}`);
  },

  remindPendingStudents: async (assignmentId: string): Promise<{ success: boolean; remindersSent: number; message: string }> => {
    const response = await apiClient.post<{ success: boolean; remindersSent: number; message: string }>(
      `/api/assignments/${assignmentId}/remind-pending`
    );
    return response.data;
  },

  sendFacultySummaryEmail: async (assignmentId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>(
      `/api/assignments/${assignmentId}/send-summary-email`
    );
    return response.data;
  },
};
