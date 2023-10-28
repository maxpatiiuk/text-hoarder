import { IR, RA } from './types';

/**
 * All front-end network requests should go through this utility.
 *
 * Wraps native fetch in useful helpers
 *
 * @remarks
 * Requests to Google APIs automatically attach the access token
 * Automatically stringifies request body
 */
export const ajax = async (
  url: string,
  {
    body,
    ...options
  }: Omit<RequestInit, 'body'> & {
    // If object is passed to body, it is stringified
    readonly body?: IR<unknown> | RA<unknown> | string | FormData;
  } = {},
): Promise<Response> =>
  fetch(url, {
    ...options,
    body:
      typeof body === 'object' && !(body instanceof FormData)
        ? JSON.stringify(body)
        : body,
  }).then((response) => {
    if (!response.ok) {
      console.error('Failed to fetch', response);
      throw new Error(
        `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
      );
    } else return response;
  });