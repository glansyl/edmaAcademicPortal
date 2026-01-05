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
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                URI dbUri = new URI(databaseUrl);
                
                // Validate and extract components
                // Use getRawUserInfo to avoid premature decoding which breaks parsing if username has encoded colons
                String userInfo = dbUri.getRawUserInfo();
                if (userInfo == null) {
                    throw new RuntimeException("DATABASE_URL missing username and password");
                }
                
                // Fix: Handle passwords containing colons by splitting only on the first colon
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
                
                // Fix: Preserve query parameters (essential for SSL configuration like ?sslmode=require)
                String query = dbUri.getRawQuery();
                String jdbcUrl = String.format("jdbc:postgresql://%s:%d%s%s", 
                    host, 
                    port, 
                    path,
                    (query != null && !query.isEmpty()) ? "?" + query : "");
                
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
        
        // No fallback - DATABASE_URL must be set in production
        throw new RuntimeException("DATABASE_URL environment variable is required but not set");
    }
}
