package com.internpulse.internship_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class ApplicationRequestDTO {

    @NotNull(message = "Student id is required")
    private Long studentId;

    @NotNull(message = "Internship id is required")
    private Long internshipId;

    private String coverNote;

    private MultipartFile resume;
}
