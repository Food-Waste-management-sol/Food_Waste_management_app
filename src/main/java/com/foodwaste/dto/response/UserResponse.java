package com.foodwaste.dto.response;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone; // NGO se contact karne ke liye zaroori hai
    private String role;  // NGO or RESTAURANT
}