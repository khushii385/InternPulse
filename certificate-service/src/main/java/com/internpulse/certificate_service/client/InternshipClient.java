package com.internpulse.certificate_service.client;

import com.internpulse.certificate_service.dto.InternshipDTO;
import com.internpulse.certificate_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class InternshipClient {

    private final RestClient restClient;

    @Value("${internship.service.url}")
    private String internshipServiceUrl;

    public InternshipDTO getInternshipById(Long internshipId) {
        try {
            return restClient.get()
                    .uri(internshipServiceUrl + "/api/internships/{id}", internshipId)
                    .retrieve()
                    .body(InternshipDTO.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Internship not found with id: " + internshipId);
        }
    }
}