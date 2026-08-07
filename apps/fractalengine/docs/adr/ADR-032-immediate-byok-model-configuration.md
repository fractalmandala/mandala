---
id: ADR-032
title: Persist BYOK Models Immediately
type: adr
tags: [ai, byok, settings, keychain, model-registry]
summary: Makes API key, endpoint, and model configuration one immediate keychain-backed BYOK action and relegates workspace .env discovery to legacy compatibility.
relates_to: [ADR-017, ADR-029, ADR-030]
status: accepted
updated: 2026-07-16
---

# ADR-032: Persist BYOK Models Immediately

**Status:** Accepted
**Date:** 2026-07-16
**Decision makers:** FractalEngine Studio maintainer

## Context

The provider settings screen exposed two Add Model entry points, a legacy workspace `.env`
discovery explanation, and an Active Provider selector assembled from static provider
definitions. The visible paths did not explain which configuration would actually power a
chat request.

The previous Add Model dialog wrote the API key only into an in-memory settings draft. The
outer Save Changes button was required to place that secret in the OS keychain. Closing the
dialog after adding a model could therefore leave a configuration with a generated credential
id but no credential, causing a later chat request to fail with “No keychain credential found”.

## Decision

We will make the BYOK Add Model dialog a single immediate API-model action requiring provider
name, API link, model name, API key, and API format.

Submitting the dialog writes the model record and keychain credential in the same settings
bridge transaction, selects the new model, and reports a failure before dismissing the dialog.
Workspace `.env` discovery and pre-existing standard-provider records remain readable for
compatibility, but no longer define the primary setup flow.

## Consequences

### Positive

- A model that is shown as added has a persisted credential and is selected for immediate use.
- Users have one predictable BYOK path for OpenAI-compatible and non-compatible APIs.
- The model picker, rather than a static Active Provider dropdown, reflects usable saved models.

### Negative

- Adding a model commits that AI configuration immediately and is not reverted by Cancel in the outer Settings dialog.
- Legacy standard-provider editing remains available only for existing configurations until a later migration removes it.

### Neutral

- API keys continue to stay out of renderer persistence and are stored through the native keychain gateway.
- Workspace `.env` provider discovery remains available to projects that already depend on it.

## Alternatives Considered

### Keep the draft-only Save Changes requirement

Rejected because it separates the visible model configuration from the credential write and
reproduces the missing-keychain failure when a user closes Settings.

### Keep `.env` discovery as the primary provider screen

Rejected because it does not serve a direct BYOK workflow and confuses manually configured
models with project-specific legacy discovery.

## Related Decisions

| ADR | Title | Relationship |
|---|---|---|
| ADR-017 | Keep Provider Secrets in Native Storage | depends on |
| ADR-029 | Unify AI Model Registry and Native Discovery | enables |
| ADR-030 | Single Add Model Flow | supersedes |

## Reliability amendment (2026-07-16)

The original implementation persisted the public model record before the native credential
batch completed. A successful settings banner could therefore describe a model whose
keychain account was absent, which only became visible on the first chat request.

The settings bridge now writes and verifies each keychain account before it persists or
selects the corresponding model record. Native verification reads the exact account back
inside the Tauri boundary without returning the secret to the renderer. If the public
registry write subsequently fails, the bridge restores the preceding native credential
revision. The browser mock enforces the same missing-custom-credential failure so the
add → restart → chat regression test covers the contract instead of simulating a key.
