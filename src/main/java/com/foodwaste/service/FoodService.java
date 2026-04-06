package com.foodwaste.service;

import com.foodwaste.dto.request.FoodRequest;
import com.foodwaste.dto.response.FoodResponse;
import com.foodwaste.entity.Food;
import com.foodwaste.entity.User;
import com.foodwaste.entity.enums.FoodStatus;
import com.foodwaste.exception.CustomException;
import com.foodwaste.mapper.FoodMapper;
import com.foodwaste.repository.FoodRepository;
import com.foodwaste.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FoodService {

    private final FoodRepository foodRepo;
    private final UserRepository userRepo;
    private final FoodMapper foodMapper;

    public FoodResponse addFood(FoodRequest request, String email) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new CustomException("User not found"));

        // Temporary variables to store AI results
        String aiStatus = "PENDING";
        Double freshnessScore = 0.0;

        // 🔥 AI Analysis Integration
        try {
            String pythonUrl = "http://localhost:5000/analyze";
            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> aiRequestMap = new HashMap<>();
            aiRequestMap.put("imageUrl", request.getImageUrl());

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(aiRequestMap, headers);

            @SuppressWarnings("unchecked")
            Map<String, Object> aiResponse = restTemplate.postForObject(pythonUrl, entity, Map.class);

            if (aiResponse != null) {
                aiStatus = aiResponse.get("aiStatus").toString();
                freshnessScore = Double.parseDouble(aiResponse.get("freshnessScore").toString());

                // 🛑 CRITICAL CHECK: Agar AI ne kaha ye khana nahi hai
                if ("NOT_FOOD".equals(aiStatus)) {
                    String detected = aiResponse.getOrDefault("detected", "item").toString();
                    // Yahan se error throw hoga aur aage ka code (save) nahi chalega
                    throw new CustomException("AI Validation Failed: It looks like a " + detected + ". Please upload food only!");
                }

                System.out.println("✅ AI Result: " + aiStatus);
            }
        } catch (CustomException e) {
            // Agar AI ne reject kiya toh wahi error throw karo
            throw e;
        } catch (Exception e) {
            System.err.println("⚠️ AI Server Error: " + e.getMessage());
            aiStatus = "PENDING"; // Server down hai toh pending rakh do
        }

        // Agar control yahan tak aaya hai, matlab AI ne pass kar diya hai
        Food food = foodMapper.toEntity(request);
        food.setRestaurant(user);
        food.setStatus(FoodStatus.AVAILABLE);
        food.setAiStatus(aiStatus);
        food.setFreshnessScore(freshnessScore);

        return foodMapper.toResponse(foodRepo.save(food));
    }

    public List<FoodResponse> getAvailableFood() {
        return foodRepo.findByStatus(FoodStatus.AVAILABLE)
                .stream()
                .map(foodMapper::toResponse)
                .toList();
    }
}