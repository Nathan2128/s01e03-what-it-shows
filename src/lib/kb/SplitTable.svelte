<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { mergedInto, splitByProblem } from '#lib/kb/split';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import ProblemTicket from '#lib/kb/ProblemTicket.svelte';

  // The whole ticket by default; with `problem`, one problem in detail.
  let { ticket, problem, examples = 3 }: { ticket: number; problem?: string; examples?: number } = $props();

  const merged = $derived(mergedInto(reports as Report[], ticket));
  const groups = $derived(splitByProblem(merged, tenantOf, notes.oneDayMove));
  const problems = $derived(groups.filter((g) => g.problem !== 'unplaced'));
  const one = $derived(problem ? groups.find((g) => g.problem === problem) : undefined);
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([ch, n]) => `${ch} ×${n}`)
      .join(' · ');
</script>

{#if problem}
  {#if one}
    <dl class="card">
      <dt>reports</dt><dd><strong>{one.reports.length}</strong> of {merged.length}</dd>
      <dt>tenants</dt><dd>{one.tenants.length}: {one.tenants.join(', ')}</dd>
      <dt>came in by</dt><dd>{channels(one.channels)}</dd>
      <dt>seen</dt><dd>{one.firstSeen} → {one.lastSeen}</dd>
      <dt>ticket</dt><dd><ProblemTicket problem={one.problem} /></dd>
    </dl>
    {#if examples > 0}
      <table class="examples">
        <thead><tr><th>report</th><th>tenant</th><th>channel</th><th>what they wrote</th></tr></thead>
        <tbody>
          {#each one.reports.slice(0, examples) as r (r.id)}
            <tr><td><code>{r.id}</code></td><td>{r.tenant}</td><td>{r.channel}</td><td class="body">{r.body}</td></tr>
          {/each}
        </tbody>
      </table>
    {/if}
  {:else}
    <p class="unfiled">No problem called <code>{problem}</code> in #{ticket}.</p>
  {/if}
{:else}
  <p class="sum">
    <strong>{merged.length}</strong> reports merged into #{ticket}, each counted once ·
    <strong>{problems.length}</strong>
    {problems.length === 1 ? 'problem' : 'problems'}
  </p>

  <table>
    <thead>
      <tr><th>problem</th><th>reports</th><th>tenants</th><th>came in by</th><th>seen</th><th>ticket</th></tr>
    </thead>
    <tbody>
      {#each groups as g (g.problem)}
        <tr class:unplaced={g.problem === 'unplaced'}>
          <td><code>{g.problem}</code></td>
          <td>{g.reports.length}</td>
          <td>{g.tenants.length}</td>
          <td class="ch">{channels(g.channels)}</td>
          <td>{g.reports.length ? `${g.firstSeen} → ${g.lastSeen}` : '—'}</td>
          <td><ProblemTicket problem={g.problem} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<style>
  .sum { font-size: 1.1rem; }
  .ch { color: var(--muted); font-size: 0.85em; }
  .unplaced td { background: var(--warn-bg); }
  .unfiled { color: var(--warn); }
  .card { display: grid; grid-template-columns: max-content 1fr; gap: 0.15rem 1rem; margin: 1rem 0; font-size: 0.92rem; }
  .card dt { color: var(--muted); }
  .card dd { margin: 0; }
  .examples .body { color: var(--muted); font-size: 0.88em; }
</style>
