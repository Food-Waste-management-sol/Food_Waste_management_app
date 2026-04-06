package com.foodwaste.repository;

import com.foodwaste.entity.Food;
import com.foodwaste.entity.enums.FoodStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findByStatus(FoodStatus status);

    List<Food> findByRestaurantId(Long restaurantId);
    @Modifying
    @Transactional
    @Query("UPDATE Food f SET f.status = 'EXPIRED' WHERE f.expiryTime < :now AND f.status = 'AVAILABLE'")
    void updateExpiredFood(@Param("now") LocalDateTime now);


}
