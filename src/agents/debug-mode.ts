import readline from "node:readline/promises";
import type { StreamFn } from "@mariozechner/pi-agent-core";
import { isDebugMode, isRawMode, isToolConfirm } from "../globals.js";
import type { AnyAgentTool } from "./pi-tools.types.js";

function stderrWrite(line: string): void {
  process.stderr.write(`${line}\n`);
}

export function debugPrint(label: string, data?: unknown): void {
  if (!isDebugMode()) {
    return;
  }
  const prefix = `[debug] ${label}`;
  if (data === undefined) {
    stderrWrite(prefix);
    return;
  }
  let serialized: string;
  try {
    serialized = JSON.stringify(data, null, 2);
  } catch {
    serialized = "[unserializable]";
  }
  stderrWrite(`${prefix}\n${serialized}`);
}

export function wrapStreamFnDebugRaw(baseFn: StreamFn): StreamFn {
  const needsRaw = isRawMode();
  const needsDebug = isDebugMode();
  if (!needsRaw && !needsDebug) {
    return baseFn;
  }

  return (model, context, options) => {
    const nextOnPayload = (payload: unknown) => {
      if (needsRaw) {
        stderrWrite("[raw:request]");
        try {
          stderrWrite(JSON.stringify(payload, null, 2));
        } catch {
          stderrWrite("[unserializable payload]");
        }
      }
      if (needsDebug) {
        stderrWrite("[debug] LLM request payload sent");
      }
      options?.onPayload?.(payload);
    };

    const stream = baseFn(model, context, { ...options, onPayload: nextOnPayload });

    if (stream && typeof stream === "object" && "then" in stream) {
      return Promise.resolve(stream).then((s) => wrapStreamDebugRaw(s, needsRaw, needsDebug));
    }
    return wrapStreamDebugRaw(stream, needsRaw, needsDebug);
  };
}

type StreamLike = ReturnType<typeof import("@mariozechner/pi-ai").streamSimple>;

function wrapStreamDebugRaw(
  stream: StreamLike,
  needsRaw: boolean,
  needsDebug: boolean,
): StreamLike {
  const originalResult = stream.result.bind(stream);
  stream.result = async () => {
    const message = await originalResult();
    if (needsRaw) {
      stderrWrite("[raw:response]");
      try {
        stderrWrite(JSON.stringify(message, null, 2));
      } catch {
        stderrWrite("[unserializable response]");
      }
    }
    if (needsDebug) {
      stderrWrite("[debug] LLM response received");
    }
    return message;
  };
  return stream;
}

export async function promptToolConfirm(toolName: string, params: unknown): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  let answer: string;
  try {
    const paramsStr = (() => {
      try {
        return JSON.stringify(params, null, 2);
      } catch {
        return "[unserializable params]";
      }
    })();
    answer = (
      await rl.question(
        `[tool-confirm] Run tool "${toolName}" with params:\n${paramsStr}\nProceed? [y/N] `,
      )
    )
      .trim()
      .toLowerCase();
  } finally {
    rl.close();
  }
  return answer.startsWith("y");
}

export function wrapToolWithConfirm(tool: AnyAgentTool): AnyAgentTool {
  if (!isToolConfirm()) {
    return tool;
  }
  const execute = tool.execute;
  if (!execute) {
    return tool;
  }
  const toolName = tool.name || "tool";
  return {
    ...tool,
    execute: async (toolCallId, params, signal, onUpdate) => {
      const confirmed = await promptToolConfirm(toolName, params);
      if (!confirmed) {
        throw new Error(`[tool-confirm] Tool "${toolName}" was denied by user`);
      }
      if (isDebugMode()) {
        stderrWrite(`[debug] tool call started: ${toolName}`);
      }
      const result = await execute(toolCallId, params, signal, onUpdate);
      if (isDebugMode()) {
        stderrWrite(`[debug] tool call finished: ${toolName}`);
      }
      return result;
    },
  };
}
