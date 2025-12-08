// CocoFile - Keyboard Shortcuts Hook
// Manages keyboard shortcuts for enhanced navigation and productivity

import { useEffect } from "react";
import type { RefObject } from "react";

interface KeyboardShortcutsConfig {
  // Search box reference for Ctrl+K focus
  searchInputRef?: RefObject<HTMLInputElement>;

  // Navigation callbacks
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onCtrlEnter?: () => void;
  onEscape?: () => void;

  // Control when shortcuts are active
  enabled?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const {
    searchInputRef,
    onArrowUp,
    onArrowDown,
    onEnter,
    onCtrlEnter,
    onEscape,
    enabled = true,
  } = config;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Ctrl+K: Focus search box (works globally)
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        searchInputRef?.current?.focus();
        return;
      }

      // Escape: Blur search box or cancel selection
      if (event.key === "Escape") {
        event.preventDefault();
        if (isInputFocused) {
          (target as HTMLInputElement).blur();
        }
        onEscape?.();
        return;
      }

      // Arrow keys and Enter: Only work when NOT in an input field
      if (!isInputFocused) {
        switch (event.key) {
          case "ArrowUp":
            event.preventDefault();
            onArrowUp?.();
            break;

          case "ArrowDown":
            event.preventDefault();
            onArrowDown?.();
            break;

          case "Enter":
            event.preventDefault();
            if (event.ctrlKey) {
              onCtrlEnter?.();
            } else {
              onEnter?.();
            }
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enabled,
    searchInputRef,
    onArrowUp,
    onArrowDown,
    onEnter,
    onCtrlEnter,
    onEscape,
  ]);
};

export default useKeyboardShortcuts;
