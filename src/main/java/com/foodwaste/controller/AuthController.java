package com.foodwaste.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.foodwaste.dto.request.LoginRequest;
import com.foodwaste.dto.request.RegisterRequest;
import com.foodwaste.service.AuthService;
import com.foodwaste.util.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;

	@PostMapping("/register")
	public ApiResponse<?> register(@Valid @RequestBody RegisterRequest request) {
		return authService.register(request);
	}

	@PostMapping("/login")
	public ApiResponse<?> login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}
}