# Enhanced PowerShell Static Web Server & Full API Service for FinanceFlow
param(
  [int]$Port = 3000,
  [string]$Path = $PSScriptRoot
)

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
  $listener.Start()
  Write-Host "FinanceFlow Fullstack Server running live at: http://localhost:$Port/ and http://127.0.0.1:$Port/"
} catch {
  Write-Host "Port $Port busy, trying fallback port 8080..."
  $Port = 8080
  $listener = New-Object System.Net.HttpListener
  $listener.Prefixes.Add("http://localhost:$Port/")
  $listener.Prefixes.Add("http://127.0.0.1:$Port/")
  $listener.Start()
  Write-Host "FinanceFlow Fullstack Server running live at: http://localhost:$Port/ and http://127.0.0.1:$Port/"
}

# In-Memory Database Store for User Accounts & Isolated Financial Records
$dbUsers = @{} # email -> user object
$dbUserData = @{} # userId -> { expenses: @(), income: @(), categories: @(), goals: @() }

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".svg"  = "image/svg+xml"
}

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    # Enable CORS headers for API calls
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if ($request.HttpMethod -eq "OPTIONS") {
      $response.StatusCode = 200
      $response.Close()
      continue
    }

    $reqPath = $request.Url.LocalPath

    # Handle API Endpoints directly in server.ps1 for 100% zero-dependency live execution
    if ($reqPath.StartsWith("/api/")) {
      $response.ContentType = "application/json; charset=utf-8"
      $body = ""
      if ($request.HasEntityBody) {
        $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
        $body = $reader.ReadToEnd()
        $reader.Close()
      }

      # Extract Bearer token if available
      $authHeader = $request.Headers["Authorization"]
      $currentUserId = $null
      if ($authHeader -and $authHeader.StartsWith("Bearer ")) {
        $token = $authHeader.Substring(7)
        $currentUserId = $token
      }

      # Route: Auth Register
      if ($reqPath -eq "/api/auth/register" -and $request.HttpMethod -eq "POST") {
        $json = $body | ConvertFrom-Json
        $email = $json.email.ToLower()

        if ($dbUsers.ContainsKey($email)) {
          $response.StatusCode = 409
          $resObj = @{ success = $false; message = "An account with this email address already exists" }
        } else {
          $userId = "usr_" + [Guid]::NewGuid().ToString("N").Substring(0, 8)
          $newUser = @{
            id = $userId
            firstName = $json.firstName
            lastName = $json.lastName
            email = $email
            plan = "Premium"
            avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
          }
          $dbUsers[$email] = $newUser
          $dbUserData[$userId] = @{
            expenses = [System.Collections.ArrayList]::new()
            income = [System.Collections.ArrayList]::new()
            categories = [System.Collections.ArrayList]::new()
            goals = [System.Collections.ArrayList]::new()
          }

          $response.StatusCode = 201
          $resObj = @{
            success = $true
            message = "User registered successfully"
            data = @{
              user = $newUser
              token = $userId
            }
          }
        }

        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Auth Login
      if ($reqPath -eq "/api/auth/login" -and $request.HttpMethod -eq "POST") {
        $json = $body | ConvertFrom-Json
        $email = $json.email.ToLower()

        if (-not $dbUsers.ContainsKey($email)) {
          $response.StatusCode = 401
          $resObj = @{ success = $false; message = "Invalid email or password credentials" }
        } else {
          $userObj = $dbUsers[$email]
          $response.StatusCode = 200
          $resObj = @{
            success = $true
            message = "User authenticated successfully"
            data = @{
              user = $userObj
              token = $userObj.id
            }
          }
        }

        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Auth Me
      if ($reqPath -eq "/api/auth/me" -and $request.HttpMethod -eq "GET") {
        if (-not $currentUserId) {
          $response.StatusCode = 401
          $resObj = @{ success = $false; message = "Unauthorized" }
        } else {
          $foundUser = $null
          foreach ($u in $dbUsers.Values) {
            if ($u.id -eq $currentUserId) { $foundUser = $u; break }
          }
          if ($foundUser) {
            $response.StatusCode = 200
            $resObj = @{ success = $true; data = @{ user = $foundUser } }
          } else {
            $response.StatusCode = 401
            $resObj = @{ success = $false; message = "User session invalid" }
          }
        }

        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Protected Routes Handler
      if (-not $currentUserId -or -not $dbUserData.ContainsKey($currentUserId)) {
        $response.StatusCode = 401
        $resObj = @{ success = $false; message = "Authentication token required. Please sign in." }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      $uData = $dbUserData[$currentUserId]

      # Route: Dashboard Summary
      if ($reqPath -eq "/api/dashboard/summary" -and $request.HttpMethod -eq "GET") {
        $totalExp = 0
        foreach ($e in $uData.expenses) { $totalExp += [double]$e.amount }
        $totalInc = 0
        foreach ($i in $uData.income) { $totalInc += [double]$i.amount }

        $balance = $totalInc - $totalExp
        $savRate = 0
        if ($totalInc -gt 0) { $savRate = [Math]::Round((($totalInc - $totalExp) / $totalInc) * 100) }

        # spending breakdown
        $catMap = @{}
        foreach ($e in $uData.expenses) {
          $cName = $e.category
          if (-not $cName) { $cName = "General" }
          if (-not $catMap.ContainsKey($cName)) { $catMap[$cName] = 0 }
          $catMap[$cName] += [double]$e.amount
        }

        $breakdown = @()
        foreach ($k in $catMap.Keys) {
          $amt = $catMap[$k]
          $pct = 0
          if ($totalExp -gt 0) { $pct = [Math]::Round(($amt / $totalExp) * 100) }
          $breakdown += @{ name = $k; percentage = $pct; amount = $amt; color = "#2563eb" }
        }

        $response.StatusCode = 200
        $resObj = @{
          success = $true
          data = @{
            stats = @{
              totalBalance = $balance
              monthlyIncome = $totalInc
              monthlyExpense = $totalExp
              savingsRate = $savRate
            }
            transactions = $uData.expenses
            spendingCategoryBreakdown = $breakdown
            monthlyTrend = @()
          }
        }

        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Create Expense
      if ($reqPath -eq "/api/expenses" -and $request.HttpMethod -eq "POST") {
        $json = $body | ConvertFrom-Json
        $newExp = @{
          id = "TX-" + (Get-Random -Minimum 1000 -Maximum 9999)
          date = if ($json.date) { $json.date } else { (Get-Date).ToString("yyyy-MM-dd") }
          merchant = $json.merchant
          amount = [double]$json.amount
          category = if ($json.categoryName) { $json.categoryName } else { "General" }
          note = if ($json.note) { $json.note } else { "" }
          type = "expense"
          status = "Completed"
        }
        [void]$uData.expenses.Insert(0, $newExp)

        $response.StatusCode = 201
        $resObj = @{ success = $true; message = "Expense created successfully"; data = $newExp }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Get Categories
      if ($reqPath -eq "/api/budgets/categories" -and $request.HttpMethod -eq "GET") {
        $response.StatusCode = 200
        $resObj = @{ success = $true; data = $uData.categories }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Create Category
      if ($reqPath -eq "/api/budgets/categories" -and $request.HttpMethod -eq "POST") {
        $json = $body | ConvertFrom-Json
        $newCat = @{
          id = [Guid]::NewGuid().ToString()
          name = $json.name
          limit = [double]$json.limit
          spent = 0
          icon = "tag"
          color = "#2563eb"
        }
        [void]$uData.categories.Add($newCat)

        $response.StatusCode = 201
        $resObj = @{ success = $true; message = "Category created"; data = $newCat }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Get Savings Goals
      if ($reqPath -eq "/api/goals" -and $request.HttpMethod -eq "GET") {
        $response.StatusCode = 200
        $resObj = @{ success = $true; data = $uData.goals }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Route: Create Savings Goal
      if ($reqPath -eq "/api/goals" -and $request.HttpMethod -eq "POST") {
        $json = $body | ConvertFrom-Json
        $target = [double]$json.targetAmount
        $current = [double]$json.currentAmount
        $prog = 0
        if ($target -gt 0) { $prog = [Math]::Round(($current / $target) * 100) }

        $newGoal = @{
          id = [Guid]::NewGuid().ToString()
          title = $json.title
          category = if ($json.category) { $json.category } else { "GENERAL" }
          target = $target
          current = $current
          progress = $prog
          deadline = $json.deadline
          status = "In Progress"
        }
        [void]$uData.goals.Add($newGoal)

        $response.StatusCode = 201
        $resObj = @{ success = $true; message = "Savings goal created"; data = $newGoal }
        $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
        $response.ContentLength64 = $resBytes.Length
        $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
        $response.Close()
        continue
      }

      # Catch all API
      $response.StatusCode = 200
      $resObj = @{ success = $true; message = "API Endpoint active" }
      $resBytes = [System.Text.Encoding]::UTF8.GetBytes(($resObj | ConvertTo-Json -Depth 5))
      $response.ContentLength64 = $resBytes.Length
      $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
      $response.Close()
      continue
    }

    # Static File Server Handler
    if ($reqPath -eq "/") { $reqPath = "/index.html" }

    $filePath = Join-Path $Path $reqPath.TrimStart('/')

    if (Test-Path $filePath -PathType Leaf) {
      $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
      $contentType = $mimeTypes[$ext]
      if (-not $contentType) { $contentType = "application/octet-stream" }

      $response.ContentType = $contentType
      $bytes = [System.IO.File]::ReadAllBytes($filePath)
      $response.ContentLength64 = $bytes.Length
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $response.StatusCode = 404
      $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $response.ContentLength64 = $buffer.Length
      $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
  } catch {
    # Ignore connection resets
  }
}
