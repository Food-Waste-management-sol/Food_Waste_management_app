package com.foodwaste.service;

import com.foodwaste.dto.response.RequestResponse;
import com.foodwaste.entity.*;
import com.foodwaste.entity.enums.RequestStatus;
import com.foodwaste.exception.CustomException;
import com.foodwaste.mapper.RequestMapper;
import com.foodwaste.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RequestService {

    private final RequestRepository requestRepo;
    private final FoodRepository foodRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final SmsService smsService;
    private final RequestMapper requestMapper;

    // 1. NGO Khana mangne ke liye (Add Logic)
    public String createRequest(Long foodId, String email) {
        User ngo = userRepo.findByEmail(email)
                .orElseThrow(() -> new CustomException("NGO not found"));

        Food food = foodRepo.findById(foodId)
                .orElseThrow(() -> new CustomException("Food not found"));

        Request request = Request.builder()
                .food(food)
                .ngo(ngo)
                .status(RequestStatus.PENDING)
                .build();

        requestRepo.save(request);
        return "Request created successfully!";
    }

    // 2. Restaurant Approve karne ke liye
    public String approveRequest(Long requestId) {
        Request req = requestRepo.findById(requestId)
                .orElseThrow(() -> new CustomException("Request not found"));

        req.setStatus(RequestStatus.APPROVED);

        // Notify NGO via Email & SMS
        try {
            emailService.sendEmail(
                    req.getNgo().getEmail(),
                    "Food Request Approved ✅",
                    "Great news! Your request for " + req.getFood().getTitle() + " has been approved by the restaurant."
            );
            smsService.sendSms(req.getNgo().getPhone(), "Your food request is approved!");
        } catch (Exception e) {
            System.out.println("Notification failed but status updated: " + e.getMessage());
        }

        requestRepo.save(req);
        return "Request Approved and NGO Notified";
    }

    // 3. Restaurant apni requests dekhne ke liye (ManageRequests.jsx)
    public List<RequestResponse> getRequestsForRestaurant(String email) {
        // Humne Repository mein jo @Query wala method banaya tha wahi use kar rahe hain
        return requestRepo.findByRestaurantEmail(email)
                .stream()
                .map(requestMapper::toResponse)
                .toList();
    }

    // 4. NGO apni history dekhne ke liye (MyRequests.jsx) - YE MISSING THA
    public List<RequestResponse> getMyRequests(String email) {
        return requestRepo.findByNgoEmail(email)
                .stream()
                .map(requestMapper::toResponse)
                .toList();
    }
}