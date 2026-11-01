package com.finedge.backend.service;

import com.finedge.backend.dto.analytics.*;
import com.finedge.backend.entity.Transaction.TransactionType;
import com.finedge.backend.repository.AccountRepository;
import com.finedge.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics service — derives insights from transaction and account data.
 * OOP Principle: Single Responsibility — analytics computation isolated.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    // ── Financial Summary ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getFinancialSummary(Long userId) {
        String currentMonth  = LocalDate.now().format(MONTH_FMT);
        String previousMonth = LocalDate.now().minusMonths(1).format(MONTH_FMT);

        BigDecimal netWorth   = accountRepository.sumBalanceByUserId(userId);
        BigDecimal liquid     = accountRepository.sumLiquidBalanceByUserId(userId);

        BigDecimal curIncome  = transactionRepository.sumIncomeByUserAndMonth(userId, currentMonth);
        BigDecimal curExpense = transactionRepository.sumExpensesByUserAndMonth(userId, currentMonth);
        BigDecimal prevIncome = transactionRepository.sumIncomeByUserAndMonth(userId, previousMonth);
        BigDecimal prevExp    = transactionRepository.sumExpensesByUserAndMonth(userId, previousMonth);

        BigDecimal savings    = curIncome.subtract(curExpense);
        double savingsRate    = curIncome.compareTo(BigDecimal.ZERO) > 0
                ? savings.divide(curIncome, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

        return new FinancialSummaryResponse(
                netWorth, liquid, curIncome, curExpense, savings, savingsRate,
                changePercent(prevIncome, curIncome),
                changePercent(prevExp, curExpense),
                0.0 // netWorthChange requires historical snapshots — placeholder
        );
    }

    // ── Cash Flow History ───────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CashFlowDataPoint> getCashFlowHistory(Long userId) {
        LocalDate now = LocalDate.now();
        LocalDate since = now.withDayOfMonth(1).minusMonths(5);
        List<Object[]> rows = transactionRepository.aggregateCashFlowSince(userId, since);

        // Pre-populate last 6 calendar months to guarantee complete comparative chart data
        Map<String, BigDecimal[]> monthMap = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            String m = now.minusMonths(i).format(MONTH_FMT);
            monthMap.put(m, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        }

        // Aggregate actual transaction amounts
        for (Object[] row : rows) {
            String month  = (String) row[0];
            String type   = row[1].toString();
            BigDecimal amt = (BigDecimal) row[2];

            if (monthMap.containsKey(month)) {
                if ("INCOME".equals(type))  monthMap.get(month)[0] = amt;
                if ("EXPENSE".equals(type)) monthMap.get(month)[1] = amt;
            }
        }

        return monthMap.entrySet().stream().map(e -> {
            BigDecimal income   = e.getValue()[0];
            BigDecimal expenses = e.getValue()[1];
            BigDecimal savings  = income.subtract(expenses).max(BigDecimal.ZERO);
            return new CashFlowDataPoint(e.getKey(), income, expenses, savings);
        }).collect(Collectors.toList());
    }

    // ── Category Expense Breakdown ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<CategoryExpenseBreakdown> getCategoryExpenses(Long userId) {
        String month = LocalDate.now().format(MONTH_FMT);
        List<Object[]> rows = transactionRepository.categoryExpenseBreakdown(userId, month);

        BigDecimal grandTotal = rows.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return rows.stream().map(r -> {
            String cat   = (String) r[0];
            BigDecimal amt = (BigDecimal) r[1];
            long count   = ((Number) r[2]).longValue();
            double pct   = grandTotal.compareTo(BigDecimal.ZERO) > 0
                    ? amt.divide(grandTotal, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;
            return new CategoryExpenseBreakdown(cat, amt, pct, categoryColor(cat), count);
        }).collect(Collectors.toList());
    }

    // ── Financial Health Score ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public FinancialHealthScore getHealthScore(Long userId) {
        String month = LocalDate.now().format(MONTH_FMT);
        BigDecimal income  = transactionRepository.sumIncomeByUserAndMonth(userId, month);
        BigDecimal expense = transactionRepository.sumExpensesByUserAndMonth(userId, month);

        int score = 50; // baseline
        List<String> insights = new ArrayList<>();

        if (income.compareTo(BigDecimal.ZERO) > 0) {
            double savingsRate = income.subtract(expense)
                    .divide(income, 4, RoundingMode.HALF_UP).doubleValue() * 100;

            if (savingsRate >= 20) { score += 25; insights.add("Great savings rate of " + Math.round(savingsRate) + "%"); }
            else if (savingsRate >= 10) { score += 10; insights.add("Savings rate of " + Math.round(savingsRate) + "% — aim for 20%"); }
            else { score -= 10; insights.add("Low savings rate — try to reduce discretionary spending"); }

            if (expense.compareTo(income) < 0) { score += 15; insights.add("Spending is within income limits"); }
            else { score -= 15; insights.add("Expenses exceed income this month"); }
        } else {
            insights.add("No income recorded this month — add your transactions");
        }

        score = Math.max(0, Math.min(100, score));
        String rating = score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : score >= 40 ? "FAIR" : "NEEDS_ATTENTION";
        return new FinancialHealthScore(score, rating, insights);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private double changePercent(BigDecimal prev, BigDecimal current) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return current.subtract(prev).divide(prev, 4, RoundingMode.HALF_UP).doubleValue() * 100;
    }

    private String categoryColor(String category) {
        return switch (category.toLowerCase()) {
            case "food & dining"   -> "#F59E0B";
            case "housing"         -> "#6366F1";
            case "transportation"  -> "#3B82F6";
            case "utilities"       -> "#8B5CF6";
            case "entertainment"   -> "#EC4899";
            case "healthcare"      -> "#EF4444";
            case "education"       -> "#10B981";
            case "shopping"        -> "#F97316";
            case "groceries"       -> "#84CC16";
            case "personal care"   -> "#06B6D4";
            case "salary"          -> "#22C55E";
            case "investments"     -> "#A855F7";
            default                -> "#14B8A6";
        };
    }
}
