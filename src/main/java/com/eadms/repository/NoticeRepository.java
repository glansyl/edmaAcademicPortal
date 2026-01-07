package com.eadms.repository;

import com.eadms.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    
    List<Notice> findByIsActiveTrueOrderByCreatedAtDesc();
    
    @Query("SELECT n FROM Notice n WHERE n.isActive = true " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "AND (n.targetAudience = :audience OR n.targetAudience = 'ALL') " +
           "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notice> findActiveNoticesForAudience(
        @Param("audience") Notice.TargetAudience audience,
        @Param("now") LocalDateTime now
    );
    
    @Query("SELECT n FROM Notice n WHERE n.isActive = true " +
           "AND (n.expiresAt IS NULL OR n.expiresAt > :now) " +
           "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notice> findAllActiveNotices(@Param("now") LocalDateTime now);
    
    List<Notice> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
}
