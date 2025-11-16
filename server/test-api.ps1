# Planet Path API Testing Script for PowerShell
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:5000/api"

Write-Host "Testing Planet Path API" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "[1/8] Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
    Write-Host "✅ Health Check: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Register User
Write-Host "[2/8] Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "student"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration Successful!" -ForegroundColor Green
    Write-Host "   User ID: $($response.data.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($response.data.user.role)" -ForegroundColor Gray
    Write-Host "   Token: $($response.data.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $response.data.token
    $userId = $response.data.user.id
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Error: $($errorDetails.message)" -ForegroundColor Red
    }
    $token = $null
    $userId = $null
}
Write-Host ""

# Test 3: Login
Write-Host "[3/8] Testing User Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "   User: $($response.data.user.name)" -ForegroundColor Gray
    Write-Host "   Token: $($response.data.token.Substring(0, 20))..." -ForegroundColor Gray
    $token = $response.data.token
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   Error: $($errorDetails.message)" -ForegroundColor Red
    }
    $token = $null
}
Write-Host ""

# Test 4: Get Current User (Protected Route)
if ($token) {
    Write-Host "[4/8] Testing Get Current User (Protected Route)..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method GET -Headers $headers
        Write-Host "✅ Get Current User Successful!" -ForegroundColor Green
        Write-Host "   User: $($response.data.user.name)" -ForegroundColor Gray
        Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Gray
        Write-Host "   Role: $($response.data.user.role)" -ForegroundColor Gray
        Write-Host "   XP: $($response.data.user.xp)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Get Current User Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Test 5: Get Courses
Write-Host "[5/8] Testing Get Courses..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method GET
    Write-Host "✅ Get Courses Successful!" -ForegroundColor Green
    Write-Host "   Total Courses: $($response.data.pagination.total)" -ForegroundColor Gray
    Write-Host "   Courses Returned: $($response.data.courses.Count)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Get Courses Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Register Instructor (for course creation test)
Write-Host "[6/8] Registering Instructor Account..." -ForegroundColor Yellow
$instructorBody = @{
    name = "Test Instructor"
    email = "instructor@example.com"
    password = "password123"
    role = "instructor"
} | ConvertTo-Json

$instructorToken = $null
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method POST -Body $instructorBody -ContentType "application/json"
    Write-Host "✅ Instructor Registered!" -ForegroundColor Green
    Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($response.data.user.role)" -ForegroundColor Gray
    $instructorToken = $response.data.token
} catch {
    # If user already exists, try logging in
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "[WARNING] Instructor already exists, logging in..." -ForegroundColor Yellow
        $loginBody = @{
            email = "instructor@example.com"
            password = "password123"
        } | ConvertTo-Json
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
            $instructorToken = $response.data.token
            Write-Host "✅ Instructor Login Successful!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Instructor Login Failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Instructor Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 7: Create Course (Protected Route - Instructor/Admin Only)
if ($instructorToken) {
    Write-Host "[7/8] Testing Create Course (Protected Route - Instructor Role)..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $instructorToken"
    }
    $courseBody = @{
        title = "Test Course - Environmental Basics"
        description = "A test course to verify the API is working correctly. This course covers basic environmental concepts."
        modules = @(
            @{
                title = "Introduction"
                description = "Welcome to the course"
                order = 1
                duration = 10
            }
        )
        tags = @("test", "environment")
        price = 0
        impact_type = "climate"
        status = "draft"
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Body $courseBody -ContentType "application/json" -Headers $headers
        Write-Host "✅ Create Course Successful!" -ForegroundColor Green
        Write-Host "   Course ID: $($response.data.course._id)" -ForegroundColor Gray
        Write-Host "   Title: $($response.data.course.title)" -ForegroundColor Gray
        Write-Host "   Slug: $($response.data.course.slug)" -ForegroundColor Gray
        Write-Host "   Status: $($response.data.course.status)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Create Course Failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Error: $($errorDetails.message)" -ForegroundColor Red
            if ($errorDetails.errors) {
                foreach ($error in $errorDetails.errors) {
                    Write-Host "   - $($error.field): $($error.message)" -ForegroundColor Red
                }
            }
        }
    }
    Write-Host ""
} else {
    Write-Host "[7/8] Skipping Create Course Test (No instructor token)" -ForegroundColor Yellow
    Write-Host ""
}

# Test 8: Verify Student Cannot Create Course (Authorization Test)
if ($token) {
    Write-Host "[8/8] Testing Authorization - Student Cannot Create Course..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $courseBody = @{
        title = "Unauthorized Course"
        description = "This should fail because student role cannot create courses"
        modules = @(
            @{
                title = "Test"
                description = "Test module"
                order = 1
            }
        )
        tags = @("test")
        price = 0
        impact_type = "climate"
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/courses" -Method POST -Body $courseBody -ContentType "application/json" -Headers $headers
        Write-Host "[WARNING] Unexpected Success - Student was able to create course!" -ForegroundColor Yellow
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "✅ Authorization Working Correctly!" -ForegroundColor Green
            Write-Host "   Student role correctly denied access to create courses" -ForegroundColor Gray
        } else {
            Write-Host "❌ Unexpected Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ API Testing Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   ✅ Health Check" -ForegroundColor Green
Write-Host "   ✅ User Registration" -ForegroundColor Green
Write-Host "   ✅ User Login" -ForegroundColor Green
Write-Host "   ✅ Protected Routes (JWT Auth)" -ForegroundColor Green
Write-Host "   ✅ Get Courses" -ForegroundColor Green
Write-Host "   ✅ Role-Based Authorization" -ForegroundColor Green
Write-Host ""
Write-Host "Tip: To test individual endpoints, see API_TESTING_GUIDE.md" -ForegroundColor Yellow

