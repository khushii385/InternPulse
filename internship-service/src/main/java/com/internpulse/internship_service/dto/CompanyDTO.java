package com.internpulse.internship_service.dto;

import lombok.Data;

@Data
public class CompanyDTO {
    private Long id;
    private String name;
    private String email;
    private String website;
    private String description;
}