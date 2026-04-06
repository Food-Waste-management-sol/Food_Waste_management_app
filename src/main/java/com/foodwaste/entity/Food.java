package com.foodwaste.entity;
import com.foodwaste.entity.Request; // ✅ YE ADD KARO
import com.foodwaste.entity.enums.FoodStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
//package com.foodwaste.entity;

import com.foodwaste.entity.enums.FoodStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "foods")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class Food {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private int quantity;
    private String location;
    private LocalDateTime expiryTime;

    @Enumerated(EnumType.STRING)
    private FoodStatus status;

    @ManyToOne
    @JoinColumn(name = "restaurant_id", nullable = false)
    @JsonIgnore
    private User restaurant;

    @OneToMany(mappedBy = "food", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Request> requests;

    @Column(length = 500)
    private String imageUrl;

    @Column(name = "freshness_score")
    private Double freshnessScore;

    @Column(name = "ai_status")
    private String aiStatus;
}