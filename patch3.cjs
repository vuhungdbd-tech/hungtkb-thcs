const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');
let lines = code.split('\n');

for (let i = 2840; i < 2855; i++) {
  if (lines[i] && lines[i].includes('if (!isSchoolOff(d, targetP, sCand.subjectId)) {')) {
    lines[i] = "              // Removed outer check";
  }
  if (lines[i] && lines[i].includes('const sCand = aftSlots[j];')) {
    lines[i] = "                  const sCand = aftSlots[j];\n                  if (isSchoolOff(d, targetP, sCand.subjectId)) continue;";
  }
}

fs.writeFileSync('src/algorithm.ts', lines.join('\n'));
