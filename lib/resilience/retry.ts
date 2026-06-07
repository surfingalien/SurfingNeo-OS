export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelayMs?: number; maxDelayMs?: number; onRetry?: (error: Error, attempt: number) => void; } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelayMs = 1000, maxDelayMs = 10000, onRetry } = options;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try { return await fn(); }
    catch (error) { if (attempt === maxRetries) throw error;
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt) + Math.random() * 1000, maxDelayMs);
      onRetry?.(error as Error, attempt + 1); await new Promise(r => setTimeout(r, delay)); }
  }
  throw new Error('Unreachable');
}