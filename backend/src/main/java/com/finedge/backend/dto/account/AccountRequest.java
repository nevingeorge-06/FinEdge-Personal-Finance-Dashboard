package com.finedge.backend.dto.account;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

/** Account creation/update request DTO. */
public record AccountRequest(
        @NotBlank @Size(max = 120)
        String name,

        @NotBlank
        String type,       // CHECKING | SAVINGS | INVESTMENT | CREDIT_CARD | CASH

        @JsonAlias({"openingBalance", "initialBalance", "investmentAmount", "amount"})
        BigDecimal balance,

        @Size(max = 10)
        String currency,

        @Size(max = 20)
        String accountNumberMasked,

        @Size(max = 80)
        String institution,

        boolean isPrimary
) {}
