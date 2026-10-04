import { useEffect } from 'react';

export function usePageTitle(title, icon = '🏫') {
  useEffect(() => {
    document.title = title ? `${title} — Maktab Tizimi` : 'Maktab Tizimi';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${icon}</text></svg>`;
    const url = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = url;
  }, [title, icon]);
}