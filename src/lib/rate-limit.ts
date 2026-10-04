// 비용 남용 방지용 단순 IP 제한 (서버리스 인스턴스 단위 best-effort)
const hits = new Map<string, number[]>();

export function rateLimited(key: string, max: number, windowMs = 60_000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}
