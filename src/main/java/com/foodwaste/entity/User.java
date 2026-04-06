package com.foodwaste.entity;

import com.foodwaste.entity.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "users")
@Getter @Setter @Builder
@NoArgsConstructor @AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "restaurant", cascade = CascadeType.ALL)
    @JsonIgnore // 🔥 User fetch karte waqt uske saare foods nahi chahiye JSON mein
    private List<Food> foods;

    @OneToMany(mappedBy = "ngo", cascade = CascadeType.ALL)
    @JsonIgnore // 🔥 NGO fetch karte waqt uski requests ki list nahi chahiye
    private List<Request> requests;
}