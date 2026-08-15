// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDeferredTouchOpen, useTouchScrollSelectionGuard } from "@/hooks/use-touch-scroll-selection-guard";

function Harness({ onSelect }: { onSelect: () => void }) {
  useTouchScrollSelectionGuard();
  return (
    <div data-traffic-calculator-root>
      <button type="button" onClick={onSelect}>Field</button>
    </div>
  );
}

function DeferredOpenHarness() {
  const [open, setOpen] = useState(false);
  const touchHandlers = useDeferredTouchOpen(() => setOpen((current) => !current));

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button type="button" {...touchHandlers}>Targeting</button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}

function firePointer(
  element: Element,
  type: "pointerdown" | "pointermove" | "pointerup",
  init: { pointerId: number; pointerType: "touch" | "mouse"; clientX: number; clientY: number },
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(event, {
    pointerId: { value: init.pointerId },
    pointerType: { value: init.pointerType },
    clientX: { value: init.clientX },
    clientY: { value: init.clientY },
    button: { value: 0 },
    ctrlKey: { value: false },
  });
  fireEvent(element, event);
}

describe("traffic calculator touch scroll guard", () => {
  it("blocks the synthetic click after a scroll gesture", () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const field = screen.getByRole("button", { name: "Field" });

    fireEvent.touchStart(field, { touches: [{ clientX: 20, clientY: 100 }] });
    fireEvent.touchMove(field, { touches: [{ clientX: 20, clientY: 140 }] });
    fireEvent.touchEnd(field, { changedTouches: [{ clientX: 20, clientY: 140 }] });
    fireEvent.click(field);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("keeps a normal tap selectable", () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const field = screen.getByRole("button", { name: "Field" });

    fireEvent.touchStart(field, { touches: [{ clientX: 20, clientY: 100 }] });
    fireEvent.touchEnd(field, { changedTouches: [{ clientX: 20, clientY: 100 }] });
    fireEvent.click(field);

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("does not open a targeting field on touch down", () => {
    render(<DeferredOpenHarness />);
    const field = screen.getByRole("button", { name: "Targeting" });

    firePointer(field, "pointerdown", {
      pointerId: 1,
      pointerType: "touch",
      clientX: 20,
      clientY: 100,
    });

    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a targeting field only after an intentional touch tap", () => {
    render(<DeferredOpenHarness />);
    const field = screen.getByRole("button", { name: "Targeting" });

    firePointer(field, "pointerdown", {
      pointerId: 2,
      pointerType: "touch",
      clientX: 20,
      clientY: 100,
    });
    firePointer(field, "pointerup", {
      pointerId: 2,
      pointerType: "touch",
      clientX: 20,
      clientY: 100,
    });

    expect(field).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps a targeting field closed when the touch becomes a scroll", () => {
    render(<DeferredOpenHarness />);
    const field = screen.getByRole("button", { name: "Targeting" });

    firePointer(field, "pointerdown", {
      pointerId: 3,
      pointerType: "touch",
      clientX: 20,
      clientY: 100,
    });
    firePointer(field, "pointermove", {
      pointerId: 3,
      pointerType: "touch",
      clientX: 20,
      clientY: 140,
    });
    firePointer(field, "pointerup", {
      pointerId: 3,
      pointerType: "touch",
      clientX: 20,
      clientY: 140,
    });

    expect(field).toHaveAttribute("aria-expanded", "false");
  });

  it("preserves the existing mouse pointerdown behavior", () => {
    render(<DeferredOpenHarness />);
    const field = screen.getByRole("button", { name: "Targeting" });

    firePointer(field, "pointerdown", {
      pointerId: 4,
      pointerType: "mouse",
      clientX: 20,
      clientY: 100,
    });

    expect(field).toHaveAttribute("aria-expanded", "true");
  });
});
