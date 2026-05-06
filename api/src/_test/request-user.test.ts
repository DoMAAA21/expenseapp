import test from 'node:test';
import assert from 'node:assert/strict';
import type { Request } from 'express';
import { getAuthUser } from '../utils/request-user';
import { AppError } from '../utils/app-error';

test('getAuthUser returns auth user when present', () => {
  const req = {
    authUser: { id: 'u1', email: 'user@example.com' },
  } as Request;

  assert.deepEqual(getAuthUser(req), { id: 'u1', email: 'user@example.com' });
});

test('getAuthUser throws 401 AppError when auth user is missing', () => {
  const req = {} as Request;

  let thrown: unknown;
  try {
    getAuthUser(req);
  } catch (error) {
    thrown = error;
  }

  assert.ok(thrown instanceof AppError);
  const err = thrown as AppError;
  assert.equal(err.statusCode, 401);
  assert.equal(err.message, 'Unauthorized');
});
