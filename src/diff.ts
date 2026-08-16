export type FieldChange =
  | { kind: "added"; key: string; value: unknown }
  | { kind: "changed"; key: string; before: unknown; after: unknown }
  | { kind: "removed"; key: string; before: unknown };

/** Shallow, one-level diff between two state snapshots. LangGraph state is a flat
 * record of channel name to value, so a shallow diff is enough to show what a node
 * touched without pulling in a deep-equal dependency. */
export function diffState(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
): FieldChange[] {
  const changes: FieldChange[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of keys) {
    const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
    const hasAfter = Object.prototype.hasOwnProperty.call(after, key);

    if (!hasBefore && hasAfter) {
      changes.push({ kind: "added", key, value: after[key] });
    } else if (hasBefore && !hasAfter) {
      changes.push({ kind: "removed", key, before: before[key] });
    } else if (!isEqual(before[key], after[key])) {
      changes.push({ kind: "changed", key, before: before[key], after: after[key] });
    }
  }

  return changes;
}

function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return false;
  if (typeof a !== "object") return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
