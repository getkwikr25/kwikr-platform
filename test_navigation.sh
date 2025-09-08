#!/bin/bash

# Navigation Test Script for Kwikr Platform
# Tests all major user flows and navigation paths

echo "=== KWIKR PLATFORM NAVIGATION TEST ==="
echo "Testing all task flows for clients, workers, and admin"
echo

BASE_URL="http://localhost:3000"
FAILED_TESTS=()
PASSED_TESTS=()

# Helper function to test URL
test_url() {
    local url="$1"
    local description="$2"
    local expected_code="${3:-200}"
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")
    
    if [ "$response" = "$expected_code" ]; then
        echo "✅ PASS (HTTP $response)"
        PASSED_TESTS+=("$description")
    else
        echo "❌ FAIL (HTTP $response, expected $expected_code)"
        FAILED_TESTS+=("$description - $url")
    fi
}

# Helper function to test URL content
test_content() {
    local url="$1"
    local description="$2"
    local search_text="$3"
    
    echo -n "Testing $description... "
    
    content=$(curl -s "$BASE_URL$url")
    
    if echo "$content" | grep -q "$search_text"; then
        echo "✅ PASS (Content found)"
        PASSED_TESTS+=("$description")
    else
        echo "❌ FAIL (Content not found: $search_text)"
        FAILED_TESTS+=("$description - $url")
    fi
}

echo "=== 1. MAIN NAVIGATION TESTS ==="
test_url "/" "Homepage"
test_url "/auth/login" "Login Page"
test_url "/signup/client" "Client Signup Page"
test_url "/signup/worker" "Worker Signup Page"
test_url "/search" "Search Page"
test_url "/subscriptions/pricing" "Pricing Page"
test_url "/payment-demo" "Payment Demo"
test_url "/admin" "Admin Access Page"

echo
echo "=== 2. CLIENT TASK FLOW TESTS ==="
test_content "/signup/client" "Client Signup Form" "Sign Up as Client"
test_content "/signup/client" "Client Form Fields" "First Name"
test_content "/signup/client" "Client Form Fields" "Last Name"
test_content "/signup/client" "Client Form Fields" "Email"
test_content "/signup/client" "Client Form Fields" "Password"

echo
echo "=== 3. WORKER TASK FLOW TESTS ==="
test_content "/signup/worker" "Worker Signup Form" "Sign Up as Service Provider"
test_content "/signup/worker" "Worker Form Fields" "Business Name"
test_content "/signup/worker" "Worker Form Fields" "Service Type"
test_content "/subscriptions/pricing" "Worker Pricing Plans" "Choose Your Growth Plan"
test_content "/subscriptions/pricing" "Pricing Plans Display" "Starter Plan"
test_content "/subscriptions/pricing" "Pricing Plans Display" "Growth Plan"
test_content "/subscriptions/pricing" "Pricing Plans Display" "Pro Plan"

echo
echo "=== 4. ADMIN TASK FLOW TESTS ==="
test_content "/admin" "Admin Dashboard Access" "Kwikr Admin Dashboard"
test_content "/admin" "Admin Dashboard Link" "/static/admin-dashboard.html"

echo
echo "=== 5. API ENDPOINT TESTS ==="
# Test key API endpoints
test_url "/api/popular-categories" "Popular Categories API"
test_url "/api/locations/provinces" "Provinces API"

echo
echo "=== 6. STATIC ASSET TESTS ==="
test_url "/static/styles.css" "Main Stylesheet"
test_url "/static/kwikr-logo.svg" "Logo Asset" 404 # Expected 404 if doesn't exist
test_url "/static/admin-dashboard.html" "Admin Dashboard Static"

echo
echo "=== 7. AUTHENTICATION FLOW TESTS ==="
test_content "/auth/login" "Login Form" "Email"
test_content "/auth/login" "Login Form" "Password"
test_content "/auth/login" "Login Form" "Sign In"

echo
echo "=== 8. SEARCH & DISCOVERY TESTS ==="
test_content "/search" "Search Page" "Search Results"
test_content "/" "Homepage Search" "Find Service Providers"
test_content "/" "Homepage Categories" "Popular tasks"

echo
echo "=== TEST RESULTS SUMMARY ==="
echo "✅ Passed Tests: ${#PASSED_TESTS[@]}"
echo "❌ Failed Tests: ${#FAILED_TESTS[@]}"
echo

if [ ${#FAILED_TESTS[@]} -gt 0 ]; then
    echo "FAILED TESTS:"
    for test in "${FAILED_TESTS[@]}"; do
        echo "  - $test"
    done
    echo
fi

echo "PASSED TESTS:"
for test in "${PASSED_TESTS[@]}"; do
    echo "  ✅ $test"
done

echo
if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Navigation is working correctly."
else
    echo "⚠️  Some tests failed. See details above."
fi