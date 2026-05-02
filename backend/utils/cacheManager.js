class CacheManager {
  constructor() {
    this.memoryCache = new Map();
  }

  async get(key) {
    const item = this.memoryCache.get(key);
    if (!item) return null;
    
    // Check expiration
    if (Date.now() > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key, value, ttlSeconds = 3600) {
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  async getCachedGeneration(promptHash) {
    return await this.get(`generation:${promptHash}`);
  }

  async cacheGeneration(promptHash, generatedFilesJson) {
    // Cache for 24 hours to save API costs on identical requests
    await this.set(`generation:${promptHash}`, generatedFilesJson, 86400);
  }
}

module.exports = new CacheManager();
