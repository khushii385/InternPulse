package com.internpulse.internship_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InternshipRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String domain;
    private String location;

    @PositiveOrZero(message = "Stipend cannot be negative")
    private Double stipend;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be greater than 0")
    private Integer durationInMonths;

    @Future(message = "Deadline must be a future date")
    private LocalDate deadline;

    @NotNull(message = "Company id is required")
    private Long companyId;
}