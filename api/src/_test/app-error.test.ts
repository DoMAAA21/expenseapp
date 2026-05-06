import test from 'node:test';
import assert from 'node:assert/strict';
import { AppError } from '../utils/app-error';

test('AppError sets status code, message, and optional code', () => {
  const err = new AppError(409, 'Conflict happened', 'CONFLICT');

  assert.ok(err instanceof Error);
  assert.ok(err instanceof AppError);
  assert.equal(err.statusCode, 409);
  assert.equal(err.message, 'Conflict happened');
  assert.equal(err.code, 'CONFLICT');
  assert.equal(err.name, 'AppError');
});
