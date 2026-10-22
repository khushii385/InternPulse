package com.internpulse.internship_service.dto;

import com.internpulse.internship_service.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateDTO {

    @NotNull(message = "Status is required")
    private ApplicationStatus status;
}