package com.internpulse.internship_service.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDTO {
    private Long id;
    private Long studentId;
    private Long internshipId;
    private String status;
    private LocalDateTime appliedAt;
}