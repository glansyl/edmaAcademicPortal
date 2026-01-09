package com.eadms.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Slf4j
@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        // If DATABASE_URL is not set as environment variable, try to get it from system properties
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            databaseUrl = System.getProperty("DATABASE_URL");
        }
        
        // If still not found, use the default from application-prod.properties
        if (databaseUrl == null || databaseUrl.isEmpty()) {
            databaseUrl = "postgresql://glansyldsouza:Zv1Dt7YUOM1ksUnIoA2OEyzD3L3EIAIh@dpg-d5fn7dpr0fns73busteg-a.oregon-postgres.render.com/edmadb_vwl0";
            log.info("Using default DATABASE_URL from configuration");
        }
        
        try {
            URI dbUri = new URI(databaseUrl);
            
            // Validate and extract components
            String userInfo = dbUri.getRawUserInfo();
            if (userInfo == null) {
                throw new RuntimeException("DATABASE_URL missing username and password");
            }
            
            // Handle passwords containing colons by splitting only on the first colon
            int firstColonIndex = userInfo.indexOf(':');
            if (firstColonIndex == -1) {
                throw new RuntimeException("DATABASE_URL has invalid user info format");
            }
            
            // Decode after splitting to handle special characters correctly
            String username = java.net.URLDecoder.decode(userInfo.substring(0, firstColonIndex), java.nio.charset.StandardCharsets.UTF_8);
            String password = java.net.URLDecoder.decode(userInfo.substring(firstColonIndex + 1), java.nio.charset.StandardCharsets.UTF_8);
            
            String host = dbUri.getHost();
            int port = dbUri.getPort() == -1 ? 5432 : dbUri.getPort();
            String path = dbUri.getPath();
            
            if (host == null || host.isEmpty()) {
                throw new RuntimeException("DATABASE_URL missing host");
            }
            
            if (path == null || path.isEmpty()) {
                path = "/postgres"; // Default database name
            }
            
            // Preserve query parameters (essential for SSL configuration like ?sslmode=require)
            String query = dbUri.getRawQuery();
            
            // Render PostgreSQL requires SSL - ensure sslmode is set
            String jdbcUrl;
            if (query != null && !query.isEmpty()) {
                // Query parameters exist - check if sslmode is already set
                if (!query.contains("sslmode")) {
                    jdbcUrl = String.format("jdbc:postgresql://%s:%d%s?%s&sslmode=require", 
                        host, port, path, query);
                } else {
                    jdbcUrl = String.format("jdbc:postgresql://%s:%d%s?%s", 
                        host, port, path, query);
                }
            } else {
                // No query parameters - add sslmode=require for Render compatibility
                jdbcUrl = String.format("jdbc:postgresql://%s:%d%s?sslmode=require", 
                    host, port, path);
            }
            
            log.info("Connecting to database: {} with user: {}", jdbcUrl, username);
            
            return DataSourceBuilder
                    .create()
                    .url(jdbcUrl)
                    .username(username)
                    .password(password)
                    .driverClassName("org.postgresql.Driver")
                    .build();
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid DATABASE_URL format: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse DATABASE_URL: " + e.getMessage(), e);
        }
    }
}