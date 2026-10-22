package com.internpulse.certificate_service.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CertificateResponseDTO {
    private Long id;
    private String certificateNumber;
    private Long studentId;
    private Long internshipId;
    private String studentName;
    private String companyName;
    private String internshipTitle;
    private Integer durationInMonths;
    private LocalDate issueDate;
}