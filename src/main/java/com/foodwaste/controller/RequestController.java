package com.foodwaste.controller;

import com.foodwaste.service.RequestService;
import com.foodwaste.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.foodwaste.dto.response.RequestResponse;

@RestController
@RequestMapping("/request")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final JwtUtil jwtUtil;

    // 1. Naya Request banane ke liye (NGO side)
    @PostMapping("/create/{foodId}")
    public String createRequest(@PathVariable Long foodId,
                                @RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return requestService.createRequest(foodId, email);
    }

    // 2. Request Approve karne ke liye (Restaurant side)
    @PostMapping("/approve/{id}")
    public String approve(@PathVariable Long id) {
        return requestService.approveRequest(id);
    }

    // 🔥 3. Restaurant ki incoming requests dekhne ke liye (ManageRequests.jsx)
    @GetMapping("/restaurant")
    public List<RequestResponse> getRequestsForRestaurant(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return requestService.getRequestsForRestaurant(email);
    }

    // 🔥 4. NGO ki apni history dekhne ke liye (MyRequests.jsx)
    @GetMapping("/ngo")
    public List<RequestResponse> getMyRequests(@RequestHeader("Authorization") String token) {
        String email = jwtUtil.extractEmail(token.substring(7));
        return requestService.getMyRequests(email);
    }
}