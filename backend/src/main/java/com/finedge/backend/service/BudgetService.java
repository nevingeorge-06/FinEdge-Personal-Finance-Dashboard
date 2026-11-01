package com.finedge.backend.service;

import com.finedge.backend.dto.budget.*;
import com.finedge.backend.entity.*;
import com.finedge.backend.exception.ResourceNotFoundException;
import com.finedge.backend.repository.BudgetRepository;
import com.finedge.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Budget service — manages per-category spending limits.
 * OOP Principle: Encapsulation — budget computations hidden from controllers.
 */
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final Set<String> INCOME_CATEGORIES = Set.of("salary", "freelance", "investments");

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(Long userId) {
        String currentMonth = currentMonth();
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCategoryAsc(userId);

        // Dynamically compute spent amount strictly from EXPENSE transactions
        return budgets.stream().map(b -> {
            String month = b.getMonth() != null ? b.getMonth() : currentMonth;
            BigDecimal spent = transactionRepository.sumExpensesByUserCategoryAndMonth(userId, b.getCategory(), month);
            b.setSpentAmount(spent != null ? spent : BigDecimal.ZERO);
            return BudgetResponse.from(b);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BudgetSummaryResponse getSummary(Long userId) {
        String month = currentMonth();
        List<Budget> budgets = budgetRepository.findByUserIdOrderByCategoryAsc(userId)
                .stream().filter(b -> b.getMonth().equals(month)).collect(Collectors.toList());

        BigDecimal totalBudgeted = budgets.stream()
                .map(Budget::getAllocatedAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalSpent = budgets.stream()
                .map(b -> {
                    BigDecimal spent = transactionRepository.sumExpensesByUserCategoryAndMonth(userId, b.getCategory(), month);
                    return spent != null ? spent : BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remaining = totalBudgeted.subtract(totalSpent).max(BigDecimal.ZERO);
        double pct = totalBudgeted.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(totalBudgeted, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;
        long overCount = budgets.stream()
                .filter(b -> {
                    BigDecimal spent = transactionRepository.sumExpensesByUserCategoryAndMonth(userId, b.getCategory(), month);
                    return spent != null && spent.compareTo(b.getAllocatedAmount()) > 0;
                }).count();

        return new BudgetSummaryResponse(totalBudgeted, totalSpent, remaining, pct, overCount);
    }

    @Transactional
    public BudgetResponse create(Long userId, BudgetRequest req, User user) {
        if (req.category() != null && INCOME_CATEGORIES.contains(req.category().trim().toLowerCase())) {
            throw new IllegalArgumentException("Budgets are spending limits for expense categories only. '"
                    + req.category() + "' is an income category.");
        }

        String month = req.month() != null ? req.month() : currentMonth();

        Budget budget = Budget.builder()
                .user(user)
                .category(req.category())
                .allocatedAmount(req.allocatedAmount())
                .period(parseEnum(Budget.BudgetPeriod.class, req.period(), "period"))
                .month(month)
                .color(req.color() != null ? req.color() : defaultColor(req.category()))
                .isAlertEnabled(true)
                .alertThresholdPercent(req.alertThresholdPercent() != null ? req.alertThresholdPercent() : 80)
                .build();

        return BudgetResponse.from(budgetRepository.save(budget));
    }

    @Transactional
    public BudgetResponse update(Long userId, Long budgetId, BudgetRequest req) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + budgetId));

        budget.setCategory(req.category());
        budget.setAllocatedAmount(req.allocatedAmount());
        if (req.period() != null) {
            budget.setPeriod(parseEnum(Budget.BudgetPeriod.class, req.period(), "period"));
        }
        if (req.color() != null) budget.setColor(req.color());
        if (req.alertThresholdPercent() != null) budget.setAlertThresholdPercent(req.alertThresholdPercent());

        return BudgetResponse.from(budgetRepository.save(budget));
    }

    @Transactional
    public void delete(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found: " + budgetId));
        budgetRepository.delete(budget);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private String currentMonth() {
        return LocalDate.now().format(MONTH_FMT);
    }

    private String defaultColor(String category) {
        return switch (category.toLowerCase()) {
            case "food & dining"  -> "#F59E0B";
            case "housing"        -> "#6366F1";
            case "transportation" -> "#3B82F6";
            case "utilities"      -> "#8B5CF6";
            case "entertainment"  -> "#EC4899";
            case "healthcare"     -> "#EF4444";
            case "education"      -> "#10B981";
            case "shopping"       -> "#F97316";
            default               -> "#14B8A6";
        };
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String field) {
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + field + " value: " + value);
        }
    }
}
