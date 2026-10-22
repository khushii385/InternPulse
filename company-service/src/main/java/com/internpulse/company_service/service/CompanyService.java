package com.internpulse.company_service.service;

import com.internpulse.company_service.dto.*;
import java.util.List;

public interface CompanyService {
    CompanyResponseDTO create(CompanyRequestDTO dto);
    LoginResponseDTO login(LoginRequestDTO dto);
    List<CompanyResponseDTO> getAll();
    CompanyResponseDTO getById(Long id);
    void delete(Long id);
}