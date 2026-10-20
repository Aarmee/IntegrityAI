package com.integrityai.faculty.controller;

import com.integrityai.faculty.dto.FacultyRequest;
import com.integrityai.faculty.dto.FacultyResponse;
import com.integrityai.faculty.service.FacultyService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/faculty")
@Tag(name = "Faculty", description = "Faculty profile management APIs")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(
            FacultyService facultyService) {

        this.facultyService = facultyService;
    }

    @PostMapping
    @Operation(summary = "Create a faculty profile")
    public ResponseEntity<FacultyResponse> createFaculty(
            @Valid @RequestBody FacultyRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(facultyService.createFaculty(request));
    }

    @GetMapping("/{facultyId}")
    @Operation(summary = "Get faculty by ID")
    public ResponseEntity<FacultyResponse> getFaculty(
            @PathVariable UUID facultyId) {

        return ResponseEntity.ok(
                facultyService.getFaculty(facultyId)
        );
    }

    @GetMapping
    @Operation(summary = "Get all faculty")
    public ResponseEntity<List<FacultyResponse>> getAllFaculty() {

        return ResponseEntity.ok(
                facultyService.getAllFaculty()
        );
    }
}