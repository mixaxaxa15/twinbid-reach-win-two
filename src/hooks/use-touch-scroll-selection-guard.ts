import { useEffect, useRef, type PointerEventHandler } from "react";

const CALCULATOR_TOUCH_SCOPE =
  "[data-traffic-calculator-root], [data-traffic-calculator-menu]";
const SCROLL_DISTANCE_PX = 10;
const SYNTHETIC_CLICK_WINDOW_MS = 800;

type DeferredTouchOpenHandlers = {
  onPointerDown: PointerEventHandler<HTMLElement>;
  onPointerMove: PointerEventHandler<HTMLElement>;
  onPointerUp: PointerEventHandler<HTMLElement>;
  onPointerCancel: PointerEventHandler<HTMLElement>;
};

type TouchPointerGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  moved: boolean;
};

function isInsideCalculator(target: EventTarget | null): target is Element {
  return target instanceof Element && Boolean(target.closest(CALCULATOR_TOUCH_SCOPE));
}

/**
 * Prevents a synthetic click from selecting a calculator field after a touch
 * gesture was actually used to scroll. A fresh touch always clears the guard,
 * so an intentional tap immediately after scrolling still works.
 */
export function useTouchScrollSelectionGuard() {
  useEffect(() => {
    let active = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let suppressClickUntil = 0;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      active = Boolean(touch) && isInsideCalculator(event.target);
      moved = false;
      suppressClickUntil = 0;
      if (touch) {
        startX = touch.clientX;
        startY = touch.clientY;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!active || moved) return;
      const touch = event.touches[0];
      if (!touch) return;
      if (
        Math.abs(touch.clientX - startX) >= SCROLL_DISTANCE_PX
        || Math.abs(touch.clientY - startY) >= SCROLL_DISTANCE_PX
      ) {
        moved = true;
      }
    };

    const finishTouch = () => {
      if (active && moved) {
        suppressClickUntil = Date.now() + SYNTHETIC_CLICK_WINDOW_MS;
      }
      active = false;
      moved = false;
    };

    const handleClick = (event: MouseEvent) => {
      if (
        suppressClickUntil > Date.now()
        && isInsideCalculator(event.target)
      ) {
        suppressClickUntil = 0;
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { capture: true, passive: true });
    document.addEventListener("touchmove", handleTouchMove, { capture: true, passive: true });
    document.addEventListener("touchend", finishTouch, { capture: true, passive: true });
    document.addEventListener("touchcancel", finishTouch, { capture: true, passive: true });
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("touchend", finishTouch, true);
      document.removeEventListener("touchcancel", finishTouch, true);
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
}

/**
 * Radix dropdown triggers open on pointerdown. On touch devices that is too
 * early to distinguish a tap from the beginning of a page scroll. These
 * handlers defer only touch activation until pointerup, when the finger has
 * not moved far enough to count as scrolling.
 */
export function useDeferredTouchOpen(onTap: () => void): DeferredTouchOpenHandlers {
  const gestureRef = useRef<TouchPointerGesture | null>(null);

  const onPointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (event.pointerType !== "touch") return;

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };

    // Radix composes the child's pointerdown before its own opening handler and
    // skips that handler when the event is prevented. Scrolling remains
    // controlled by the browser's touch-action behavior.
    event.preventDefault();
  };

  const onPointerMove: PointerEventHandler<HTMLElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId || gesture.moved) return;

    if (
      Math.abs(event.clientX - gesture.startX) >= SCROLL_DISTANCE_PX
      || Math.abs(event.clientY - gesture.startY) >= SCROLL_DISTANCE_PX
    ) {
      gesture.moved = true;
    }
  };

  const onPointerUp: PointerEventHandler<HTMLElement> = (event) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    gestureRef.current = null;
    if (!gesture.moved) {
      // Suppress the compatibility click: this pointerup is the single source
      // of truth for an intentional touch tap.
      event.preventDefault();
      onTap();
    }
  };

  const onPointerCancel: PointerEventHandler<HTMLElement> = (event) => {
    if (gestureRef.current?.pointerId === event.pointerId) {
      gestureRef.current = null;
    }
  };

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
