import { useMemo } from 'react';

const FLAKES = ['❄️', '❅', '❆', '•'];

export default function Snowfall({ enabled = true }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        left: `${(i * 3.9 + (i % 4) * 1.4) % 100}%`,
        size: 11 + (i % 5) * 3,
        duration: `${9 + (i % 7) * 2.1}s`,
        delay: `${-((i * 1.4) % 12)}s`,
        drift: `${(i % 2 === 0 ? 1 : -1) * (16 + (i % 4) * 11)}px`,
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
