package com.foodwaste.service;

import com.foodwaste.repository.FoodRepository;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;

public class SchedulerService {

    private final FoodRepository foodRepo ;

    public SchedulerService(FoodRepository foodRepo) {
        this.foodRepo = foodRepo;
    }

    @Scheduled(cron = "0 0/30 * * * *") // Har 30 minute mein chalega
    public void checkFoodExpiry() {
        foodRepo.updateExpiredFood(LocalDateTime.now());
        System.out.println("🕒 Expiry check completed at: " + LocalDateTime.now());
    }

}
