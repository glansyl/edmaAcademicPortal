package com.eadms.repository;

import com.eadms.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Ticket> findByStatusOrderByCreatedAtDesc(Ticket.Status status);
    List<Ticket> findAllByOrderByCreatedAtDesc();
}
