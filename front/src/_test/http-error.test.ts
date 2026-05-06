import axios from 'axios';
import { describe, expect, it } from 'vitest';
import { getApiErrorMessage } from '../lib/http-error';

describe('getApiErrorMessage', () => {
  it('returns API response message when available', () => {
    const error = axios.AxiosError.from(
      new Error('Request failed'),
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        data: { message: 'Email already registered' },
        status: 409,
        statusText: 'Conflict',
        headers: {},
        config: { headers: {} } as any,
      },
    );

    expect(getApiErrorMessage(error, 'Fallback')).toBe('Email already registered');
  });

  it('returns fallback when no useful error details exist', () => {
    expect(getApiErrorMessage(null, 'Fallback message')).toBe('Fallback message');
  });
});
