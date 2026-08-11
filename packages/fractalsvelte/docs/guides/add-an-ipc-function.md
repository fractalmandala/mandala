---
id: add-an-ipc-function
title: Adding an IPC Function
type: guide
tags: [ipc, backend, tauri, guide]
relates_to: [ADR-004, ADR-018, ADR-028]
summary: Guide on defining backend IPC endpoints with Tauri gateway functions and browser mocks.
updated: 2026-07-15
---


All front-end to back-end communications must pass through the single IPC gateway.

## Playbook & Steps

### 1. Update the signature interface
Add your function signature to the `IpcApi` interface contract inside `src/lib/ipc.ts`:
```typescript
export interface IpcApi {
	myNewFunction(path: string): Promise<string>;
}
```

### 2. Implement the Tauri gateway
Implement the gateway method in `src/lib/ipc.ts` that triggers the Tauri command wrapper when running inside Tauri:
```typescript
export async function myNewFunction(path: string): Promise<string> {
	if (isTauri()) {
		return invoke<string>('my_new_function', { path });
	}
	return mockIpc.myNewFunction(path);
}
```

### 3. Implement the browser mock
Add the mock implementation in `src/lib/ipc-mock.ts` so `pnpm dev` works in normal web browsers.

### 4. Implement the native Tauri Rust command
If the feature runs natively:
- Open `src-tauri/src/lib.rs`.
- Write the native Rust command function matching your signature:
```rust
#[tauri::command]
fn my_new_function(path: String, authorized: tauri::State<'_, AuthorizedPaths>) -> Result<String, String> {
    let checked_path = authorized_path(&authorized, Path::new(&path), false)?;
    // logic...
    Ok("success".to_string())
}
```
- Register the command in the Tauri builder block: `tauri::Builder::default().invoke_handler(tauri::generate_handler![..., my_new_function])`.

### 5. Enforce boundaries
- **NATIVE_ONLY rules**: Do not introduce native-only commands unless explicitly justified (ADR-028).
- **Paths boundaries**: Pass paths through `authorized_path` bounds check to prevent directory traversal (ADR-018).

## Verification Checklist

- [ ] Run `npx vitest run tests/unit/ipc-contract.test.ts` to check gateway and mock parity.
- [ ] Run `cargo test` in `src-tauri/` to verify Rust unit tests.
- [ ] Run `pnpm check` to confirm types match.
