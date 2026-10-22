package com.internpulse.internship_service.client;

import com.internpulse.internship_service.dto.CompanyDTO;
import com.internpulse.internship_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class CompanyClient {

    private final RestClient restClient;

    @Value("${company.service.url}")
    private String companyServiceUrl;

    public CompanyDTO getCompanyById(Long companyId) {
        try {
            return restClient.get()
                    .uri(companyServiceUrl + "/api/companies/{id}", companyId)
                    .retrieve()
                    .body(CompanyDTO.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Company not found with id: " + companyId);
        }
    }
}