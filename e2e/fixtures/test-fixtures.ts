import { test as base } from "@playwright/test";

type TestFixtures = Record<string, never>;

export const test = base.extend<TestFixtures>({
  // fixture実装は将来追加
});

export { expect } from "@playwright/test";
