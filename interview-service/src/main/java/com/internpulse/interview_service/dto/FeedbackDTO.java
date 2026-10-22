package com.internpulse.interview_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class FeedbackDTO {

    @Min(1) @Max(5)
    private Integer rating;

    private String feedback;
}