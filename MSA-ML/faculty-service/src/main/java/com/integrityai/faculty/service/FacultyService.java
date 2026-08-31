package com.integrityai.faculty.service;

import com.integrityai.faculty.dto.FacultyRequest;
import com.integrityai.faculty.dto.FacultyResponse;
import com.integrityai.faculty.entity.Faculty;
import com.integrityai.faculty.repository.FacultyRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class FacultyService {

    private final FacultyRepository facultyRepository;

    public FacultyService(
            FacultyRepository facultyRepository) {

        this.facultyRepository = facultyRepository;
    }

    public FacultyResponse createFaculty(
            FacultyRequest request) {

        if (facultyRepository.existsByUserId(
                request.getUserId())) {

            throw new RuntimeException(
                    "Faculty profile already exists"
            );
        }

        Faculty faculty = new Faculty();

        faculty.setUserId(request.getUserId());
        faculty.setDepartment(request.getDepartment());
        faculty.setDesignation(request.getDesignation());

        Faculty saved = facultyRepository.save(faculty);

        return toResponse(saved);
    }

    public FacultyResponse getFaculty(UUID facultyId) {

        Faculty faculty = facultyRepository
                .findById(facultyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Faculty not found"
                        ));

        return toResponse(faculty);
    }

    public List<FacultyResponse> getAllFaculty() {

        return facultyRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private FacultyResponse toResponse(
            Faculty faculty) {

        return new FacultyResponse(
                faculty.getFacultyId(),
                faculty.getUserId(),
                faculty.getDepartment(),
                faculty.getDesignation()
        );
    }
}