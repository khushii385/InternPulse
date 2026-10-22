package com.internpulse.notification_service.controller;

import com.internpulse.notification_service.dto.*;
import com.internpulse.notification_service.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDTO> send(@Valid @RequestBody NotificationRequestDTO dto) {
        return new ResponseEntity<>(notificationService.send(dto), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getAll() {
        return ResponseEntity.ok(notificationService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<List<NotificationResponseDTO>> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(notificationService.getByEmail(email));
    }
}