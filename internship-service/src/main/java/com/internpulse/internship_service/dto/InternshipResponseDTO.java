package com.internpulse.internship_service.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InternshipResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String domain;
    private String location;
    private Double stipend;
    private Integer durationInMonths;
    private LocalDate deadline;
    private Long companyId;
    private String status;
}