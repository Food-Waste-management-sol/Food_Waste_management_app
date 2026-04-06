package com.foodwaste.repository;

import com.foodwaste.entity.Request;
import com.foodwaste.entity.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {

    @Query("SELECT r FROM Request r JOIN FETCH r.food f JOIN FETCH f.restaurant res JOIN FETCH r.ngo n WHERE res.email = :email")
    List<Request> findByRestaurantEmail(@Param("email") String email);

    @Query("SELECT r FROM Request r JOIN FETCH r.food f JOIN FETCH r.ngo n WHERE n.email = :email")
    List<Request> findByNgoEmail(@Param("email") String email);

    List<Request> findByStatus(RequestStatus status);
}