import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => navigator.userAgent.includes("Mac");
const getServerSnapshot = () => true;

export function useIsMac() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
