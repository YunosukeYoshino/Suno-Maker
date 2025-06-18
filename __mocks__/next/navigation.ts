import { vi } from "vitest";

const push = vi.fn();
const back = vi.fn();
const forward = vi.fn();
const refresh = vi.fn();

export const useRouter = () => ({
  push,
  back,
  forward,
  refresh,
});

export const usePathname = () => "/";
export const useSearchParams = () => new URLSearchParams();
