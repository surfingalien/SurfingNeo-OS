type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private lastFailureTime?: number;
  private halfOpenCalls = 0;

  constructor(private config: { failureThreshold: number; resetTimeoutMs: number; halfOpenMaxCalls: number }) {}

  async execute<T>(fn: () => Promise<T>, fallback?: T): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.config.resetTimeoutMs) {
        this.state = 'HALF_OPEN'; this.halfOpenCalls = 0;
      } else { if (fallback !== undefined) return fallback; throw new Error('Circuit breaker OPEN'); }
    }
    if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      if (fallback !== undefined) return fallback; throw new Error('HALF_OPEN limit'); }
    if (this.state === 'HALF_OPEN') this.halfOpenCalls++;
    try { const r = await fn(); this.onSuccess(); return r; }
    catch (e) { this.onFailure(); if (fallback !== undefined) return fallback; throw e; }
  }

  private onSuccess() { this.failures = 0; this.state = 'CLOSED'; this.halfOpenCalls = 0; }
  private onFailure() { this.failures++; this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failures >= this.config.failureThreshold) this.state = 'OPEN'; }

  getState() { return { state: this.state, failures: this.failures, lastFailure: this.lastFailureTime }; }
}

export const graphifyBreaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 15000, halfOpenMaxCalls: 3 });
export const mcpBreaker = new CircuitBreaker({ failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 3 });