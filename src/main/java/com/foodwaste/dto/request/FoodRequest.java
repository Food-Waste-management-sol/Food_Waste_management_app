package com.foodwaste.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FoodRequest {
    private String title;
    private int quantity;
    private String location;
    private LocalDateTime expiryTime;
    private String imageUrl; // Cloudinary ka URL yahan aayega
}