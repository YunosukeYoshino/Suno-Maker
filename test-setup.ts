/// <reference types="vitest/globals" />
import { beforeEach, expect, vi } from "vitest";
import type { MockInstance, MockedFunction } from "vitest";

// Export expect and vi for jest-dom and mocking
(globalThis as typeof globalThis & { expect: typeof expect }).expect = expect;
(globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;

// Setup DOM environment for bun test
import { JSDOM } from "jsdom";

if (typeof document === "undefined") {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
    resources: "usable",
  });

  // Type assertion to properly assign window globals
  const win = dom.window as unknown as typeof window;
  Object.assign(global, {
    document: win.document,
    window: win,
    navigator: win.navigator,
    HTMLElement: win.HTMLElement,
    Event: win.Event,
    MouseEvent: win.MouseEvent,
    KeyboardEvent: win.KeyboardEvent,
  });
}

import "@testing-library/jest-dom";

// VitestでjestのMockedを使用できるようにする

declare global {
  var jest: {
    Mocked: <T extends (...args: unknown[]) => unknown>(
      fn: T
    ) => MockedFunction<T>;
  };
}

global.jest = {
  ...(global.jest ?? {}),
  Mocked: <T extends (...args: unknown[]) => unknown>(
    fn: T
  ): MockedFunction<T> => fn as MockedFunction<T>,
};

// DOM環境のクリーンアップ
beforeEach(() => {
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});
