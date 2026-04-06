package com.foodwaste.dto.response;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FoodResponse {
    private Long id;
    private String title;
    private int quantity;
    private String location;
    private LocalDateTime expiryTime;
    private String status;

    // 🔥 YEH LINE ADD KARO
    private String imageUrl;
    // dto/response/FoodResponse.java
    private Double freshnessScore;
    private String aiStatus;
}