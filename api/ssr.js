import { Buffer } from 'node:buffer';
import { Headers, Request } from 'undici';

import server from '../dist/server/server.js';

function toHeaderValue(value) {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(',');
  }
  return null;
}

async function readRawBody(req) {
  const method = String(req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return undefined;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return undefined;
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  const proto = toHeaderValue(req.headers?.['x-forwarded-proto']) || 'https';
  const host =
    toHeaderValue(req.headers?.['x-forwarded-host']) ||
    toHeaderValue(req.headers?.host) ||
    'localhost';

  const url = `${proto}://${host}${req.url || '/'}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers || {})) {
    const headerValue = toHeaderValue(value);
    if (headerValue != null) {
      headers.set(key, headerValue);
    }
  }

  const body = await readRawBody(req);

  const request = new Request(url, {
    method: req.method,
    headers,
    body,
  });

  const response = await server.fetch(request);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    try {
      res.setHeader(key, value);
    } catch {
      // ignore
    }
  });

  const ab = await response.arrayBuffer();
  res.end(Buffer.from(ab));
}
