/*
 * Inspired by
 * https://github.com/vercel/examples/blob/main/edge-functions/cors/pages/api/hello.ts
 */

import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest): Promise<Response> {
  const code = request.nextUrl.searchParams.get('code');
  if (typeof code !== 'string')
    return new Response('"code" query parameter is missing', { status: 400 });
  return fetch(
    formatUrl('https://github.com/login/oauth/access_token', {
      client_id: process.env.GITHUB_APP_CLIENT_ID,
      client_secret: process.env.GITHUB_APP_CLIENT_SECRET,
      code,
    }),
    { method: 'POST', headers: { Accept: 'application/json' } }
  )
    .then((response) => response.json())
    .then(
      (response: { readonly access_token: string }) => response.access_token
    )
    .then(
      (accessToken) =>
        new Response(accessToken, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin':
              process.env.ACCESS_CONTROL_ALLOW_ORIGIN,
          },
        })
    );
}

function formatUrl(
  url: string,
  parameters: Readonly<Record<string, string>>
): string {
  const urlObject = new URL(url);
  urlObject.search = new URLSearchParams({
    ...Object.fromEntries(urlObject.searchParams),
    ...parameters,
  }).toString();
  return urlObject.toString();
}
