package com.internpulse.interview_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // internship-service me applications table se link (sirf id)
    @Column(nullable = false)
    private Long applicationId;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    private InterviewMode mode;

    private String meetingLink; // online ke liye
    private String location;    // offline ke liye

    @Enumerated(EnumType.STRING)
    private InterviewStatus status;

    @Column(length = 1000)
    private String feedback;

    private Integer rating; // 1-5

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = InterviewStatus.SCHEDULED;
        }
    }
}