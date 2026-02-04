#!/usr/bin/env node

import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync, copyFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isWatch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: [join(__dirname, 'spacetime-bridge.ts')],
    bundle: true,
    outfile: join(__dirname, 'js', 'spacetime-bridge.bundle.js'),
    format: 'iife',
    platform: 'browser',
    target: 'es2020',
    minify: false, // Set to true for production
    sourcemap: true,
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    logLevel: 'info',
    banner: {
        js: '// SpacetimeDB Bridge Bundle - Auto-generated\n',
    },
    // Don't use globalName - we assign to window.SNBridge directly in the code
};

// Ensure output directory exists
const outputDir = join(__dirname, 'js');
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
}

if (isWatch) {
    console.log('Building bridge in watch mode...');
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
    console.log('Watching for changes...');
} else {
    console.log('Building bridge...');
    try {
        await esbuild.build(buildOptions);
        console.log('✓ Bridge built successfully!');
        console.log(`  Output: ${buildOptions.outfile}`);
        
        // Copy bundle to exports/web/js/ for Godot web export
        const exportsJsDir = join(__dirname, 'exports', 'web', 'js');
        const exportsBundlePath = join(exportsJsDir, 'spacetime-bridge.bundle.js');
        const exportsMapPath = join(exportsJsDir, 'spacetime-bridge.bundle.js.map');
        
        if (!existsSync(exportsJsDir)) {
            mkdirSync(exportsJsDir, { recursive: true });
            console.log(`Created exports directory: ${exportsJsDir}`);
        }
        
        copyFileSync(buildOptions.outfile, exportsBundlePath);
        copyFileSync(buildOptions.outfile + '.map', exportsMapPath);
        console.log(`  Copied to: ${exportsBundlePath}`);
    } catch (error) {
        console.error('✗ Build failed:', error);
        process.exit(1);
    }
}
