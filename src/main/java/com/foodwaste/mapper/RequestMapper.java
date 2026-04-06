package com.foodwaste.mapper;

import com.foodwaste.dto.response.RequestResponse;
import com.foodwaste.entity.Request;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {FoodMapper.class, UserMapper.class})
public interface RequestMapper {

    @Mapping(target = "food", source = "food")
    @Mapping(target = "ngo", source = "ngo")
    RequestResponse toResponse(Request request);
}