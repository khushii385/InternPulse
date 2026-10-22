package com.internpulse.interview_service.controller;

import com.internpulse.interview_service.dto.*;
import com.internpulse.interview_service.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    public ResponseEntity<InterviewResponseDTO> schedule(@Valid @RequestBody InterviewRequestDTO dto) {
        return new ResponseEntity<>(interviewService.schedule(dto), HttpStatus.CREATED);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<InterviewResponseDTO>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewService.getByApplication(applicationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterviewResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.getById(id));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<InterviewResponseDTO> complete(@PathVariable Long id, @Valid @RequestBody FeedbackDTO dto) {
        return ResponseEntity.ok(interviewService.complete(id, dto));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<InterviewResponseDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(interviewService.cancel(id));
    }
}