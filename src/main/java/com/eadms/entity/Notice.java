package com.eadms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetAudience targetAudience;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
    
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime expiresAt;
    
    public enum Priority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }
    
    public enum TargetAudience {
        ALL,
        STUDENTS,
        TEACHERS,
        ADMINS
    }
}
