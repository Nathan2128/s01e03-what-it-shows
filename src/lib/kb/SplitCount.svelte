<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { mergedInto, splitByProblem } from '#lib/kb/split';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  // One number for a sentence: reports in `problem`, or in every problem but `except`, or all of them.
  let { ticket, problem, except }: { ticket: number; problem?: string; except?: string } = $props();

  const groups = $derived(splitByProblem(mergedInto(reports as Report[], ticket), tenantOf, notes.oneDayMove));
  const n = $derived(
    groups
      .filter((g) => (problem ? g.problem === problem : except ? g.problem !== except : true))
      .reduce((sum, g) => sum + g.reports.length, 0),
  );
</script>

<strong>{n}</strong>
