import assert from 'node:assert/strict'
import test from 'node:test'
import { checkRateLimit, clientRateLimitKey, requestBodyTooLarge, textBodyTooLarge } from '../lib/requestSecurity'

test('rate-limit keys use the proxy-appended address rather than the spoofable left-most address', () => {
  const first = new Request('https://example.test/api', {
    headers: { 'x-forwarded-for': 'spoofed-one, 203.0.113.7' },
  })
  const second = new Request('https://example.test/api', {
    headers: { 'x-forwarded-for': 'spoofed-two, 203.0.113.7' },
  })
  const firstKey = clientRateLimitKey(first, 'test-proxy-chain')
  const secondKey = clientRateLimitKey(second, 'test-proxy-chain')
  assert.equal(firstKey, secondKey)
  assert.notEqual(firstKey, '203.0.113.7')
  assert.equal(checkRateLimit(firstKey, 1, 60_000).limited, false)
  assert.equal(checkRateLimit(secondKey, 1, 60_000).limited, true)
})

test('rate-limit keys are scoped by endpoint and fall back to x-real-ip', () => {
  const request = new Request('https://example.test/api', {
    headers: { 'x-real-ip': '203.0.113.9' },
  })
  assert.notEqual(clientRateLimitKey(request, 'assistant'), clientRateLimitKey(request, 'orders'))
  assert.equal(checkRateLimit(clientRateLimitKey(request, 'fallback-test'), 1, 60_000).limited, false)
})

test('rate-limit buckets reset after their window expires', async () => {
  const key = clientRateLimitKey(new Request('https://example.test'), `expiry-test-${Date.now()}`)
  assert.equal(checkRateLimit(key, 1, 1).limited, false)
  assert.equal(checkRateLimit(key, 1, 1).limited, true)
  await new Promise(resolve => setTimeout(resolve, 5))
  assert.equal(checkRateLimit(key, 1, 1).limited, false)
})

test('request bodies are limited by declared and actual UTF-8 byte length', () => {
  const oversized = new Request('https://example.test/api', {
    method: 'POST',
    headers: { 'content-length': '1025' },
    body: 'x',
  })
  assert.equal(requestBodyTooLarge(oversized, 1024), true)
  assert.equal(requestBodyTooLarge(new Request('https://example.test/api'), 1024), false)
  assert.equal(textBodyTooLarge('é'.repeat(10), 19), true)
  assert.equal(textBodyTooLarge('é'.repeat(10), 20), false)
})
