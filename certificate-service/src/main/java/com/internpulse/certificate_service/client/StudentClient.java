package com.internpulse.certificate_service.client;

import com.internpulse.certificate_service.dto.StudentDTO;
import com.internpulse.certificate_service.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@RequiredArgsConstructor
public class StudentClient {

    private final RestClient restClient;

    @Value("${student.service.url}")
    private String studentServiceUrl;

    public StudentDTO getStudentById(Long studentId) {
        try {
            return restClient.get()
                    .uri(studentServiceUrl + "/api/students/{id}", studentId)
                    .retrieve()
                    .body(StudentDTO.class);
        } catch (RestClientException e) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
    }
}