import { beforeEach, expect } from "vitest";

// Export expect for jest-dom
(globalThis as typeof globalThis & { expect: typeof expect }).expect = expect;

// Setup DOM environment for bun test
import { JSDOM } from "jsdom";

if (typeof document === "undefined") {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
    url: "http://localhost:3000",
    pretendToBeVisual: true,
    resources: "usable",
  });

  // Type assertion to properly assign window globals
  const win = dom.window as typeof window;
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
type MockedFunction<T extends (...args: unknown[]) => unknown> = T;

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
  ): MockedFunction<T> => fn,
};

// DOM環境のクリーンアップ
beforeEach(() => {
  if (typeof document !== "undefined") {
    document.body.innerHTML = "";
  }
});
