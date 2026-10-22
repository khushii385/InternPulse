package com.internpulse.interview_service.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponseDTO {
    private Long id;
    private Long applicationId;
    private LocalDateTime scheduledAt;
    private String mode;
    private String meetingLink;
    private String location;
    private String status;
    private String feedback;
    private Integer rating;
}