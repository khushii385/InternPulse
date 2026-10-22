package com.internpulse.interview_service.repository;

import com.internpulse.interview_service.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    List<Interview> findByApplicationId(Long applicationId);

    Optional<Interview> findFirstByApplicationIdOrderByScheduledAtDesc(Long applicationId);
}