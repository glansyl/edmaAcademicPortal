package com.eadms.service;

import com.eadms.dto.request.LoginRequest;
import com.eadms.dto.response.LoginResponse;
import com.eadms.entity.User;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    User registerUser(String email, String password, User.Role role);
    User getCurrentUser();
}
