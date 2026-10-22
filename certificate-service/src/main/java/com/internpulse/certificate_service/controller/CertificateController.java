package com.internpulse.certificate_service.controller;

import com.internpulse.certificate_service.dto.*;
import com.internpulse.certificate_service.service.CertificateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certificates")
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping
    public ResponseEntity<CertificateResponseDTO> issue(@Valid @RequestBody CertificateRequestDTO dto) {
        return new ResponseEntity<>(certificateService.issue(dto), HttpStatus.CREATED);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<CertificateResponseDTO>> getByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(certificateService.getByStudent(studentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CertificateResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(certificateService.getById(id));
    }

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<CertificateResponseDTO> verify(@PathVariable String certificateNumber) {
        return ResponseEntity.ok(certificateService.getByCertificateNumber(certificateNumber));
    }
}