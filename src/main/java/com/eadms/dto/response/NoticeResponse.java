package com.eadms.dto.response;

import com.eadms.entity.Notice;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeResponse {
    
    private Long id;
    private String title;
    private String content;
    private Notice.Priority priority;
    private Notice.TargetAudience targetAudience;
    private Boolean isActive;
    private String createdByName;
    private Long createdById;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
}
