const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');
let lines = code.split('\n');

for (let i = 2845; i < 2860; i++) {
  if (lines[i] && lines[i].includes('}')) {
    if (lines[i-1] && lines[i-1].includes('}')) { // The one right after the for loop
       lines[i] = ""; // Delete it
       break;
    }
  }
}
fs.writeFileSync('src/algorithm.ts', lines.join('\n'));
