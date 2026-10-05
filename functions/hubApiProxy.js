'use strict';

const http = require('http');
const https = require('https');
const { URL } = require('url');

/**
 * Same-origin Hub API paths the public site (Passport / GoonCitizen login,
 * device-link, JSON-RPC, identity cluster) needs. Everything else stays
 * HTML or 404 — not a Hub, not LiveRelay.
 */
const HUB_API_PREFIXES = Object.freeze([
  '/sessions',
  '/device-links',
  '/services/rpc',
  '/identity/cluster',
  '/identity/cross-sign'
]);

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host'
]);

const DEFAULT_TIMEOUT_MS = 30000;

function parsePathname (req) {
  const raw = (req && (req.originalUrl || req.url)) || '/';
  try {
    return new URL(raw, 'http://localhost').pathname || '/';
  } catch (_) {
    const q = String(raw).indexOf('?');
    return q === -1 ? String(raw) : String(raw).slice(0, q);
  }
}

function isHubApiPath (pathname) {
  const p = String(pathname || '');
  for (let i = 0; i < HUB_API_PREFIXES.length; i++) {
    const prefix = HUB_API_PREFIXES[i];
    if (p === prefix || p.startsWith(prefix + '/')) return true;
  }
  return false;
}

function wantsHtmlNavigation (req) {
  const a = req && req.headers && req.headers.accept;
  if (typeof a !== 'string') return false;
  const first = a.split(',')[0].trim().toLowerCase().split(';')[0];
  return first === 'text/html';
}

/**
 * Browser GET /sessions (and /device-links) should render GoonSPA, not Hub JSON.
 * JSON polls and all mutating methods still proxy.
 * @param {import('http').IncomingMessage} req
 * @returns {boolean}
 */
function shouldProxyHubApi (req) {
  const pathname = parsePathname(req);
  if (!isHubApiPath(pathname)) return false;
  const method = String((req && req.method) || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    if ((pathname === '/sessions' || pathname === '/device-links') && wantsHtmlNavigation(req)) {
      return false;
    }
  }
  return true;
}

function normalizeHubOrigin (raw) {
  try {
    const u = new URL(String(raw || '').trim());
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
    return `${u.protocol}//${u.host}`;
  } catch (_) {
    return null;
  }
}

function requestBodyBuffer (req) {
  if (!req) return null;
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string' && req.body) return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    const keys = Object.keys(req.body);
    if (!keys.length) return null;
    return Buffer.from(JSON.stringify(req.body));
  }
  return null;
}

function forwardedProto (req) {
  const xf = req && req.headers && req.headers['x-forwarded-proto'];
  if (typeof xf === 'string' && xf.trim()) return xf.split(',')[0].trim();
  if (req && req.secure) return 'https';
  return 'http';
}

function forwardedFor (req) {
  const existing = req && req.headers && req.headers['x-forwarded-for'];
  const remote = (req && req.socket && req.socket.remoteAddress) || '';
  if (typeof existing === 'string' && existing.trim()) {
    return remote ? `${existing.trim()}, ${remote}` : existing.trim();
  }
  return remote || '';
}

/**
 * Reverse-proxy an allowlisted Hub API request. Does not follow client-supplied URLs.
 * @param {string} hubOrigin `https://hub.fabric.pub` (no path)
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {{ timeoutMs?: number }} [opts]
 */
function proxyHubApiRequest (hubOrigin, req, res, opts = {}) {
  const origin = normalizeHubOrigin(hubOrigin);
  if (!origin) {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Hub origin is not configured' }));
    return;
  }

  const target = new URL(origin);
  const rawUrl = (req && (req.originalUrl || req.url)) || '/';
  let pathWithQuery = '/';
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    pathWithQuery = parsed.pathname + parsed.search;
  } catch (_) {
    pathWithQuery = String(rawUrl);
  }

  const headers = {};
  const src = (req && req.headers) || {};
  for (const name of Object.keys(src)) {
    if (HOP_BY_HOP.has(name.toLowerCase())) continue;
    const value = src[name];
    if (value == null || value === '') continue;
    headers[name] = value;
  }
  headers.host = target.host;
  const xf = forwardedFor(req);
  if (xf) headers['x-forwarded-for'] = xf;
  headers['x-forwarded-host'] = (src.host || src['x-forwarded-host'] || '').toString();
  headers['x-forwarded-proto'] = forwardedProto(req);

  const body = requestBodyBuffer(req);
  if (body) {
    headers['content-length'] = String(body.length);
    if (!headers['content-type']) headers['content-type'] = 'application/json';
  }

  const timeoutMs = Number(opts.timeoutMs);
  const timeout = Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
  const lib = target.protocol === 'https:' ? https : http;
  const upstream = lib.request({
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === 'https:' ? 443 : 80),
    method: String((req && req.method) || 'GET').toUpperCase(),
    path: pathWithQuery,
    headers,
    timeout
  }, (incoming) => {
    res.statusCode = incoming.statusCode || 502;
    const outHeaders = incoming.headers || {};
    for (const name of Object.keys(outHeaders)) {
      if (HOP_BY_HOP.has(name.toLowerCase())) continue;
      const value = outHeaders[name];
      if (value == null) continue;
      try { res.setHeader(name, value); } catch (_) { /* skip invalid */ }
    }
    incoming.pipe(res);
  });

  upstream.on('timeout', () => {
    upstream.destroy();
    if (!res.headersSent) {
      res.statusCode = 504;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Hub request timed out' }));
    }
  });

  upstream.on('error', (err) => {
    if (res.headersSent) return;
    res.statusCode = 502;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      error: 'Hub unreachable',
      detail: err && err.message ? err.message : String(err)
    }));
  });

  if (body) {
    upstream.end(body);
  } else if (req && req.readable && !req.readableEnded) {
    req.pipe(upstream);
  } else {
    upstream.end();
  }
}

/**
 * Express middleware: proxy Hub API paths, otherwise `next()`.
 * @param {string} hubOrigin
 * @param {{ timeoutMs?: number }} [opts]
 * @returns {function}
 */
function createHubApiMiddleware (hubOrigin, opts = {}) {
  return function hubApiMiddleware (req, res, next) {
    if (!shouldProxyHubApi(req)) return next();
    return proxyHubApiRequest(hubOrigin, req, res, opts);
  };
}

module.exports = {
  HUB_API_PREFIXES,
  DEFAULT_TIMEOUT_MS,
  parsePathname,
  isHubApiPath,
  wantsHtmlNavigation,
  shouldProxyHubApi,
  normalizeHubOrigin,
  proxyHubApiRequest,
  createHubApiMiddleware
};
