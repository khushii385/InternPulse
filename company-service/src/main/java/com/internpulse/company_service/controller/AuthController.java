package com.internpulse.company_service.controller;

import com.internpulse.company_service.dto.LoginRequestDTO;
import com.internpulse.company_service.dto.LoginResponseDTO;
import com.internpulse.company_service.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CompanyService companyService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(companyService.login(dto));
    }
}