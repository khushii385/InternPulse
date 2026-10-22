package com.internpulse.notification_service.service;

import com.internpulse.notification_service.dto.*;
import com.internpulse.notification_service.entity.Notification;
import com.internpulse.notification_service.exception.ResourceNotFoundException;
import com.internpulse.notification_service.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationResponseDTO send(NotificationRequestDTO dto) {
        Notification n = new Notification();
        n.setRecipientEmail(dto.getRecipientEmail());
        n.setSubject(dto.getSubject());
        n.setMessage(dto.getMessage());
        n.setType(dto.getType());

        // Real email ki jagah, abhi sirf console me print + DB me save
        n.setSent(true);
        Notification saved = notificationRepository.save(n);

        log.info("📩 EMAIL SENT to {} | Subject: {} | Message: {}",
                saved.getRecipientEmail(), saved.getSubject(), saved.getMessage());

        return toResponse(saved);
    }

    public List<NotificationResponseDTO> getByEmail(String email) {
        return notificationRepository.findByRecipientEmail(email)
                .stream().map(this::toResponse).toList();
    }

    public List<NotificationResponseDTO> getAll() {
        return notificationRepository.findAll().stream().map(this::toResponse).toList();
    }

    public NotificationResponseDTO getById(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        return toResponse(n);
    }

    private NotificationResponseDTO toResponse(Notification n) {
        return new NotificationResponseDTO(
                n.getId(), n.getRecipientEmail(), n.getSubject(),
                n.getMessage(), n.getType().name(), n.isSent(), n.getCreatedAt()
        );
    }
}