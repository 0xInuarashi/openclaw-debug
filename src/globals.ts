import { getLogger, isFileLogLevelEnabled } from "./logging/logger.js";
import { theme } from "./terminal/theme.js";

let globalVerbose = false;
let globalYes = false;
let globalDebug = false;
let globalRaw = false;
let globalToolConfirm = false;

export function setVerbose(v: boolean) {
  globalVerbose = v;
}

export function isVerbose() {
  return globalVerbose;
}

export function shouldLogVerbose() {
  return globalVerbose || isFileLogLevelEnabled("debug");
}

export function logVerbose(message: string) {
  if (!shouldLogVerbose()) {
    return;
  }
  try {
    getLogger().debug({ message }, "verbose");
  } catch {
    // ignore logger failures to avoid breaking verbose printing
  }
  if (!globalVerbose) {
    return;
  }
  console.log(theme.muted(message));
}

export function logVerboseConsole(message: string) {
  if (!globalVerbose) {
    return;
  }
  console.log(theme.muted(message));
}

export function setYes(v: boolean) {
  globalYes = v;
}

export function isYes() {
  return globalYes;
}

export function setDebugMode(v: boolean) {
  globalDebug = v;
}

export function isDebugMode() {
  return globalDebug;
}

export function setRawMode(v: boolean) {
  globalRaw = v;
}

export function isRawMode() {
  return globalRaw;
}

export function setToolConfirm(v: boolean) {
  globalToolConfirm = v;
}

export function isToolConfirm() {
  return globalToolConfirm;
}

export const success = theme.success;
export const warn = theme.warn;
export const info = theme.info;
export const danger = theme.error;
