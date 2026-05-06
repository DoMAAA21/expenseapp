import test from 'node:test';
import assert from 'node:assert/strict';
import type { NextFunction, Request, Response } from 'express';
import { asyncWrapper } from '../utils/async-wrapper';

test('asyncWrapper forwards rejected async errors to next()', async () => {
  const calls: unknown[] = [];
  const next: NextFunction = ((err?: unknown) => {
    calls.push(err);
  }) as NextFunction;
  const req = {} as Request;
  const res = {} as Response;
  const boom = new Error('boom');

  const wrapped = asyncWrapper(async () => {
    throw boom;
  });

  wrapped(req, res, next);
  await Promise.resolve();

  assert.equal(calls.length, 1);
  assert.equal(calls[0], boom);
});

test('asyncWrapper does not call next() when handler resolves', async () => {
  const calls: unknown[] = [];
  const next: NextFunction = ((err?: unknown) => {
    calls.push(err);
  }) as NextFunction;
  const req = {} as Request;
  const res = {} as Response;

  const wrapped = asyncWrapper(async () => {
    return;
  });

  wrapped(req, res, next);
  await Promise.resolve();

  assert.equal(calls.length, 0);
});
