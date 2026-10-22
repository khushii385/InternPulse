package com.internpulse.internship_service.controller;

import com.internpulse.internship_service.dto.ApplicationRequestDTO;
import com.internpulse.internship_service.dto.ApplicationResponseDTO;
import com.internpulse.internship_service.dto.StatusUpdateDTO;
import com.internpulse.internship_service.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApplicationResponseDTO> apply(
            @Valid @ModelAttribute ApplicationRequestDTO dto
    ) {
        return new ResponseEntity<>(
                applicationService.apply(dto),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getByStudent(
            @PathVariable Long studentId
    ) {
        return ResponseEntity.ok(applicationService.getByStudent(studentId));
    }

    @GetMapping("/internship/{internshipId}")
    public ResponseEntity<List<ApplicationResponseDTO>> getByInternship(
            @PathVariable Long internshipId
    ) {
        return ResponseEntity.ok(
                applicationService.getByInternship(internshipId)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateDTO dto
    ) {
        return ResponseEntity.ok(
                applicationService.updateStatus(id, dto.getStatus())
        );
    }
}