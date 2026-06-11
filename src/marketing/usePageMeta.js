/**
 * usePageMeta.js — Per-page <title> and meta description
 * Created: 2026-06-11
 *
 * The SPA shares one index.html, so every route would otherwise carry the same
 * title. Each page calls this hook once; the title/description swap on route
 * change so pages read right in tabs, history, and search snippets.
 */
import { useEffect } from 'react';

export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', description);
    }
  }, [title, description]);
}
