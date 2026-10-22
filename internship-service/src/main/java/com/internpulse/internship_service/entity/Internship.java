package com.internpulse.internship_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Internship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    private String domain;
    private String location;
    private Double stipend;
    private Integer durationInMonths;
    private LocalDate deadline;

    // Company alag service me hai, isliye sirf id rakhte hain (foreign key nahi)
    @Column(nullable = false)
    private Long companyId;

    @Enumerated(EnumType.STRING)
    private InternshipStatus status;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = InternshipStatus.OPEN;
        }
    }
}