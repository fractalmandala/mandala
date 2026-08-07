#!/usr/bin/env node
import { runDocsCli } from '../dist/index.js';

process.exitCode = await runDocsCli(process.argv.slice(2));
