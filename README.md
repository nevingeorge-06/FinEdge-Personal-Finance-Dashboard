# Personal Finance Dashboard (Group 14)
### College of Engineering Thalassery — Object-Oriented Programming (OOP) Lab Project

A modern, responsive, professional fintech personal finance dashboard built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

---

## 🌟 Key Features
- **Modern Fintech Aesthetics**: Emerald green accents (`#10B981`), dark surface hierarchy (`slate-950` / `slate-900`), and backdrop-blur glassmorphism.
- **KPI Summary Cards**: Real-time Total Net Worth, Monthly Income, Monthly Expenses, and Savings Rate with dynamic trend indicators.
- **Interactive Visualizations (Recharts)**:
  - 6-month historical Cash Flow Area/Bar Chart (Income vs Expense vs Savings) with custom tooltips.
  - Expense category Donut Chart with total expenditure center-anchor and percentage breakdown.
- **Budget Tracking & Alerts**:
  - Dynamic progress bars with threshold monitoring (<80% Emerald, 80–100% Amber warning, >100% Rose exceeded alert).
  - Add new category budgets with customizable alert thresholds.
- **Transaction Ledger**:
  - Filterable by type (Income/Expense), Category, and date/amount sorting.
  - Instant modal to record new transactions with live state updates.
- **OOP Domain Alignment**:
  - Encapsulated account models (SBI Checking, HDFC Savings, Zerodha Equities).
  - Prepared for Java Spring Boot REST API integration & MySQL relational database.

---

## 📂 Project Structure

```
Personal-Finance-Dashboard/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/                  # Typed models matching Spring Boot DTOs
│   │   ├── transaction.ts
│   │   ├── budget.ts
│   │   ├── account.ts
│   │   └── analytics.ts
│   ├── api/                    # Decoupled API Integration Layer
│   │   ├── client.ts           # Toggle between Mock and Spring Boot
│   │   ├── transactionService.ts
│   │   ├── budgetService.ts
│   │   ├── analyticsService.ts
│   │   └── mockData.ts
│   ├── components/
│   │   ├── common/             # StatCard, ProgressBar, Badge, Modal
│   │   ├── layout/             # Sidebar, Header, ProjectBanner
│   │   ├── dashboard/          # SummaryCards, CashFlowChart, CategoryExpenses, BudgetProgress
│   │   ├── transactions/       # TransactionTable, TransactionFilters, AddTransactionModal
│   │   ├── budgets/            # BudgetOverview, AddBudgetModal
│   │   ├── analytics/          # AnalyticsDashboard
│   │   └── accounts/           # AccountsView
│   └── utils/
│       ├── formatters.ts       # INR currency, date, and color formatters
│       └── constants.ts
```

---

## 🚀 How to Run the Frontend

### Option 1: Direct Command (Recommended)
Open your terminal in the project directory and run:

```bash
pnpm dev
```
*(or `npm run dev`)*

The dashboard will be live at: **`http://localhost:5173`**

### Option 2: Windows Batch / PowerShell One-Click
Double click or run:
```powershell
.\start-dashboard.bat
```
or
```powershell
.\start-dashboard.ps1
```

---

## ☕ Connecting to Java Spring Boot Backend (Future Phase)
The API layer in [`src/api/client.ts`](file:///c:/Users/nevin/Downloads/Personal-Finance-Dashboard/src/api/client.ts) is fully decoupled.

To connect to your Java Spring Boot REST API:
1. In `src/api/client.ts`, set `useMockData: false` (or set `VITE_USE_MOCK_DATA=false` in `.env`).
2. Point `VITE_API_BASE_URL` to your Spring Boot server (e.g. `http://localhost:8080/api`).
3. The TypeScript types in `src/types/` map 1:1 with standard Java JPA entities and Spring DTO records.
