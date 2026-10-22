package com.internpulse.company_service.repository;

import com.internpulse.company_service.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByEmail(String email);
    Optional<Company> findByEmail(String email);
}