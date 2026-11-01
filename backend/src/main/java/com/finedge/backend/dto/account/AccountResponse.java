package com.finedge.backend.dto.account;

import com.finedge.backend.entity.Account;
import java.math.BigDecimal;

/** Account response DTO — matches frontend Account interface. */
public record AccountResponse(
        String id,
        String name,
        String type,
        BigDecimal balance,
        String currency,
        String accountNumberMasked,
        String institution,
        boolean isPrimary
) {
    public static AccountResponse from(Account a) {
        return new AccountResponse(
                a.getId().toString(),
                a.getName(),
                a.getType().name(),
                a.getBalance(),
                a.getCurrency(),
                a.getAccountNumberMasked(),
                a.getInstitution(),
                a.isPrimary()
        );
    }
}
