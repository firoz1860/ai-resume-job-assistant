const responseCache = new Map();
const MAX_CACHE_ENTRIES = 500;

function userPrefix(userId) {
  return `user:${String(userId)}:`;
}

function cacheKey(req) {
  return `${userPrefix(req.user._id)}${req.method}:${req.originalUrl}`;
}

function setCacheHeaders(res, hit) {
  res.set('X-Cache', hit ? 'HIT' : 'MISS');
}

function pruneCache() {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (value.expiresAt <= now) responseCache.delete(key);
  }

  while (responseCache.size > MAX_CACHE_ENTRIES) {
    responseCache.delete(responseCache.keys().next().value);
  }
}

export function cacheFor(seconds = 30) {
  const ttlMs = seconds * 1000;

  return function cacheMiddleware(req, res, next) {
    if (req.method !== 'GET' || !req.user?._id) return next();

    const key = cacheKey(req);
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      setCacheHeaders(res, true);
      return res.status(cached.status).json(cached.body);
    }

    responseCache.delete(key);
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        responseCache.set(key, {
          status: res.statusCode,
          body,
          expiresAt: Date.now() + ttlMs,
        });
        pruneCache();
      }
      setCacheHeaders(res, false);
      return originalJson(body);
    };

    return next();
  };
}

export function clearUserCache(userId) {
  if (!userId) return;
  const prefix = userPrefix(userId);
  for (const key of responseCache.keys()) {
    if (key.startsWith(prefix)) responseCache.delete(key);
  }
}

export function invalidateUserCache(req, res, next) {
  if (!req.user?._id) return next();
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      clearUserCache(req.user._id);
    }
  });
  return next();
}
