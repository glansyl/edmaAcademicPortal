package com.eadms.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Student student;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private Teacher teacher;
    
    public enum Role {
        ADMIN, TEACHER, STUDENT
    }
    
    public String getFullName() {
        try {
            if (student != null) {
                String firstName = student.getFirstName();
                String lastName = student.getLastName();
                if (firstName != null && lastName != null) {
                    return firstName + " " + lastName;
                }
            } else if (teacher != null) {
                String firstName = teacher.getFirstName();
                String lastName = teacher.getLastName();
                if (firstName != null && lastName != null) {
                    return firstName + " " + lastName;
                }
            } else if (role == Role.ADMIN) {
                // Return a proper name for admin users instead of email
                return "System Administrator";
            }
        } catch (Exception e) {
            // Handle lazy loading or deleted entity issues
            if (role == Role.ADMIN) {
                return "System Administrator";
            }
            return email;
        }
        return email; // Fallback for missing data
    }
}
