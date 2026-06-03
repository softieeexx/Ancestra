---
name: ritual-dapp-skills-installed
description: Ritual Chain dApp skills (32+) installed from GitHub repo, registered in project settings.json, persisted across sessions.
metadata:
  type: reference
---

**Status: INSTALLED** (as of 2026-06-03). Cloned from https://github.com/ritual-foundation/ritual-dapp-skills.git into `.claude/skills/ritual-dapp-skills/`. Registered in `.claude/settings.json` under `skills` key with all sub-skill paths.

**Entry point:** User-invocable `ritual` skill loads `skills/ritual/SKILL.md` which orchestrates the full build pipeline.

**Available skills (32+):** overview, design, contracts, precompiles, http, llm, onnx, agents (persistent + sovereign), wallet, scheduler, secrets/ECIES, passkeys/P-256, Ed25519, ZK proofs, FHE, multimodal, long-running, X402, deploy, testing, block-time, DA/storage, and meta skills (bootstrap, inspiration, projection, elicitation, orchestrator, circuit-breaker, human-in-loop, non-interactive-bias, verification).

**Plus:** `ritual-docs` skill with FULL.md containing the complete documentation text.

**Key system contracts:**
- RitualWallet: `0x532F0dF0896F353d8C3DD8cc134e8129DA2a3948`
- AsyncJobTracker: `0xC069FFCa0389f44eCA2C626e55491b0ab045AEF5`
- AsyncDelivery: `0x5A16214fF555848411544b005f7Ac063742f39F6`
- Scheduler: `0x56e776BAE2DD60664b69Bd5F865F1180ffB7D58B`
- TEEServiceRegistry: `0x9644e8562cE0Fe12b4deeC4163c064A8862Bf47F`
- AgentHeartbeat: `0xEF505E801f1Db392B5289690E2ffc20e840A3aCa`

**Chain ID:** 1979 | **RPC:** https://rpc.ritualfoundation.org | **Explorer:** https://explorer.ritualfoundation.org | **Faucet:** https://faucet.ritualfoundation.org

**AI model:** `zai-org/GLM-4.7-FP8` (64K context, open-weight, self-hosted in TEE)

**How to use:** Tell Claude "build a dApp on Ritual" or use `/ritual` (if registered as slash command).
