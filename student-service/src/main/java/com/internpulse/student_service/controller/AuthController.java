package com.internpulse.student_service.controller;

import com.internpulse.student_service.dto.LoginRequestDTO;
import com.internpulse.student_service.dto.LoginResponseDTO;
import com.internpulse.student_service.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final StudentService studentService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(studentService.login(dto));
    }
}