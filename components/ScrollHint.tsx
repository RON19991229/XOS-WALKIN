'use client';

import { useEffect, useState } from 'react';

/**
 * ScrollHint — gives users a clear visual cue that there's more content
 * below the fold on the Reminders page.
 *
 * Behavior (combo of mockup methods B + D):
 *   D) On mount, after 800ms, smoothly auto-scrolls the window down by 100px.
 *      This pushes the WELCOME card up and reveals the first Rule's yellow
 *      header at the top of the viewport — which is the strongest possible
 *      hint that the page has more content.
 *      Cancelled if the user has already scrolled (we never fight the user).
 *
 *   B) Renders a fixed-position fade-to-black gradient at the bottom of the
 *      viewport with a bouncing yellow arrow + "MORE BELOW" label. Hides
 *      itself once the user has scrolled to within 80px of the bottom.
 *
 * Both behaviors respect `prefers-reduced-motion`: the auto-scroll is
 * skipped, and the bouncing arrow does not bounce (the hint still appears
 * but as a static element).
 */
export default function ScrollHint() {
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // --- Method D: gentle auto-scroll after a short delay ---
    let autoScrollTimer: ReturnType<typeof setTimeout> | null = null;
    let userHasScrolled = false;

    const onUserScroll = () => {
      // If the user scrolls before our auto-scroll fires, skip it entirely.
      // We use a low threshold (5px) so a passive iOS rubber-band doesn't
      // trigger this, but any deliberate scroll will.
      if (window.scrollY > 5) {
        userHasScrolled = true;
        if (autoScrollTimer) {
          clearTimeout(autoScrollTimer);
          autoScrollTimer = null;
        }
      }
    };
    window.addEventListener('scroll', onUserScroll, { passive: true });

    if (!reduceMotion) {
      autoScrollTimer = setTimeout(() => {
        if (!userHasScrolled) {
          window.scrollBy({ top: 100, left: 0, behavior: 'smooth' });
        }
      }, 800);
    }

    // --- Method B: hide the hint once user reaches the bottom ---
    const onScrollCheckBottom = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      // Hide the hint once we're within 80px of the bottom OR the user
      // has scrolled more than 200px (they clearly know to scroll now).
      if (total - scrolled < 80 || window.scrollY > 200) {
        setShowHint(false);
      } else {
        setShowHint(true);
      }
    };
    // Run once on mount in case the page is already short enough that
    // there's nothing below the fold (then we hide immediately).
    onScrollCheckBottom();
    window.addEventListener('scroll', onScrollCheckBottom, { passive: true });
    window.addEventListener('resize', onScrollCheckBottom);

    return () => {
      if (autoScrollTimer) clearTimeout(autoScrollTimer);
      window.removeEventListener('scroll', onUserScroll);
      window.removeEventListener('scroll', onScrollCheckBottom);
      window.removeEventListener('resize', onScrollCheckBottom);
    };
  }, []);

  if (!showHint) return null;

  return (
    <div
      className="scroll-hint-overlay"
      aria-hidden="true"
    >
      <div className="scroll-hint-arrow">▼</div>
      <div className="scroll-hint-label">MORE BELOW</div>
    </div>
  );
}
