package com.internpulse.certificate_service.service;

import com.internpulse.certificate_service.client.InternshipClient;
import com.internpulse.certificate_service.client.StudentClient;
import com.internpulse.certificate_service.dto.*;
import com.internpulse.certificate_service.entity.Certificate;
import com.internpulse.certificate_service.exception.*;
import com.internpulse.certificate_service.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final StudentClient studentClient;
    private final InternshipClient internshipClient;

    public CertificateResponseDTO issue(CertificateRequestDTO dto) {
        studentClient.getStudentById(dto.getStudentId());
        internshipClient.getInternshipById(dto.getInternshipId());

        if (certificateRepository.existsByStudentIdAndInternshipId(dto.getStudentId(), dto.getInternshipId())) {
            throw new DuplicateResourceException("Certificate already issued for this internship");
        }

        Certificate c = new Certificate();
        c.setStudentId(dto.getStudentId());
        c.setInternshipId(dto.getInternshipId());
        c.setStudentName(dto.getStudentName());
        c.setCompanyName(dto.getCompanyName());
        c.setInternshipTitle(dto.getInternshipTitle());
        c.setDurationInMonths(dto.getDurationInMonths());

        return toResponse(certificateRepository.save(c));
    }

    public List<CertificateResponseDTO> getByStudent(Long studentId) {
        return certificateRepository.findByStudentId(studentId)
                .stream().map(this::toResponse).toList();
    }

    public CertificateResponseDTO getByCertificateNumber(String certificateNumber) {
        Certificate c = certificateRepository.findByCertificateNumber(certificateNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found: " + certificateNumber));
        return toResponse(c);
    }

    public CertificateResponseDTO getById(Long id) {
        Certificate c = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found with id: " + id));
        return toResponse(c);
    }

    private CertificateResponseDTO toResponse(Certificate c) {
        return new CertificateResponseDTO(
                c.getId(), c.getCertificateNumber(), c.getStudentId(), c.getInternshipId(),
                c.getStudentName(), c.getCompanyName(), c.getInternshipTitle(),
                c.getDurationInMonths(), c.getIssueDate()
        );
    }
}