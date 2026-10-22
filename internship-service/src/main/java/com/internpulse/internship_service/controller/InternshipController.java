package com.internpulse.internship_service.controller;

import com.internpulse.internship_service.dto.*;
import com.internpulse.internship_service.service.InternshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;

    @PostMapping
    public ResponseEntity<InternshipResponseDTO> create(@Valid @RequestBody InternshipRequestDTO dto) {
        return new ResponseEntity<>(internshipService.create(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<InternshipResponseDTO>> getAllOpen(@RequestParam(required = false) String domain) {
        return ResponseEntity.ok(internshipService.getAllOpen(domain));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InternshipResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getById(id));
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<InternshipResponseDTO>> getByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(internshipService.getByCompany(companyId));
    }

    @PatchMapping("/{id}/close")
    public ResponseEntity<InternshipResponseDTO> close(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.close(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        internshipService.delete(id);
        return ResponseEntity.ok("Internship deleted successfully");
    }
}