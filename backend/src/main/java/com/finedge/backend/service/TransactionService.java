package com.finedge.backend.service;

import com.finedge.backend.dto.transaction.*;
import com.finedge.backend.entity.*;
import com.finedge.backend.entity.Transaction.*;
import com.finedge.backend.exception.ResourceNotFoundException;
import com.finedge.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Transaction service — orchestrates CRUD and filtering.
 * OOP Principle: Single Responsibility — business logic isolated from controllers and repositories.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    // ── Read ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAll(Long userId, String q, String type, String category,
                                            String sortBy, String order,
                                            String startDate, String endDate) {
        Specification<Transaction> spec = buildSpec(userId, q, type, category, startDate, endDate);

        List<Transaction> results = transactionRepository.findAll(spec);

        // Sorting
        Comparator<Transaction> comparator = "amount".equalsIgnoreCase(sortBy)
                ? Comparator.comparing(Transaction::getAmount)
                : Comparator.comparing(Transaction::getDate).thenComparing(Transaction::getCreatedAt);

        if ("asc".equalsIgnoreCase(order)) {
            results.sort(comparator);
        } else {
            results.sort(comparator.reversed());
        }

        return results.stream().map(TransactionResponse::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getById(Long userId, Long txId) {
        return transactionRepository.findByIdAndUserId(txId, userId)
                .map(TransactionResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + txId));
    }

    public List<TransactionResponse> getRecent(Long userId) {
        return transactionRepository
                .findTop5ByUserIdOrderByDateDescCreatedAtDesc(userId)
                .stream().map(TransactionResponse::from).collect(Collectors.toList());
    }

    // ── Write ───────────────────────────────────────────────────────────────

    @Transactional
    public TransactionResponse create(Long userId, TransactionRequest req, User user) {
        Transaction tx = Transaction.builder()
                .user(user)
                .description(req.description())
                .amount(req.amount())
                .type(parseEnum(TransactionType.class, req.type(), "type"))
                .category(req.category())
                .date(parseDate(req.date()))
                .paymentMethod(req.paymentMethod())
                .account(req.account())
                .notes(req.notes())
                .status(TransactionStatus.COMPLETED)
                .build();

        return TransactionResponse.from(transactionRepository.save(tx));
    }

    @Transactional
    public void delete(Long userId, Long txId) {
        Transaction tx = transactionRepository.findByIdAndUserId(txId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + txId));
        transactionRepository.delete(tx);
    }

    // ── Specification Builder ───────────────────────────────────────────────

    private Specification<Transaction> buildSpec(Long userId, String q, String type,
                                                  String category, String startDate, String endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (q != null && !q.isBlank()) {
                String pattern = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern),
                        cb.like(cb.lower(root.get("account")), pattern)
                ));
            }
            if (type != null && !type.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("type"),
                        parseEnum(TransactionType.class, type, "type")));
            }
            if (category != null && !category.equalsIgnoreCase("ALL")) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            if (startDate != null && !startDate.isBlank()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), parseDate(startDate)));
            }
            if (endDate != null && !endDate.isBlank()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), parseDate(endDate)));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private LocalDate parseDate(String date) {
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Expected YYYY-MM-DD: " + date);
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        try {
            return Enum.valueOf(enumClass, value.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid " + fieldName + " value: " + value);
        }
    }
}
