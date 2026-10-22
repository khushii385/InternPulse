package com.internpulse.internship_service.repository;

import com.internpulse.internship_service.entity.Internship;
import com.internpulse.internship_service.entity.InternshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InternshipRepository extends JpaRepository<Internship, Long> {

    List<Internship> findByCompanyId(Long companyId);

    List<Internship> findByStatus(InternshipStatus status);

    List<Internship> findByDomainIgnoreCaseAndStatus(String domain, InternshipStatus status);
}