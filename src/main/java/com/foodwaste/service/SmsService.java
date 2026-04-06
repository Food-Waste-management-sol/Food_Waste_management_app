package com.foodwaste.service;

import org.springframework.stereotype.Service;

@Service
public class SmsService {

    public void sendSms(String phone, String message) {
        System.out.println("SMS sent to " + phone);
    }
}