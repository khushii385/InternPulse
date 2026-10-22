package com.internpulse.internship_service.service;

import com.internpulse.internship_service.client.CompanyClient;
import com.internpulse.internship_service.dto.*;
import com.internpulse.internship_service.entity.*;
import com.internpulse.internship_service.exception.ResourceNotFoundException;
import com.internpulse.internship_service.repository.InternshipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InternshipService {

    private final InternshipRepository internshipRepository;
    private final CompanyClient companyClient;

    public InternshipResponseDTO create(InternshipRequestDTO dto) {
        companyClient.getCompanyById(dto.getCompanyId());

        Internship i = new Internship();
        i.setTitle(dto.getTitle());
        i.setDescription(dto.getDescription());
        i.setDomain(dto.getDomain());
        i.setLocation(dto.getLocation());
        i.setStipend(dto.getStipend());
        i.setDurationInMonths(dto.getDurationInMonths());
        i.setDeadline(dto.getDeadline());
        i.setCompanyId(dto.getCompanyId());
        return toResponse(internshipRepository.save(i));
    }

    public List<InternshipResponseDTO> getAllOpen(String domain) {
        List<Internship> list = (domain == null || domain.isBlank())
                ? internshipRepository.findByStatus(InternshipStatus.OPEN)
                : internshipRepository.findByDomainIgnoreCaseAndStatus(domain, InternshipStatus.OPEN);
        return list.stream().map(this::toResponse).toList();
    }

    public InternshipResponseDTO getById(Long id) {
        return toResponse(findOrThrow(id));
    }

    public List<InternshipResponseDTO> getByCompany(Long companyId) {
        return internshipRepository.findByCompanyId(companyId)
                .stream().map(this::toResponse).toList();
    }

    public InternshipResponseDTO close(Long id) {
        Internship i = findOrThrow(id);
        i.setStatus(InternshipStatus.CLOSED);
        return toResponse(internshipRepository.save(i));
    }

    public void delete(Long id) {
        internshipRepository.delete(findOrThrow(id));
    }

    private Internship findOrThrow(Long id) {
        return internshipRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Internship not found with id: " + id));
    }

    private InternshipResponseDTO toResponse(Internship i) {
        return new InternshipResponseDTO(
                i.getId(), i.getTitle(), i.getDescription(), i.getDomain(),
                i.getLocation(), i.getStipend(), i.getDurationInMonths(),
                i.getDeadline(), i.getCompanyId(), i.getStatus().name()
        );
    }
}