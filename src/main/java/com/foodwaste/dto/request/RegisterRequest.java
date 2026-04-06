package com.foodwaste.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @Email
    private String email;

    @Size(min = 6)
    private String password;

    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;

    @NotBlank
    private String role;
}