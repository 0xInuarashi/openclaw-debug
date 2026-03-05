---
description: Repository Information Overview
alwaysApply: true
---

# OpenClaw Information

## Summary

OpenClaw is a multi-channel AI gateway with extensible messaging integrations. It connects AI agents to messaging platforms (Telegram, Discord, Slack, Signal, iMessage, WhatsApp, LINE, MS Teams, and many more) via a plugin/extension architecture. The CLI (`openclaw`) runs as a gateway server and client, with companion native apps for macOS, iOS, and Android.

## Structure

- **`src/`** – Core TypeScript source: CLI wiring (`src/cli`), commands (`src/commands`), gateway server (`src/gateway`), channels (`src/channels`, `src/telegram`, `src/discord`, `src/slack`, `src/signal`, `src/imessage`, `src/web`), agents, media pipeline, providers, routing, plugin SDK.
- **`extensions/`** – Workspace packages for channel plugins (discord, slack, signal, matrix, msteams, zalo, voice-call, etc.). Each has its own `package.json`.
- **`apps/`** – Native apps: `apps/macos` (Swift/SwiftUI), `apps/ios` (Swift/SwiftUI), `apps/android` (Kotlin/Gradle), `apps/shared` (OpenClawKit).
- **`ui/`** – Web UI (Lit/Vite), built and embedded in the gateway.
- **`packages/`** – Internal workspace packages: `clawdbot`, `moltbot`.
- **`skills/`** – Python/shell skill scripts for AI agents.
- **`docs/`** – Mintlify documentation (English + zh-CN + ja-JP).
- **`scripts/`** – Build, test, release, and tooling scripts.
- **`Swabble/`** – Embedded Swift package (nested repo).
- **`test/`** – Top-level test fixtures, helpers, and e2e test files.

## Language & Runtime

**Language**: TypeScript (ESM), Swift (macOS/iOS apps), Kotlin (Android app), Python (skills/scripts)
**Runtime**: Node.js `>=22.12.0`; Bun supported for script execution and dev
**Build System**: `tsdown` (for TypeScript bundling), Xcode (iOS/macOS), Gradle (Android)
**Package Manager**: `pnpm@10.23.0`

## Dependencies

**Key Production Dependencies**:

- `grammy`, `@grammyjs/runner` – Telegram
- `@slack/bolt`, `@slack/web-api` – Slack
- `@discordjs/voice`, `discord-api-types` – Discord
- `@whiskeysockets/baileys` – WhatsApp
- `@line/bot-sdk` – LINE
- `@buape/carbon` – Discord REST (Carbon)
- `express` `^5.2.1` – HTTP server
- `ws` – WebSocket
- `@sinclair/typebox` – Schema/validation
- `zod` – Additional validation
- `@mariozechner/pi-agent-core`, `pi-ai`, `pi-coding-agent`, `pi-tui` – Pi agent integration
- `@agentclientprotocol/sdk` – ACP SDK
- `@aws-sdk/client-bedrock` – AWS Bedrock AI
- `jiti` – Runtime TypeScript import
- `playwright-core` – Browser automation
- `sharp`, `pdfjs-dist` – Media processing
- `sqlite-vec` – Vector search

**Key Dev Dependencies**:

- `vitest ^4.0.18` – Testing framework
- `typescript ^5.9.3` – TypeScript compiler
- `oxlint`, `oxfmt` – Linting and formatting
- `tsdown` – Bundler
- `tsx` – TypeScript execution

## Build & Installation

```bash
pnpm install

pnpm build

pnpm openclaw ...

pnpm dev
```

**Platform builds**:

```bash
pnpm android:run
pnpm ios:run
pnpm mac:package
```

## Docker

**Dockerfile**: `Dockerfile` (base: `node:22-bookworm`)
**Sandbox images**: `Dockerfile.sandbox`, `Dockerfile.sandbox-browser`, `Dockerfile.sandbox-common`
**Compose**: `docker-compose.yml`

Two services in Compose:

- **`openclaw-gateway`**: runs `node dist/index.js gateway --bind lan --port 18789`; exposes ports `18789` (gateway) and `18790` (bridge); healthcheck via `/healthz`.
- **`openclaw-cli`**: shares gateway network, runs `node dist/index.js` interactively.

Key env vars: `OPENCLAW_GATEWAY_TOKEN`, `OPENCLAW_CONFIG_DIR`, `OPENCLAW_WORKSPACE_DIR`.

## Main Entry Points

- **CLI binary**: `openclaw.mjs` → `dist/index.js`
- **Core entry**: `src/entry.ts`, `src/index.ts`
- **Gateway**: `src/gateway/`
- **Plugin SDK**: `src/plugin-sdk/index.ts`
- **UI**: `ui/src/` (Lit components, Vite build)
- **macOS app**: `apps/macos/Sources/`
- **iOS app**: `apps/ios/Sources/`
- **Android app**: `apps/android/app/`

## Testing

**Framework**: Vitest `^4.0.18` with V8 coverage (thresholds: 70% lines/functions/statements, 55% branches)
**Test locations**:

- Unit tests: `src/**/*.test.ts`, `extensions/**/*.test.ts`, `test/**/*.test.ts`
- E2E tests: `**/*.e2e.test.ts`
- Live tests: `**/*.live.test.ts`
  **Naming convention**: `*.test.ts` (unit), `*.e2e.test.ts` (E2E), `*.live.test.ts` (live/integration)
  **Config files**: `vitest.config.ts`, `vitest.unit.config.ts`, `vitest.e2e.config.ts`, `vitest.live.config.ts`, `vitest.extensions.config.ts`, `vitest.channels.config.ts`, `vitest.gateway.config.ts`

**Run Commands**:

```bash
pnpm test
pnpm test:coverage
pnpm test:e2e
OPENCLAW_LIVE_TEST=1 CLAWDBOT_LIVE_TEST=1 pnpm test:live
pnpm test:docker:all
OPENCLAW_TEST_PROFILE=low OPENCLAW_TEST_SERIAL_GATEWAY=1 pnpm test
```

**Lint & Type-check**:

```bash
pnpm check
pnpm tsgo
pnpm lint
pnpm format
pnpm format:fix
```
