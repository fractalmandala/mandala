import type { DocsMcpServer, JsonRpcRequest } from './server.js';

export interface StdioTransportOptions {
	input: AsyncIterable<string | Uint8Array>;
	write: (line: string) => void;
	onError?: (error: Error) => void;
}

/**
 * Serves an MCP session over newline-delimited JSON-RPC.
 *
 * Newline framing keeps this dependency-free and works with the stdio transport MCP
 * clients use; malformed lines are reported without terminating the session.
 */
export async function serveDocsMcpOverStdio(
	server: DocsMcpServer,
	options: StdioTransportOptions
): Promise<void> {
	const decoder = new TextDecoder();
	let buffer = '';

	const handleLine = async (line: string): Promise<void> => {
		const trimmed = line.trim();
		if (trimmed === '') {
			return;
		}

		let request: JsonRpcRequest;
		try {
			request = JSON.parse(trimmed) as JsonRpcRequest;
		} catch {
			options.write(
				JSON.stringify({
					jsonrpc: '2.0',
					id: null,
					error: { code: -32700, message: 'Parse error' }
				})
			);
			return;
		}

		const response = await server.handle(request);
		if (response) {
			options.write(JSON.stringify(response));
		}
	};

	for await (const chunk of options.input) {
		buffer += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });

		let newline = buffer.indexOf('\n');
		while (newline !== -1) {
			const line = buffer.slice(0, newline);
			buffer = buffer.slice(newline + 1);
			try {
				await handleLine(line);
			} catch (error) {
				options.onError?.(error instanceof Error ? error : new Error(String(error)));
			}
			newline = buffer.indexOf('\n');
		}
	}

	if (buffer.trim() !== '') {
		await handleLine(buffer);
	}
}
