package com.internpulse.certificate_service.repository;

import com.internpulse.certificate_service.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {

    boolean existsByStudentIdAndInternshipId(Long studentId, Long internshipId);

    List<Certificate> findByStudentId(Long studentId);

    Optional<Certificate> findByCertificateNumber(String certificateNumber);
}