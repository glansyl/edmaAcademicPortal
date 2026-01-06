package com.eadms.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CORS Test Controller - For debugging CORS issues
 */
@RestController
@RequestMapping("/api/cors-test")
public class CorsTestController {
    
    @GetMapping
    public ResponseEntity<Map<String, String>> testCors() {
        return ResponseEntity.ok(Map.of(
            "message", "CORS is working!",
            "timestamp", String.valueOf(System.currentTimeMillis()),
            "status", "success"
        ));
    }
    
    @PostMapping
    public ResponseEntity<Map<String, String>> testCorsPost(@RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
            "message", "CORS POST is working!",
            "received", body != null ? body.toString() : "no body",
            "timestamp", String.valueOf(System.currentTimeMillis()),
            "status", "success"
        ));
    }
}