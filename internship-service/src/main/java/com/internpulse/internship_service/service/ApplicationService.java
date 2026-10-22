package com.internpulse.internship_service.service;

import com.internpulse.internship_service.client.StudentClient;
import com.internpulse.internship_service.dto.*;
import com.internpulse.internship_service.entity.*;
import com.internpulse.internship_service.exception.*;
import com.internpulse.internship_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final InternshipRepository internshipRepository;
    private final StudentClient studentClient;

    public ApplicationResponseDTO apply(ApplicationRequestDTO dto) {
        studentClient.getStudentById(dto.getStudentId()); // student exist karta hai ya nahi, check

        Internship internship = internshipRepository.findById(dto.getInternshipId())
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with id: " + dto.getInternshipId()));

        if (internship.getStatus() != InternshipStatus.OPEN) {
            throw new BadRequestException("This internship is closed");
        }
        if (internship.getDeadline() != null && internship.getDeadline().isBefore(LocalDate.now())) {
            throw new BadRequestException("Application deadline has passed");
        }
        if (applicationRepository.existsByStudentIdAndInternshipId(dto.getStudentId(), dto.getInternshipId())) {
            throw new DuplicateResourceException("You have already applied for this internship");
        }

        Application app = new Application();
        app.setStudentId(dto.getStudentId());
        app.setInternshipId(dto.getInternshipId());
        return toResponse(applicationRepository.save(app));
    }

    public ApplicationResponseDTO getById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        return toResponse(app);
    }

    public List<ApplicationResponseDTO> getByStudent(Long studentId) {
        return applicationRepository.findByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public List<ApplicationResponseDTO> getByInternship(Long internshipId) {
        return applicationRepository.findByInternshipId(internshipId).stream().map(this::toResponse).toList();
    }

    public ApplicationResponseDTO updateStatus(Long id, ApplicationStatus status) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));
        app.setStatus(status);
        return toResponse(applicationRepository.save(app));
    }

    private ApplicationResponseDTO toResponse(Application a) {
        return new ApplicationResponseDTO(
                a.getId(), a.getStudentId(), a.getInternshipId(),
                a.getStatus().name(), a.getAppliedAt()
        );
    }
}