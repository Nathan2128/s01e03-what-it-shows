import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    mdsvex({
      extensions: ['.svx'],
      // `layout: runbook` in a page's frontmatter → the frame every kb page shares.
      layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) },
    }),
  ],
  kit: {
    adapter: adapter({ pages: 'build', assets: 'build', strict: true }),
    // `#lib/…` imports, as the pages and components already write them.
    alias: { '#lib': 'src/lib' },
    // Put the CSS in the page, so a saved copy reads the same as the live one.
    inlineStyleThreshold: Infinity,
    prerender: { entries: ['*', '/kb'], handleHttpError: 'fail', handleMissingId: 'fail' },
  },
};
