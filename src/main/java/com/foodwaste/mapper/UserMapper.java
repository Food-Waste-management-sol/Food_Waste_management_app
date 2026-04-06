package com.foodwaste.mapper;

import com.foodwaste.dto.request.RegisterRequest;
import com.foodwaste.dto.response.UserResponse; // Naya DTO
import com.foodwaste.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Registration ke waqt kaam aata hai
    User toEntity(RegisterRequest request);

    // 🔥 Ye line add karo: Request/NGO details dikhane ke liye kaam aayega
    UserResponse toResponse(User user);
}