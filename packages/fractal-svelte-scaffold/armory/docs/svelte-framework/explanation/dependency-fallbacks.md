---
title: "Dependency fallbacks"
description: "Understand how the framework handles missing libraries, motion engines, and optional integrations."
type: explanation
---

# Dependency fallbacks

The framework does not silently add packages. It distinguishes:

- present dependencies that can be used;
- required dependencies that are missing;
- dependencies that are optional;
- native or existing-project fallbacks; and
- behavior that cannot be preserved.

For simple animation, a missing motion library may be replaced with a native Svelte
transition. For complex physics or a required third-party primitive, the honest result
may be `partial` or `blocked`.

This keeps generated code buildable and makes the cost of a future dependency decision
visible.
