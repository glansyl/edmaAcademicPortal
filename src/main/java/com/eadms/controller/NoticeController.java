package com.eadms.controller;

import com.eadms.dto.request.NoticeRequest;
import com.eadms.dto.response.ApiResponse;
import com.eadms.dto.response.NoticeResponse;
import com.eadms.entity.User;
import com.eadms.service.AuthService;
import com.eadms.service.NoticeService;
import com.eadms.util.ResponseUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {
    
    private final NoticeService noticeService;
    private final AuthService authService;
    
    // Admin endpoints
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NoticeResponse>> createNotice(@Valid @RequestBody NoticeRequest request) {
        User currentUser = authService.getCurrentUser();
        NoticeResponse notice = noticeService.createNotice(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ResponseUtil.success("Notice created successfully", notice));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NoticeResponse>> updateNotice(
            @PathVariable Long id,
            @Valid @RequestBody NoticeRequest request) {
        NoticeResponse notice = noticeService.updateNotice(id, request);
        return ResponseEntity.ok(ResponseUtil.success("Notice updated successfully", notice));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(ResponseUtil.success("Notice deleted successfully", null));
    }
    
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getAllNotices() {
        List<NoticeResponse> notices = noticeService.getAllNotices();
        return ResponseEntity.ok(ResponseUtil.success("Notices retrieved", notices));
    }
    
    // Public endpoints (for all authenticated users)
    @GetMapping
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getNoticesForCurrentUser() {
        User currentUser = authService.getCurrentUser();
        List<NoticeResponse> notices = noticeService.getNoticesForRole(currentUser.getRole().name());
        return ResponseEntity.ok(ResponseUtil.success("Notices retrieved", notices));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoticeResponse>> getNoticeById(@PathVariable Long id) {
        NoticeResponse notice = noticeService.getNoticeById(id);
        return ResponseEntity.ok(ResponseUtil.success("Notice retrieved", notice));
    }
    
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<NoticeResponse>>> getActiveNotices() {
        List<NoticeResponse> notices = noticeService.getActiveNotices();
        return ResponseEntity.ok(ResponseUtil.success("Active notices retrieved", notices));
    }
}
