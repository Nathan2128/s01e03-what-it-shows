// What #4471 actually holds, problem by problem. causes.ts sorts by tenant and channel; this adds the
// one problem those can't see. Pages explain it; this file is what runs.
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

// `parser` and `hint` come from causes.ts. `one-day` is a date that moved by exactly one day
// (time zone, day boundary), not a day/month swap. Nothing on the report's tenant or channel shows
// it: the desk finds these by reading the body and lists them in desk-notes.json (`oneDayMove`).
export type Problem = Cause | 'one-day';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day'];

// One rule, checked in this order: a report the desk read as a one-day move is `one-day`;
// anything else is whatever causes.ts says.
export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | null {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t);
}

export type ProblemGroup = {
  problem: Problem | 'unplaced';
  reports: Report[];
  tenants: string[];
  channels: Record<string, number>;
  firstSeen: string;
  lastSeen: string;
};

const day = (r: Report) => r.receivedAt.slice(0, 10);
const byReceived = (a: Report, b: Report) => Date.parse(a.receivedAt) - Date.parse(b.receivedAt);

// The reports merged into a ticket, each counted once, oldest first.
export function mergedInto(reports: Report[], ticket: number): Report[] {
  return uniqueById(reports).filter((r) => r.mergedInto === ticket).sort(byReceived);
}

// Every problem in PROBLEMS gets a group, even an empty one, so a problem never drops off the page.
// Reports no rule places come last, as `unplaced`.
export function splitByProblem(
  reports: Report[],
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): ProblemGroup[] {
  const by = new Map<ProblemGroup['problem'], Report[]>(PROBLEMS.map((p) => [p, []]));
  for (const r of [...reports].sort(byReceived)) {
    const p = problemOf(r, tenantOf(r), oneDayMove) ?? 'unplaced';
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  return [...by.entries()]
    .filter(([p, rs]) => p !== 'unplaced' || rs.length > 0)
    .map(([problem, rs]) => ({
      problem,
      reports: rs,
      tenants: [...new Set(rs.map((r) => r.tenant))].sort(),
      channels: rs.reduce<Record<string, number>>((n, r) => ({ ...n, [r.channel]: (n[r.channel] ?? 0) + 1 }), {}),
      firstSeen: rs.length ? day(rs[0]) : '',
      lastSeen: rs.length ? day(rs[rs.length - 1]) : '',
    }));
}

// Where each problem is tracked, and where it stands: tickets-4471.json. No issue number yet means
// not filed yet; no status means open.
export type TicketStatus = 'open' | 'fixed' | "won't fix";
export type ProblemTicket = { issue: number | null; status?: TicketStatus; why?: string };
export type Tickets = { repo: string; ticketClosed?: string; issues: Partial<Record<Problem, ProblemTicket | null>> };

export function ticketOf(tickets: Tickets, p: ProblemGroup['problem']): ProblemTicket | null {
  return p === 'unplaced' ? null : (tickets.issues[p] ?? null);
}

export function ticketHref(tickets: Tickets, p: ProblemGroup['problem']): string | null {
  const n = ticketOf(tickets, p)?.issue;
  return n ? `https://github.com/${tickets.repo}/issues/${n}` : null;
}

// A problem nobody has fixed or ruled out is open, filed or not.
export function statusOf(tickets: Tickets, p: ProblemGroup['problem']): TicketStatus {
  return ticketOf(tickets, p)?.status ?? 'open';
}
