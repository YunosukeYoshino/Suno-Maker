import { beforeEach, expect } from "vitest";

// Export expect for jest-dom
(globalThis as typeof globalThis & { expect: typeof expect }).expect = expect;

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
  document.body.innerHTML = "";
});
