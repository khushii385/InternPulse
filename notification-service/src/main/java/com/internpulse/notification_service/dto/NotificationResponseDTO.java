package com.internpulse.notification_service.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDTO {
    private Long id;
    private String recipientEmail;
    private String subject;
    private String message;
    private String type;
    private boolean sent;
    private LocalDateTime createdAt;
}