package com.internpulse.interview_service.dto;

import com.internpulse.interview_service.entity.InterviewMode;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class InterviewRequestDTO {

    @NotNull(message = "Application id is required")
    private Long applicationId;

    @NotNull(message = "Scheduled time is required")
    @Future(message = "Scheduled time must be in the future")
    private LocalDateTime scheduledAt;

    @NotNull(message = "Mode is required")
    private InterviewMode mode;

    private String meetingLink;
    private String location;
}