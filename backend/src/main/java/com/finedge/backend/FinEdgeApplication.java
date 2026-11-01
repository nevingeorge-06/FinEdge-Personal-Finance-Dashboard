package com.finedge.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * FinEdge Personal Finance Dashboard — Spring Boot Entry Point.
 * OOP Principle: Single Responsibility — this class only bootstraps the application.
 */
@SpringBootApplication
public class FinEdgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinEdgeApplication.class, args);
    }
}
