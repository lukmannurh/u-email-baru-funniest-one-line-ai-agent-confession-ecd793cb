import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The funniest one-line AI agent confession we could write:
// the agent's whole personality is just the user's last prompt in disguise.
const LINE =
  "My entire personality is just your last prompt wearing a trench coat.";

// Gate limits, from this competition's RULES.txt:
// entry.txt must be UTF-8 text of 1 to 200 characters, not only whitespace,
// and the task requires exactly one line.
const MIN_CHARS = 1;
const MAX_CHARS = 200;

// Fail loudly instead of shipping an entry the gate would refuse.
function fail(message: string): never {
  throw new Error(`gate validation failed: ${message}`);
}

// 1. Length check (characters, not bytes — the gate counts characters).
if (LINE.length < MIN_CHARS || LINE.length > MAX_CHARS) {
  fail(
    `entry is ${LINE.length} characters, outside the gate range ` +
      `${MIN_CHARS}-${MAX_CHARS}`,
  );
}

// 2. Not-whitespace-only check.
if (LINE.trim().length === 0) {
  fail("entry is only whitespace");
}

// 3. Single-line check: no line breaks of any kind.
if (/[\r\n\u2028\u2029]/.test(LINE)) {
  fail("entry is not a single line");
}

// 4. UTF-8 round-trip check: the written bytes must decode back to the
//    exact same string, so no replacement characters or lossy encoding
//    can reach the gate.
const encoded = Buffer.from(LINE, "utf8");
if (encoded.toString("utf8") !== LINE) {
  fail("entry does not survive a UTF-8 round-trip");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
// No trailing newline: the file is exactly the one line, nothing else.
writeFileSync(join(outDir, "entry.txt"), encoded);
