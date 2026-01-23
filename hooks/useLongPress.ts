// FIX: Import the 'React' namespace to resolve type errors for React.MouseEvent and React.TouchEvent.
import React, { useCallback, useRef } from 'react';

/**
 * A custom hook for detecting long-press gestures.
 * It cleanly distinguishes between a short click and a long press.
 *
 * @param onLongPress Callback for the long press event.
 * @param onClick Callback for the short click event.
 * @param ms The duration in milliseconds to qualify as a long press.
 */
export function useLongPress({
  onClick = () => {},
  onLongPress = () => {},
  ms = 400,
} = {}) {
  // FIX: Replace NodeJS.Timeout with ReturnType<typeof setTimeout> to use the correct timer type for browser environments.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const start = useCallback(() => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onLongPress();
    }, ms);
  }, [onLongPress, ms]);

  const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // If it was not a long press, trigger the click handler
    if (!isLongPress.current) {
      onClick();
    }
    // Prevent the default link/button action if a long press was triggered
    if (isLongPress.current) {
      e.preventDefault();
    }
  }, [onClick]);

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: stop,
    onTouchEnd: stop,
  };
}