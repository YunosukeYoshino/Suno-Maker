import "@testing-library/jest-dom";

// VitestでjestのMockedを使用できるようにする
declare global {
  // biome-ignore lint/suspicious/noExplicitAny: jest compatibility layer
  var jest: any;
}

global.jest = {
  ...global.jest,
  // biome-ignore lint/suspicious/noExplicitAny: jest compatibility layer
  Mocked: (fn: any) => fn,
};
