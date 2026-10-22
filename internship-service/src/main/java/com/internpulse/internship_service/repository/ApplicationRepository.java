package com.internpulse.internship_service.repository;

import com.internpulse.internship_service.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    boolean existsByStudentIdAndInternshipId(Long studentId, Long internshipId);

    List<Application> findByStudentId(Long studentId);

    List<Application> findByInternshipId(Long internshipId);
}