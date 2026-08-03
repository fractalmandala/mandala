// Vendored AI SDK types.
//
// The ai-elements source imports a single type from the Vercel AI SDK:
//   import type { FileUIPart } from "ai";
// That is a *type-only* import — no runtime code from `ai` is ever used — so rather than take
// on the whole SDK as a dependency, the shape is vendored here. It mirrors the AI SDK v6
// `FileUIPart` (the file part of a UI message). Keep it in sync if the SDK shape changes.
//
// prompt-input reads: type, mediaType, filename, url.

export type FileUIPart = {
	type: "file";
	/** IANA media type, e.g. "image/png" or "application/pdf". */
	mediaType: string;
	/** Original filename, when known. */
	filename?: string;
	/** A data: URL or a hosted URL for the file contents. */
	url: string;
};
