package com.eadms.dto.request;

import com.eadms.entity.Notice;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoticeRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Content is required")
    private String content;
    
    @NotNull(message = "Priority is required")
    private Notice.Priority priority;
    
    @NotNull(message = "Target audience is required")
    private Notice.TargetAudience targetAudience;
    
    private LocalDateTime expiresAt;
    
    @Builder.Default
    private Boolean isActive = true;
}
