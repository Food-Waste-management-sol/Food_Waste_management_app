package com.foodwaste.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.foodwaste.dto.request.LoginRequest;
import com.foodwaste.dto.request.RegisterRequest;
import com.foodwaste.dto.response.AuthResponse;
import com.foodwaste.entity.RefreshToken;
import com.foodwaste.entity.User;
import com.foodwaste.entity.enums.Role;
import com.foodwaste.exception.CustomException;
import com.foodwaste.repository.UserRepository;
import com.foodwaste.security.JwtUtil;
import com.foodwaste.util.ApiResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final UserRepository userRepo;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final RefreshTokenService refreshTokenService;

	public ApiResponse<?> register(RegisterRequest request) {

		if (userRepo.existsByEmail(request.getEmail())) {
			throw new CustomException("Email already exists");
		}

		User user = User.builder().name(request.getName()).email(request.getEmail())
				.password(passwordEncoder.encode(request.getPassword())).phone(request.getPhone())
				.role(Role.valueOf(request.getRole())).build();

		userRepo.save(user);

		return new ApiResponse<>(true, "User registered successfully", null);
	}

	public ApiResponse<AuthResponse> login(LoginRequest request) {

	    User user = userRepo.findByEmail(request.getEmail())
	            .orElseThrow(() -> new CustomException("User not found"));

	    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
	        throw new CustomException("Invalid credentials");
	    }

	    String accessToken = jwtUtil.generateAccessToken(
	            user.getEmail(),
	            user.getRole().name()
	    );

	    RefreshToken refreshToken = refreshTokenService.createToken(user.getEmail());

	    return new ApiResponse<>(true, "Login successful",
	            new AuthResponse(accessToken, refreshToken.getToken()));
	}}