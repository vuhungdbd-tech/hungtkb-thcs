const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

const replacements = [
  // In line 2008
  {
    old: "if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;",
    new: "if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;\n              if (isSchoolOff(dM, pM, subId)) continue;"
  }
];

let lines = code.split('\n');
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;")) {
     lines[i] = "              if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;\n              if (isSchoolOff(dM, pM, subId)) continue;";
  }
}
fs.writeFileSync('src/algorithm.ts', lines.join('\n'));
