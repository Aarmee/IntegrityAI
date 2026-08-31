package com.integrityai.faculty.controller;

import com.integrityai.faculty.dto.FacultyRequest;
import com.integrityai.faculty.dto.FacultyResponse;
import com.integrityai.faculty.service.FacultyService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(
            FacultyService facultyService) {

        this.facultyService = facultyService;
    }

    @PostMapping
    public ResponseEntity<FacultyResponse> createFaculty(
            @Valid @RequestBody FacultyRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(facultyService.createFaculty(request));
    }

    @GetMapping("/{facultyId}")
    public ResponseEntity<FacultyResponse> getFaculty(
            @PathVariable UUID facultyId) {

        return ResponseEntity.ok(
                facultyService.getFaculty(facultyId)
        );
    }

    @GetMapping
    public ResponseEntity<List<FacultyResponse>> getAllFaculty() {

        return ResponseEntity.ok(
                facultyService.getAllFaculty()
        );
    }
}