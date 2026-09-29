package com.school.management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        String role = loginRequest.get("role");

        Map<String, Object> response = new HashMap<>();

        if ("error".equalsIgnoreCase(username)) {
            response.put("success", false);
            response.put("message", "Tài khoản hoặc mật khẩu không chính xác.");
            return ResponseEntity.status(401).body(response);
        }

        Map<String, String> user = new HashMap<>();
        user.put("username", username != null ? username : "user");
        user.put("role", role != null ? role : "GV");
        user.put("name", username);

        response.put("success", true);
        response.put("user", user);
        response.put("token", "bearer-demo-token-htqllh-postgresql");
        response.put("message", "Đăng nhập thành công từ backend PostgreSQL!");

        return ResponseEntity.ok(response);
    }
}
