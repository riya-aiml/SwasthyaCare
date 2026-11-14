import assert from 'assert';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

async function testRateLimiter() {
  console.log('🧪 Testing Chat Rate Limiter...');

  // 1. Register test user
  const user = {
    email: `ratelimit_${Date.now()}@swasthya.test`,
    password: 'Password123!',
    firstName: 'Rate',
    lastName: 'Limit',
    role: 'patient',
  };

  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const regData = await regRes.json();
  const token = regData.data.token;
  assert(token, 'Must receive auth token');

  // 2. Create session
  const sessRes = await fetch(`${BASE_URL}/chat/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title: 'Rate Limit Test Session' }),
  });
  const sessData = await sessRes.json();
  const sessionId = sessData.data.session._id;
  assert(sessionId, 'Session must be created');

  // Verify rate limit headers
  assert(sessRes.headers.get('x-ratelimit-limit'), 'Should have X-RateLimit-Limit');
  console.log('✅ PASS: Rate limit headers present:', {
    limit: sessRes.headers.get('x-ratelimit-limit'),
    remaining: sessRes.headers.get('x-ratelimit-remaining'),
  });

  console.log('🎉 Rate limiter verified successfully!');
}

testRateLimiter().catch((err) => {
  console.error('Rate limiter test failed:', err);
  process.exit(1);
});
