package com.eadms.service;

import com.eadms.dto.request.NoticeRequest;
import com.eadms.dto.response.NoticeResponse;
import com.eadms.entity.Notice;
import com.eadms.entity.User;
import com.eadms.exception.ResourceNotFoundException;
import com.eadms.repository.NoticeRepository;
import com.eadms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NoticeServiceImpl implements NoticeService {
    
    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional
    public NoticeResponse createNotice(NoticeRequest request, Long createdById) {
        User createdBy = userRepository.findById(createdById)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", createdById));
        
        Notice notice = Notice.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .priority(request.getPriority())
                .targetAudience(request.getTargetAudience())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .expiresAt(request.getExpiresAt())
                .createdBy(createdBy)
                .build();
        
        Notice savedNotice = noticeRepository.save(notice);
        log.info("Notice created: {} by user: {}", savedNotice.getId(), createdById);
        
        return mapToResponse(savedNotice);
    }
    
    @Override
    @Transactional
    public NoticeResponse updateNotice(Long id, NoticeRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setPriority(request.getPriority());
        notice.setTargetAudience(request.getTargetAudience());
        notice.setIsActive(request.getIsActive() != null ? request.getIsActive() : notice.getIsActive());
        notice.setExpiresAt(request.getExpiresAt());
        
        Notice updatedNotice = noticeRepository.save(notice);
        log.info("Notice updated: {}", id);
        
        return mapToResponse(updatedNotice);
    }
    
    @Override
    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        
        noticeRepository.delete(notice);
        log.info("Notice deleted: {}", id);
    }
    
    @Override
    public NoticeResponse getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice", "id", id));
        
        return mapToResponse(notice);
    }
    
    @Override
    public List<NoticeResponse> getAllNotices() {
        return noticeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NoticeResponse> getActiveNotices() {
        return noticeRepository.findAllActiveNotices(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<NoticeResponse> getNoticesForRole(String role) {
        Notice.TargetAudience audience;
        
        switch (role.toUpperCase()) {
            case "ADMIN":
                audience = Notice.TargetAudience.ADMINS;
                break;
            case "TEACHER":
                audience = Notice.TargetAudience.TEACHERS;
                break;
            case "STUDENT":
                audience = Notice.TargetAudience.STUDENTS;
                break;
            default:
                return getActiveNotices();
        }
        
        return noticeRepository.findActiveNoticesForAudience(audience, LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    private NoticeResponse mapToResponse(Notice notice) {
        boolean isExpired = notice.getExpiresAt() != null && 
                           notice.getExpiresAt().isBefore(LocalDateTime.now());
        
        return NoticeResponse.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .priority(notice.getPriority())
                .targetAudience(notice.getTargetAudience())
                .isActive(notice.getIsActive())
                .createdById(notice.getCreatedBy() != null ? notice.getCreatedBy().getId() : null)
                .createdByName(notice.getCreatedBy() != null ? notice.getCreatedBy().getEmail() : "System")
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .expiresAt(notice.getExpiresAt())
                .isExpired(isExpired)
                .build();
    }
}
