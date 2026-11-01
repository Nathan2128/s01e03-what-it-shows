<script lang="ts">
  import tickets from '#lib/data/tickets-4471.json';
  import { statusOf, ticketOf, type Problem, type Tickets } from '#lib/kb/split';

  // Where a problem stands, from tickets-4471.json. `why` adds the reason the desk was given.
  let { problem, why = false }: { problem: Problem | 'unplaced'; why?: boolean } = $props();

  const t = tickets as Tickets;
  const status = $derived(statusOf(t, problem));
  const reason = $derived(ticketOf(t, problem)?.why);
</script>

<span class="badge {status.replace(/\W+/g, '-')}">{status}</span>{#if why && reason}<span class="why"> · {reason}</span>{/if}

<style>
  .badge { border: 1px solid var(--line); border-radius: 99px; padding: 0 0.5rem; font-size: 0.85em; white-space: nowrap; }
  .fixed { color: var(--accent); border-color: var(--accent); }
  .won-t-fix { color: var(--muted); }
  .open { color: var(--warn); border-color: var(--warn); background: var(--warn-bg); font-weight: 600; }
  .why { color: var(--muted); font-size: 0.88em; }
</style>
