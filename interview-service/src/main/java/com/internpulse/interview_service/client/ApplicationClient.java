package com.internpulse.interview_service.client;

import com.internpulse.interview_service.dto.ApplicationDTO;
import com.internpulse.interview_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class ApplicationClient {

    private final RestClient restClient;

    @Value("${internship.service.url}")
    private String internshipServiceUrl;

    public ApplicationDTO getApplicationById(Long applicationId) {
        try {
            return restClient.get()
                    .uri(internshipServiceUrl + "/api/applications/{id}", applicationId)
                    .retrieve()
                    .body(ApplicationDTO.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Application not found with id: " + applicationId);
        }
    }
}