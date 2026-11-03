---
name: immersation-draft-publisher
description: Submit bilingual Immersation packages to the approved staging API as drafts and report confirmed review status.
---

# Immersation draft publisher

Use this skill only after the operator has approved an isolated staging connection and installed the accompanying `immersation.py` client. It prepares draft submissions; it never approves, publishes, posts to social networks, modifies production configuration or installs itself on a live Hermes machine.

1. Obtain a locally prepared package directory with `package.json` using the example manifest and media files inside that directory. Cover, Pinterest 1 and Pinterest 2 are required. Never invent citations or claim that QA passed without evidence.
2. Confirm `IMMERSATION_API_BASE` and `MIRA_AGENT_TOKEN` are already set in protected environment variables. Never display or transmit the token in prompts, terminal output, logs or Telegram.
3. Run `python3 /path/to/immersation.py submit --package /path/to/package`. Preserve `.mira-state.json` and its keys. Do not delete, regenerate or share it during recovery.
4. If the client reports an uncertain upload, stop and ask an authorized administrator to investigate. Never automatically retry or change the key. After a verified candidate is attached, the operator may explicitly run `submit ... --resume-reconciled`. After a separately recorded operator-confirmed absence, the operator may explicitly run `submit ... --retry-confirmed-absent <role>`; the client checks the server state before creating a new key.
5. Run `python3 /path/to/immersation.py status --id <submission-id>` as needed. Report only the returned server status and authenticated review URL, and distinguish failures from completed submissions. A Telegram-friendly summary may be passed to the existing Hermes gateway; do not create a new bot.
