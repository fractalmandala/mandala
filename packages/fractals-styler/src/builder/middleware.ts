import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { generateSvelteComponent } from './generator.js';
import type { SaveComponentPayload } from './types.js';

export function createStylerBuilderMiddleware(rootPath: string) {
  return async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // 1. Serve Builder UI Endpoint
    if (url.startsWith('/__styler_builder')) {
      const prototypePath = path.resolve(rootPath, 'node_modules/fractals-styler/dev/prototype.html');
      const fallbackPath = path.resolve(rootPath, 'packages/fractals-styler/dev/prototype.html');

      let htmlContent = '';
      if (fs.existsSync(prototypePath)) {
        htmlContent = fs.readFileSync(prototypePath, 'utf-8');
      } else if (fs.existsSync(fallbackPath)) {
        htmlContent = fs.readFileSync(fallbackPath, 'utf-8');
      } else {
        res.statusCode = 404;
        res.end('Dev Builder UI prototype file not found.');
        return;
      }

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(htmlContent);
      return;
    }

    // 2. Direct File Saver Endpoint
    if (url.startsWith('/__styler_save_component') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const payload: SaveComponentPayload = JSON.parse(body);
          const { targetPath, componentName, node } = payload;

          if (!componentName || !node) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Missing componentName or node data' }));
            return;
          }

          const targetDir = path.resolve(rootPath, targetPath || 'src/lib/components');
          fs.mkdirSync(targetDir, { recursive: true });

          const { svelteCode, sassCode } = generateSvelteComponent(node);

          const svelteFilePath = path.join(targetDir, `${componentName}.svelte`);
          const sassFilePath = path.join(targetDir, `${componentName.toLowerCase()}.sass`);

          fs.writeFileSync(svelteFilePath, svelteCode, 'utf-8');
          fs.writeFileSync(sassFilePath, sassCode, 'utf-8');

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            svelteFilePath,
            sassFilePath
          }));
        } catch (err: any) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: err.message || 'Failed to save component files' }));
        }
      });
      return;
    }

    next();
  };
}
