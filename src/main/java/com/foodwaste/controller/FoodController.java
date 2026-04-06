package com.foodwaste.controller;

import com.foodwaste.dto.request.FoodRequest;
import com.foodwaste.security.JwtUtil;
import com.foodwaste.service.FoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/food")
@RequiredArgsConstructor
public class FoodController {

    private final FoodService foodService;
    private final JwtUtil jwtUtil;

    @PostMapping("/add")
    public Object addFood(@RequestHeader("Authorization") String token,
                          @Valid @RequestBody FoodRequest request) {

        String email = jwtUtil.extractEmail(token.substring(7));
        return foodService.addFood(request, email);
    }

    @GetMapping("/available")
    public Object getFood() {
        return foodService.getAvailableFood();
    }
    @GetMapping("/predict-waste")
    public ResponseEntity<?> getWastePrediction() {
        String pythonUrl = "http://localhost:5000/predict-waste";
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map<String, Object> response = restTemplate.getForObject(pythonUrl, Map.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("AI Server not responding");
        }
    }
}