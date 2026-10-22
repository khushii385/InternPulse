package com.internpulse.interview_service.dto;

import lombok.Data;

@Data
public class ApplicationDTO {
    private Long id;
    private Long studentId;
    private Long internshipId;
    private String status;
    private String appliedAt;
}