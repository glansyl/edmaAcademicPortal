package com.eadms.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "schedules", indexes = {
    @Index(name = "idx_schedule_course", columnList = "course_id"),
    @Index(name = "idx_schedule_day", columnList = "day_of_week"),
    @Index(name = "idx_schedule_teacher", columnList = "teacher_id"),
    @Index(name = "idx_schedule_datetime", columnList = "start_date_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;
    
    @Column(nullable = false, length = 200)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;
    
    @Column(name = "end_date_time", nullable = false)
    private LocalDateTime endDateTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecurrenceType recurrence = RecurrenceType.NONE;
    
    @Column(length = 100)
    private String location;
    
    // Legacy fields for backward compatibility
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week")
    private DayOfWeek dayOfWeek;
    
    @Column(name = "start_time")
    private LocalTime startTime;
    
    @Column(name = "end_time")
    private LocalTime endTime;
    
    @Column(name = "room_number", length = 50)
    private String roomNumber;
    
    @Column(name = "class_type", length = 50)
    private String classType; // LECTURE, LAB, TUTORIAL
    
    public enum RecurrenceType {
        NONE,    // One-time event
        WEEKLY   // Repeats weekly
    }
    
    // Helper methods for backward compatibility
    @PostLoad
    @PostPersist
    @PostUpdate
    private void syncLegacyFields() {
        if (startDateTime != null) {
            this.dayOfWeek = startDateTime.getDayOfWeek();
            this.startTime = startDateTime.toLocalTime();
        }
        if (endDateTime != null) {
            this.endTime = endDateTime.toLocalTime();
        }
        if (location != null && roomNumber == null) {
            this.roomNumber = location;
        }
    }
}
