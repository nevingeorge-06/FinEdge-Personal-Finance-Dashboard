package com.finedge.backend.dto.analytics;

import java.math.BigDecimal;

/** One data point in the cash-flow chart — matches frontend CashFlowDataPoint. */
public record CashFlowDataPoint(
        String month,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal savings
) {}
