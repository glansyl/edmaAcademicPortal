package com.eadms.service;

import com.eadms.dto.request.NoticeRequest;
import com.eadms.dto.response.NoticeResponse;
import com.eadms.entity.Notice;

import java.util.List;

public interface NoticeService {
    NoticeResponse createNotice(NoticeRequest request, Long createdById);
    NoticeResponse updateNotice(Long id, NoticeRequest request);
    void deleteNotice(Long id);
    NoticeResponse getNoticeById(Long id);
    List<NoticeResponse> getAllNotices();
    List<NoticeResponse> getActiveNotices();
    List<NoticeResponse> getNoticesForRole(String role);
}
