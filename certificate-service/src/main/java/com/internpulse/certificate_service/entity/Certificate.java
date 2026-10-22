package com.internpulse.certificate_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "certificates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String certificateNumber;

    @Column(nullable = false)
    private Long studentId;

    @Column(nullable = false)
    private Long internshipId;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String internshipTitle;

    private Integer durationInMonths;

    @Column(nullable = false)
    private LocalDate issueDate;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.issueDate == null) {
            this.issueDate = LocalDate.now();
        }
        if (this.certificateNumber == null) {
            this.certificateNumber = "CERT-" + System.currentTimeMillis();
        }
    }
}