"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false أثناء الرندر على السيرفر وأول hydration، ثم true في المتصفح */
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
