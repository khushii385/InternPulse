package com.internpulse.interview_service.service;

import com.internpulse.interview_service.client.ApplicationClient;
import com.internpulse.interview_service.dto.*;
import com.internpulse.interview_service.entity.*;
import com.internpulse.interview_service.exception.ResourceNotFoundException;
import com.internpulse.interview_service.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationClient applicationClient;

    public InterviewResponseDTO schedule(InterviewRequestDTO dto) {
        applicationClient.getApplicationById(dto.getApplicationId()); // application exist karta hai ya nahi, check

        Interview i = new Interview();
        i.setApplicationId(dto.getApplicationId());
        i.setScheduledAt(dto.getScheduledAt());
        i.setMode(dto.getMode());
        i.setMeetingLink(dto.getMeetingLink());
        i.setLocation(dto.getLocation());
        return toResponse(interviewRepository.save(i));
    }

    public List<InterviewResponseDTO> getByApplication(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId)
                .stream().map(this::toResponse).toList();
    }

    public InterviewResponseDTO getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public InterviewResponseDTO complete(Long id, FeedbackDTO dto) {
        Interview i = findOrThrow(id);
        i.setStatus(InterviewStatus.COMPLETED);
        i.setFeedback(dto.getFeedback());
        i.setRating(dto.getRating());
        return toResponse(interviewRepository.save(i));
    }

    public InterviewResponseDTO cancel(Long id) {
        Interview i = findOrThrow(id);
        i.setStatus(InterviewStatus.CANCELLED);
        return toResponse(interviewRepository.save(i));
    }

    private Interview findOrThrow(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview not found with id: " + id));
    }

    private InterviewResponseDTO toResponse(Interview i) {
        return new InterviewResponseDTO(
                i.getId(), i.getApplicationId(), i.getScheduledAt(),
                i.getMode().name(), i.getMeetingLink(), i.getLocation(),
                i.getStatus().name(), i.getFeedback(), i.getRating()
        );
    }
}