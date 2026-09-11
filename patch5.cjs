const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

const replacement = `
  // =========================================================================
  // PHASE 3: Guaranteed Strict Contiguity Enforcer (Final Sweep)
  // Ensures 100% that NO class has gaps: every session with K lessons MUST occupy
  // startP ... startP + K - 1. If any tail lesson is still displaced, force it
  // into earlier holes so lessons are strictly contiguous from period 1 downwards.
  // =========================================================================
  for (let sweep = 0; sweep < 10; sweep++) {
    let sweepChanged = false;
    for (const cls of classes) {
      for (let d = 0; d < config.days; d++) {
`;

code = code.replace(/\/\/ =========================================================================\s*\/\/ PHASE 3: Guaranteed Strict Contiguity Enforcer \(Final Sweep\)\s*[\s\S]*?\/\/ =========================================================================\s*for \(const cls of classes\) \{\s*for \(let d = 0; d < config\.days; d\+\+\) \{/, replacement);

fs.writeFileSync('src/algorithm.ts', code);
