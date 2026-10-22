package com.internpulse.certificate_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CertificateRequestDTO {

    @NotNull(message = "Student id is required")
    private Long studentId;

    @NotNull(message = "Internship id is required")
    private Long internshipId;

    @NotBlank(message = "Student name is required")
    private String studentName;

    @NotBlank(message = "Company name is required")
    private String companyName;

    @NotBlank(message = "Internship title is required")
    private String internshipTitle;

    @Positive(message = "Duration must be greater than 0")
    private Integer durationInMonths;
}