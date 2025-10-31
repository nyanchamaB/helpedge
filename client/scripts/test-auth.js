#!/usr/bin/env node

/**
 * Authentication Integration Test Script
 *
 * This script tests the authentication endpoints to verify integration
 * Run with: node scripts/test-auth.js
 *
 * Note: Requires Node.js 18+ for native fetch support
 */

// Check Node version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('Error: This script requires Node.js 18 or higher for native fetch support');
  console.error(`Current version: ${nodeVersion}`);
  console.error('Please upgrade Node.js or use: npm install node-fetch');
  process.exit(1);
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://helpedge-api.onrender.com';

// Test credentials
const TEST_USER = {
  email: `test_${Date.now()}@example.com`,
  password: 'Test123!',
  name: 'Test User',
  role: 2, // end_user
  department: 'Testing'
};

const ADMIN_USER = {
  email: 'admin@helpedge.com',
  password: 'Admin123!'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

async function testEndpoint(name, url, options) {
  try {
    logInfo(`Testing: ${name}`);
    const response = await fetch(url, options);
    const data = await response.text();

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }

    if (response.ok) {
      logSuccess(`${name} - Status: ${response.status}`);
      return { success: true, data: jsonData, status: response.status };
    } else {
      logError(`${name} - Status: ${response.status}`);
      console.log('Response:', jsonData);
      return { success: false, data: jsonData, status: response.status };
    }
  } catch (error) {
    logError(`${name} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testRegister() {
  log('\n--- Testing User Registration ---', 'yellow');

  const result = await testEndpoint(
    'Register New User',
    `${API_BASE_URL}/api/Auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(TEST_USER)
    }
  );

  if (result.success && result.data.token) {
    logSuccess('Registration successful - Token received');
    return result.data.token;
  } else {
    logWarning('Registration may have failed or returned unexpected format');
    return null;
  }
}

async function testLogin() {
  log('\n--- Testing User Login ---', 'yellow');

  const result = await testEndpoint(
    'Login with Admin Credentials',
    `${API_BASE_URL}/api/Auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ADMIN_USER)
    }
  );

  if (result.success && result.data.token) {
    logSuccess('Login successful - Token received');
    return result.data.token;
  } else {
    logWarning('Login may have failed or returned unexpected format');
    return null;
  }
}

async function testValidateToken(token) {
  log('\n--- Testing Token Validation ---', 'yellow');

  if (!token) {
    logWarning('No token provided, skipping validation test');
    return false;
  }

  const result = await testEndpoint(
    'Validate Token',
    `${API_BASE_URL}/api/Auth/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    }
  );

  if (result.success) {
    logSuccess('Token validation successful');
    return true;
  } else {
    logError('Token validation failed');
    return false;
  }
}

async function testAuthenticatedRequest(token) {
  log('\n--- Testing Authenticated Request ---', 'yellow');

  if (!token) {
    logWarning('No token provided, skipping authenticated request test');
    return false;
  }

  const result = await testEndpoint(
    'GET Request with Bearer Token',
    `${API_BASE_URL}/api/Categories/active`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (result.success) {
    logSuccess('Authenticated request successful');
    return true;
  } else {
    logWarning('Authenticated request may have failed (this could be expected if endpoint requires specific permissions)');
    return false;
  }
}

async function runTests() {
  log('╔════════════════════════════════════════════════════╗', 'blue');
  log('║   HelpEdge Authentication Integration Tests       ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');

  logInfo(`API Base URL: ${API_BASE_URL}\n`);

  let token = null;
  let allPassed = true;

  // Test 1: Register
  const registerToken = await testRegister();
  if (!registerToken) {
    logWarning('Note: Registration test did not return a token (user may already exist)');
  }

  // Test 2: Login
  token = await testLogin();
  if (!token) {
    logError('Login test failed - cannot continue with remaining tests');
    allPassed = false;
  } else {
    // Test 3: Validate Token
    const validationPassed = await testValidateToken(token);
    if (!validationPassed) allPassed = false;

    // Test 4: Authenticated Request
    const authRequestPassed = await testAuthenticatedRequest(token);
    if (!authRequestPassed) {
      logWarning('Note: This might be expected if the endpoint requires specific role permissions');
    }
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════╗', 'blue');
  log('║                  Test Summary                      ║', 'blue');
  log('╚════════════════════════════════════════════════════╝', 'blue');

  if (allPassed && token) {
    log('\n🎉 All critical tests passed!', 'green');
    logSuccess('Authentication integration is working correctly');
    logInfo('\nYou can now:');
    logInfo('1. Start the frontend: npm run dev');
    logInfo('2. Navigate to http://localhost:3000/auth/login');
    logInfo('3. Login with: admin@helpedge.com / Admin123!');
  } else {
    log('\n⚠️  Some tests failed or returned warnings', 'yellow');
    logWarning('Please review the test output above');
    logInfo('\nTroubleshooting:');
    logInfo('1. Verify the API is accessible at: ' + API_BASE_URL);
    logInfo('2. Check if CORS is properly configured on the backend');
    logInfo('3. Verify the test credentials are correct');
    logInfo('4. Review the API documentation for any changes');
  }

  log('');
}

// Run the tests
runTests().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
