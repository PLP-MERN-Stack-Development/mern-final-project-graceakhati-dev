# 🧪 API Testing Guide for PowerShell

This guide shows you how to test the Planet Path API using PowerShell commands.

## Quick Reference

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

### Register User
```powershell
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    role = "student"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Login
```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

### Get Current User (Protected Route)
```powershell
$token = "your-jwt-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

### Get All Courses
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method GET
```

### Get Courses with Filters
```powershell
# Filter by status
Invoke-RestMethod -Uri "http://localhost:5000/api/courses?status=published" -Method GET

# Filter by impact type
Invoke-RestMethod -Uri "http://localhost:5000/api/courses?impact_type=climate" -Method GET

# Pagination
Invoke-RestMethod -Uri "http://localhost:5000/api/courses?page=1&limit=5" -Method GET
```

### Create Course (Protected Route - Instructor/Admin Only)
```powershell
$token = "your-jwt-token-here"
$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    title = "Climate Change Basics"
    description = "Learn the fundamentals of climate change and its impact on our planet"
    modules = @(
        @{
            title = "Introduction to Climate Change"
            description = "Understanding the basics"
            order = 1
            duration = 15
        },
        @{
            title = "Causes and Effects"
            description = "Exploring the causes"
            order = 2
            duration = 20
        }
    )
    tags = @("climate", "environment", "basics")
    price = 0
    impact_type = "climate"
    status = "draft"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/courses" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

## Automated Testing Script

Run the automated test script:

```powershell
.\test-api.ps1
```

This script will:
1. ✅ Test health check
2. ✅ Register a new user
3. ✅ Login with credentials
4. ✅ Get current user (protected route)
5. ✅ Get all courses
6. ✅ Create a course (protected route)

## Common PowerShell Commands

### Save Token to Variable
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body (@{email="test@example.com";password="password123"} | ConvertTo-Json) -ContentType "application/json"
$token = $response.data.token
```

### Pretty Print JSON Response
```powershell
$response | ConvertTo-Json -Depth 10
```

### Handle Errors
```powershell
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Success: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "Details: $($errorDetails.message)" -ForegroundColor Red
    }
}
```

## Alternative: Using curl.exe (Windows 10+)

If you have Windows 10 or later, you can use the actual `curl.exe`:

```powershell
# Use curl.exe explicitly (not the PowerShell alias)
curl.exe -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"student\"}'
```

## Alternative: Using Postman or Insomnia

For a GUI-based approach:
1. Import the OpenAPI spec: `server/openapi.yaml`
2. Or manually create requests:
   - Base URL: `http://localhost:5000`
   - Auth: Bearer Token (for protected routes)

## Troubleshooting

### "Cannot bind parameter" Error
- Use `Invoke-RestMethod` or `Invoke-WebRequest` instead of `curl` alias
- Or use `curl.exe` explicitly

### "401 Unauthorized" Error
- Make sure you're including the Bearer token in headers
- Check that the token is valid (not expired)

### "403 Forbidden" Error
- Check user role (some endpoints require `instructor` or `admin` role)
- Register a user with the correct role

### "400 Bad Request" Error
- Check request body format (must be valid JSON)
- Verify all required fields are present
- Check validation rules (e.g., email format, password length)

---

**Need more help?** Check the OpenAPI documentation at `server/openapi.yaml`

