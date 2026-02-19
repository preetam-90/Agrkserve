'use client';

import { useEffect, useState } from 'react';

const ENTRY_LOADER_FADE_MS = 500;
const ENTRY_LOADER_MIN_VISIBLE_MS = 1800;
const ENTRY_LOADER_MAX_VISIBLE_MS = 6500;
const ENTRY_LOADER_TICK_MS = 80;
const ENTRY_LOADER_PRE_READY_CAP = 92;

export function LandingEntryLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fadeDuration = prefersReducedMotion ? 120 : ENTRY_LOADER_FADE_MS;
    const minVisibleDuration = prefersReducedMotion ? 700 : ENTRY_LOADER_MIN_VISIBLE_MS;
    const maxVisibleDuration = prefersReducedMotion ? 2600 : ENTRY_LOADER_MAX_VISIBLE_MS;
    const tickDuration = prefersReducedMotion ? 120 : ENTRY_LOADER_TICK_MS;
    const preReadyCap = prefersReducedMotion ? 96 : ENTRY_LOADER_PRE_READY_CAP;
    const startTime = performance.now();
    const completeDelay = prefersReducedMotion ? 40 : 140;

    document.body.classList.add('entry-loader-active');

    let pageReady = document.readyState === 'complete';
    let exitTimer: number | undefined;
    let hideTimer: number | undefined;
    let isFinishing = false;
    const progressTimer = window.setInterval(() => {
      const elapsed = performance.now() - startTime;

      if (!pageReady) {
        setProgress((prev) => {
          if (prev >= preReadyCap) {
            return prev;
          }

          const step = Math.max(0.35, (preReadyCap - prev) * 0.08);
          return Math.min(preReadyCap, prev + step);
        });
      } else {
        setProgress((prev) => {
          if (prev >= 100) {
            return prev;
          }

          return Math.min(100, prev + (prev > 95 ? 3 : 7));
        });
      }

      const shouldFinish =
        (pageReady && elapsed >= minVisibleDuration) || elapsed >= maxVisibleDuration;
      if (shouldFinish) {
        finishLoader();
      }
    }, tickDuration);

    const markPageReady = () => {
      pageReady = true;
    };

    const finishLoader = () => {
      if (isFinishing) {
        return;
      }

      isFinishing = true;
      window.clearInterval(progressTimer);

      setProgress(100);
      exitTimer = window.setTimeout(() => {
        setIsExiting(true);
      }, completeDelay);
      hideTimer = window.setTimeout(() => {
        setIsVisible(false);
        document.body.classList.remove('entry-loader-active');
      }, completeDelay + fadeDuration);
    };

    window.addEventListener('load', markPageReady, { once: true });

    return () => {
      window.clearInterval(progressTimer);
      if (exitTimer) {
        window.clearTimeout(exitTimer);
      }
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      window.removeEventListener('load', markPageReady);
      document.body.classList.remove('entry-loader-active');
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  const loadingMessage =
    progress < 35 ? 'Connecting services' : progress < 80 ? 'Loading website data' : 'Almost ready';
  const progressRounded = Math.round(progress);

  return (
    <div
      className={`entry-loader${isExiting ? ' entry-loader--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading AgriServe"
    >
      <div className="entry-loader__ring" aria-hidden="true" />
      <p className="entry-loader__title">AgriServe</p>
      <p className="entry-loader__subtitle">{loadingMessage}</p>
      <div
        className="entry-loader__progress"
        role="progressbar"
        aria-label="Website loading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressRounded}
      >
        <div
          className="entry-loader__progress-bar"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
      <p className="entry-loader__percent">{progressRounded}%</p>
    </div>
  );
}
