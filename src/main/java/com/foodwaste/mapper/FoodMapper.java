package com.foodwaste.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.foodwaste.dto.request.FoodRequest;
import com.foodwaste.dto.response.FoodResponse;
import com.foodwaste.entity.Food;

@Mapper(componentModel = "spring")
public interface FoodMapper {

	// 1. Request se Entity mein image mapping (Auto ho jayegi agar naam same hai)
	Food toEntity(FoodRequest request);

	// 2. Entity se Response mein status aur imageUrl ki mapping
	@Mapping(target = "status", source = "status")
	@Mapping(target = "imageUrl", source = "imageUrl") // Ye line check kar lena
	FoodResponse toResponse(Food food);
}