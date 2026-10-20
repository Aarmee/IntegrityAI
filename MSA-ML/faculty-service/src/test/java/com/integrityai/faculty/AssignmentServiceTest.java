package com.integrityai.faculty;

import com.integrityai.faculty.dto.AssignmentRequest;
import com.integrityai.faculty.dto.AssignmentResponse;
import com.integrityai.faculty.entity.Assignment;
import com.integrityai.faculty.repository.AssignmentRepository;
import com.integrityai.faculty.service.AssignmentService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @InjectMocks
    private AssignmentService assignmentService;

    private Assignment buildAssignment(UUID id, UUID facultyId) {
        Assignment a = new Assignment();
        a.setAssignmentId(id);
        a.setFacultyId(facultyId);
        a.setTitle("Test Assignment");
        a.setDescription("Description");
        a.setSubject("CS101");
        a.setDeadline(LocalDateTime.now().plusDays(7));
        return a;
    }

    private AssignmentRequest buildRequest(UUID facultyId) {
        AssignmentRequest r = new AssignmentRequest();
        r.setFacultyId(facultyId);
        r.setTitle("Test Assignment");
        r.setDescription("Description");
        r.setSubject("CS101");
        r.setDeadline(LocalDateTime.now().plusDays(7));
        return r;
    }

    @Test
    void createAssignment_success() {
        UUID facultyId = UUID.randomUUID();
        UUID assignmentId = UUID.randomUUID();
        AssignmentRequest req = buildRequest(facultyId);
        Assignment saved = buildAssignment(assignmentId, facultyId);

        when(assignmentRepository.save(any())).thenReturn(saved);

        AssignmentResponse response = assignmentService.createAssignment(req);

        assertThat(response.getTitle()).isEqualTo("Test Assignment");
        assertThat(response.getFacultyId()).isEqualTo(facultyId);
        verify(assignmentRepository).save(any());
    }

    @Test
    void getAssignmentById_found() {
        UUID id = UUID.randomUUID();
        Assignment a = buildAssignment(id, UUID.randomUUID());
        when(assignmentRepository.findById(id)).thenReturn(Optional.of(a));

        AssignmentResponse response = assignmentService.getAssignmentById(id);
        assertThat(response.getAssignmentId()).isEqualTo(id);
    }

    @Test
    void getAssignmentById_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(assignmentRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> assignmentService.getAssignmentById(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getAllAssignments_returnsList() {
        UUID f = UUID.randomUUID();
        Assignment a1 = buildAssignment(UUID.randomUUID(), f);
        Assignment a2 = buildAssignment(UUID.randomUUID(), f);
        when(assignmentRepository.findAll()).thenReturn(List.of(a1, a2));

        List<AssignmentResponse> result = assignmentService.getAllAssignments();
        assertThat(result).hasSize(2);
    }

    @Test
    void getAssignmentsByFaculty_returnsList() {
        UUID facultyId = UUID.randomUUID();
        Assignment a = buildAssignment(UUID.randomUUID(), facultyId);
        when(assignmentRepository.findByFacultyId(facultyId)).thenReturn(List.of(a));

        List<AssignmentResponse> result = assignmentService.getAssignmentsByFaculty(facultyId);
        assertThat(result).hasSize(1);
    }

    @Test
    void updateAssignment_success() {
        UUID id = UUID.randomUUID();
        Assignment existing = buildAssignment(id, UUID.randomUUID());
        when(assignmentRepository.findById(id)).thenReturn(Optional.of(existing));
        when(assignmentRepository.save(any())).thenReturn(existing);

        AssignmentRequest req = buildRequest(existing.getFacultyId());
        req.setTitle("Updated Title");

        AssignmentResponse response = assignmentService.updateAssignment(id, req);
        assertThat(response).isNotNull();
        verify(assignmentRepository).save(any());
    }

    @Test
    void deleteAssignment_success() {
        UUID id = UUID.randomUUID();
        when(assignmentRepository.existsById(id)).thenReturn(true);
        doNothing().when(assignmentRepository).deleteById(id);

        assertThatCode(() -> assignmentService.deleteAssignment(id)).doesNotThrowAnyException();
        verify(assignmentRepository).deleteById(id);
    }

    @Test
    void deleteAssignment_notFound_throws() {
        UUID id = UUID.randomUUID();
        when(assignmentRepository.existsById(id)).thenReturn(false);

        assertThatThrownBy(() -> assignmentService.deleteAssignment(id))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }
}
