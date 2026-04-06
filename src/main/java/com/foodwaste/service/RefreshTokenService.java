package com.foodwaste.service;

import com.foodwaste.entity.RefreshToken;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RefreshTokenService {

    public RefreshToken createToken(String email) {
        RefreshToken token = new RefreshToken();
        token.setToken(UUID.randomUUID().toString());
        return token;
    }
}