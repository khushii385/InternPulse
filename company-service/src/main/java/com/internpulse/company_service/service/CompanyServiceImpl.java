package com.internpulse.company_service.service;

import com.internpulse.company_service.dto.*;
import com.internpulse.company_service.entity.Company;
import com.internpulse.company_service.exception.*;
import com.internpulse.company_service.repository.CompanyRepository;
import com.internpulse.company_service.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public CompanyResponseDTO create(CompanyRequestDTO dto) {
        if (companyRepository.existsByEmail(dto.getEmail())) {
            throw new DuplicateResourceException("Email already registered");
        }
        Company c = new Company();
        c.setName(dto.getName());
        c.setEmail(dto.getEmail());
        c.setPassword(passwordEncoder.encode(dto.getPassword()));
        c.setWebsite(dto.getWebsite());
        c.setDescription(dto.getDescription());
        return toResponse(companyRepository.save(c));
    }

    @Override
    public LoginResponseDTO login(LoginRequestDTO dto) {
        Company company = companyRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));
        if (!passwordEncoder.matches(dto.getPassword(), company.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(company.getEmail(), company.getRole());
        return new LoginResponseDTO(token, company.getEmail(), company.getRole());
    }

    @Override
    public List<CompanyResponseDTO> getAll() {
        return companyRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CompanyResponseDTO getById(Long id) {
        Company c = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return toResponse(c);
    }

    @Override
    public void delete(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new ResourceNotFoundException("Company not found with id: " + id);
        }
        companyRepository.deleteById(id);
    }

    private CompanyResponseDTO toResponse(Company c) {
        return new CompanyResponseDTO(c.getId(), c.getName(), c.getEmail(), c.getWebsite(), c.getDescription());
    }
}