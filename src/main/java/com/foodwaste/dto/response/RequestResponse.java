package com.foodwaste.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RequestResponse {
    private Long id;

    // Khane ki details (Isme imageUrl bhi aa jayegi)
    private FoodResponse food;

    // Kis NGO ne request ki
    private UserResponse ngo;

    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime createdAt;
}