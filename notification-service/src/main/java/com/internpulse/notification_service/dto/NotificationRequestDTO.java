package com.internpulse.notification_service.dto;

import com.internpulse.notification_service.entity.NotificationType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class NotificationRequestDTO {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Enter a valid email")
    private String recipientEmail;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    @NotNull(message = "Type is required")
    private NotificationType type;
}