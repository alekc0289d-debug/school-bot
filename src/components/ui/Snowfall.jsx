import { useMemo } from 'react';

const FLAKES = ['❄️', '❅', '❆', '•'];

export default function Snowfall({ enabled = true }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${(i * 4.2 + (i % 3) * 1.7) % 100}%`,
        size: 10 + (i % 5) * 3,
        duration: `${10 + (i % 7) * 2.3}s`,
        delay: `${-((i * 1.3) % 12)}s`,
        drift: `${(i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 10)}px`,
        symbol: FLAKES[i % FLAKES.length],
        opacity: 0.35 + (i % 4) * 0.14,
      })),
    []
  );

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="snowflake"
          style={{
            left: p.left,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift': p.drift,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
