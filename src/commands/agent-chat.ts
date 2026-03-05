import * as readline from "node:readline";
import { type CliDeps, createDefaultDeps } from "../cli/deps.js";
import { defaultRuntime, type RuntimeEnv } from "../runtime.js";
import { agentCommand } from "./agent.js";

export type AgentChatOpts = {
  sessionId?: string;
  agentId?: string;
  thinking?: string;
};

/**
 * Reads a single line from stdin, writing `prompt` to stderr first.
 * Creates and immediately closes a readline interface per call so it
 * never conflicts with the readline created inside wrapToolWithConfirm.
 * Returns null on EOF.
 */
async function chatReadLine(prompt: string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: false,
    });
    process.stderr.write(prompt);
    let done = false;
    rl.once("line", (line) => {
      done = true;
      rl.close();
      resolve(line);
    });
    rl.once("close", () => {
      if (!done) {
        resolve(null);
      }
    });
  });
}

export async function agentChatCommand(
  opts: AgentChatOpts,
  runtime: RuntimeEnv = defaultRuntime,
  deps: CliDeps = createDefaultDeps(),
): Promise<void> {
  const sessionId = opts.sessionId ?? crypto.randomUUID();
  const isTTY = Boolean(process.stdin.isTTY);

  if (isTTY) {
    process.stderr.write(`\nChat session: ${sessionId}\n`);
    process.stderr.write('Type "exit" or press Ctrl+D to quit.\n\n');
  }

  while (true) {
    const line = await chatReadLine(isTTY ? "you> " : "");
    if (line === null) {
      break;
    }
    const message = line.trim();
    if (!message) {
      continue;
    }
    if (message === "exit" || message === "quit") {
      break;
    }

    try {
      await agentCommand(
        {
          message,
          sessionId,
          agentId: opts.agentId,
          thinking: opts.thinking,
          senderIsOwner: true,
        },
        runtime,
        deps,
      );
    } catch (err) {
      process.stderr.write(`\n[chat error] ${String(err)}\n`);
    }

    if (isTTY) {
      process.stderr.write("\n");
    }
  }

  if (isTTY) {
    process.stderr.write("\nBye!\n");
  }
}
