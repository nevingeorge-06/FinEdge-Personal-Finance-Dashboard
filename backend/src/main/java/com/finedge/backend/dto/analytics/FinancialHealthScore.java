package com.finedge.backend.dto.analytics;

import java.util.List;

/** Financial health score — matches frontend FinancialHealthScore. */
public record FinancialHealthScore(
        int score,
        String rating,
        List<String> insights
) {}
