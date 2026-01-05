package com.eadms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teachers", indexes = {
    @Index(name = "idx_teacher_id", columnList = "teacherId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Teacher extends BaseEntity {
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false, unique = true)
    private String teacherId;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    private String contactNumber;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToMany(mappedBy = "teachers")
    @Builder.Default
    private List<Course> courses = new ArrayList<>();
    
    public String getFullName() {
        return firstName + " " + lastName;
    }
}
