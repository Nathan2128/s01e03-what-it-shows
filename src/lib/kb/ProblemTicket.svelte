<script lang="ts">
  import tickets from '#lib/data/tickets-4471.json';
  import { ticketHref, type Problem, type Tickets } from '#lib/kb/split';

  let { problem }: { problem: Problem | 'unplaced' } = $props();

  const t = tickets as Tickets;
  const href = $derived(ticketHref(t, problem));
  const n = $derived(problem === 'unplaced' ? null : t.issues[problem]);
</script>

{#if href}
  <a {href}>{t.repo.split('/')[1]}#{n}</a>
{:else}
  <span class="unfiled">not filed yet</span>
{/if}

<style>
  .unfiled { color: var(--warn); font-weight: 600; }
</style>
