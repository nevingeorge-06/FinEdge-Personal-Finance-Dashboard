# FinEdge Backend — Setup Guide

## Prerequisites

You need to install these before running the backend:

### 1. Java 21 (JDK)

Download and install **Temurin JDK 21** (free, open-source):
- 🔗 https://adoptium.net/temurin/releases/?version=21
- Choose: **Windows**, **x64**, **JDK**, **.msi installer**
- Run the installer — it sets `JAVA_HOME` automatically

Verify:
```powershell
java -version
# Expected: openjdk version "21.x.x"
```

### 2. Apache Maven 3.9+

Download **Maven 3.9** binary zip:
- 🔗 https://maven.apache.org/download.cgi
- Download: `apache-maven-3.9.x-bin.zip`
- Extract to: `C:\Program Files\Maven\`
- Add to PATH: `C:\Program Files\Maven\apache-maven-3.9.x\bin`

Or install via **WinGet**:
```powershell
winget install Apache.Maven
```

Verify:
```powershell
mvn -version
# Expected: Apache Maven 3.9.x
```

### 3. MySQL 8.x

Download **MySQL Community Server 8.x**:
- 🔗 https://dev.mysql.com/downloads/mysql/
- Use the **Windows MSI Installer**
- During setup: set root password and note it down

Or install via WinGet:
```powershell
winget install Oracle.MySQL
```

---

## Database Setup

### Option A — Automatic (recommended)

The `application.properties` already has:
```
spring.datasource.url=jdbc:mysql://localhost:3306/finedge_db?createDatabaseIfNotExist=true
spring.jpa.hibernate.ddl-auto=update
```

The database and all tables are **created automatically** on first startup.

### Option B — Manual SQL Script

```sql
-- Run in MySQL Workbench or mysql CLI
CREATE DATABASE IF NOT EXISTS finedge_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'finedge_user'@'localhost' IDENTIFIED BY 'finedge_pass';
GRANT ALL PRIVILEGES ON finedge_db.* TO 'finedge_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
# Update these two lines with your MySQL credentials:
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
```

### Generate a Secure JWT Secret

```powershell
# PowerShell — generate a 256-bit Base64 secret:
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.Convert]::ToBase64String($bytes)
```

Paste the output into `application.properties`:
```properties
finedge.jwt.secret=<paste-your-generated-secret-here>
```

---

## Running the Backend

```powershell
# From the project root:
cd backend

# Build and run:
mvn spring-boot:run

# OR build JAR and run:
mvn clean package -DskipTests
java -jar target/finedge-backend-1.0.0.jar
```

The backend starts at: **http://localhost:8080**

---

## Running Tests

```powershell
cd backend

# Run all tests (uses H2 in-memory — no MySQL needed):
mvn test

# Run a specific test class:
mvn test -Dtest=TransactionServiceTest

# Run with coverage report:
mvn verify
```

---

## Running Both Applications

Open **two terminals**:

**Terminal 1 — Backend:**
```powershell
cd C:\Users\nevin\Downloads\Personal-Finance-Dashboard\backend
mvn spring-boot:run
```

**Terminal 2 — Frontend:**
```powershell
$env:PATH = "C:\Users\nevin\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;" + $env:PATH
cd C:\Users\nevin\Downloads\Personal-Finance-Dashboard
pnpm dev
```

Then open: **http://localhost:5173**

---

## Switching Frontend from Mock to Live Data

Edit `.env.local` in the project root (create if missing):
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8080/api
```

This switches all API services to use the real Spring Boot backend.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/transactions` | List transactions (with filters) |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/{id}` | Get single transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/budgets` | List budgets |
| POST | `/api/budgets` | Create budget |
| PUT | `/api/budgets/{id}` | Update budget |
| DELETE | `/api/budgets/{id}` | Delete budget |
| GET | `/api/budgets/summary` | Budget summary |
| GET | `/api/accounts` | List accounts |
| POST | `/api/accounts` | Create account |
| PUT | `/api/accounts/{id}` | Update account |
| DELETE | `/api/accounts/{id}` | Delete account |
| GET | `/api/analytics/summary` | Financial summary |
| GET | `/api/analytics/cash-flow` | 6-month cash flow |
| GET | `/api/analytics/category-expenses` | Spending by category |
| GET | `/api/analytics/health-score` | Financial health score |

### Authentication

All endpoints except `/api/auth/*` require:
```
Authorization: Bearer <your-jwt-token>
```

### Quick Test with curl

```powershell
# Register:
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"fullName":"Ravi Kumar","email":"ravi@example.com","password":"password123"}'

# Login:
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"ravi@example.com","password":"password123"}'

# Use the token from the response above:
$TOKEN = "eyJ..."

# Get transactions:
curl http://localhost:8080/api/transactions `
  -H "Authorization: Bearer $TOKEN"
```

---

## Project Structure

```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/finedge/backend/
    │   │   ├── FinEdgeApplication.java      ← Entry point
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java      ← JWT + Spring Security
    │   │   │   └── CorsConfig.java          ← CORS for Vite dev server
    │   │   ├── controller/                  ← REST controllers
    │   │   ├── dto/                         ← Request/Response records
    │   │   ├── entity/                      ← JPA entities (User, Transaction, Budget, Account)
    │   │   ├── exception/                   ← Global error handler
    │   │   ├── repository/                  ← Spring Data JPA repos
    │   │   ├── security/                    ← JWT util + filter
    │   │   └── service/                     ← Business logic layer
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/finedge/backend/
            ├── FinEdgeApplicationTests.java  ← Context load test
            ├── controller/
            │   └── AuthControllerTest.java  ← MockMvc tests
            └── service/
                ├── AuthServiceTest.java     ← Mockito unit tests
                └── TransactionServiceTest.java
```
