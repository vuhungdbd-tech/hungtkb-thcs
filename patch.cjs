const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

const replacements = [
  { line: 1258, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, lesson.subjectId)' },
  { line: 1358, old: '!isSchoolOff(day, period)', new: '!isSchoolOff(day, period, lesson.subjectId)' },
  { line: 1431, old: 'isSchoolOff(d, p)', new: 'isSchoolOff(d, p, lesson.subjectId)' },
  { line: 1459, old: 'isSchoolOff(d2, p2)', new: 'isSchoolOff(d2, p2, lesson.subjectId)' },
  { line: 1511, old: 'isSchoolOff(d, p)', new: 'isSchoolOff(d, p, lesson.subjectId)' },
  { line: 1577, old: '!isSchoolOff(d, config.morningLessons)', new: '!isSchoolOff(d, config.morningLessons, lesson.subjectId)' },
  { line: 1604, old: 'isSchoolOff(d, nextP)', new: 'isSchoolOff(d, nextP, lesson.subjectId)' },
  { line: 1641, old: 'isSchoolOff(dM, pM)', new: 'isSchoolOff(dM, pM, sExisting.subjectId)' },
  { line: 1722, old: '!isSchoolOff(dayTarget, pTarget)', new: '!isSchoolOff(dayTarget, pTarget, sDonor.subjectId)' },
  { line: 2126, old: 'isSchoolOff(dTarget, pT)', new: 'isSchoolOff(dTarget, pT, sDonor.subjectId)' },
  { line: 2150, old: 'isSchoolOff(dTarget, pT)', new: 'isSchoolOff(dTarget, pT, sDonor.subjectId)' },
  { line: 2206, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, sCand.subjectId)' },
  { line: 2228, old: '!isSchoolOff(d, pCand)', new: '!isSchoolOff(d, pCand, otherSlot.subjectId)' },
  { line: 2251, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, sOcc.subjectId)' },
  { line: 2252, old: '!isSchoolOff(d, pOcc)', new: '!isSchoolOff(d, pOcc, sCand.subjectId)' },
  { line: 2286, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, sDonor.subjectId)' },
  { line: 2287, old: '!isSchoolOff(sDonor.day, sDonor.period)', new: '!isSchoolOff(sDonor.day, sDonor.period, sCand.subjectId)' },
  { line: 2320, old: 'isSchoolOff(d, targetP)', new: 'isSchoolOff(d, targetP, s.subjectId)' }, // Wait let me check 2320
  { line: 2392, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, cand.subjectId)' },
  { line: 2407, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, ws.subjectId)' },
  { line: 2408, old: '!isSchoolOff(ws.day, ws.period)', new: '!isSchoolOff(ws.day, ws.period, cand.subjectId)' },
  { line: 2427, old: '!isSchoolOff(d2, mCount)', new: '!isSchoolOff(d2, mCount, cand.subjectId)' },
  { line: 2437, old: '!isSchoolOff(d2, morningLessons + aCount)', new: '!isSchoolOff(d2, morningLessons + aCount, cand.subjectId)' },
  { line: 2450, old: '!isSchoolOff(d, p)', new: '!isSchoolOff(d, p, cand.subjectId)' },
  { line: 2651, old: 'isSchoolOff(d, morningLessons)', new: 'isSchoolOff(d, morningLessons, lesson.subjectId)' },
  { line: 2734, old: 'isSchoolOff(dM, pM)', new: 'isSchoolOff(dM, pM, sExisting.subjectId)' },
  { line: 2837, old: '!isSchoolOff(d, targetP)', new: '!isSchoolOff(d, targetP, s.subjectId)' },
  { line: 2845, old: '!isSchoolOff(d, targetP)', new: '!isSchoolOff(d, targetP, sCand.subjectId)' },
  { line: 2862, old: '!isSchoolOff(d, currentP)', new: '!isSchoolOff(d, currentP, otherSlot.subjectId)' },
  { line: 2874, old: 'isSchoolOff(d2, morningLessons)', new: 'isSchoolOff(d2, morningLessons, s.subjectId)' },
  { line: 2881, old: '!isSchoolOff(d2, nextP)', new: '!isSchoolOff(d2, nextP, s.subjectId)' },
  { line: 3087, old: 'isSchoolOff(dTarget, pTarget)', new: 'isSchoolOff(dTarget, pTarget, s.subjectId)' }
];

let lines = code.split('\n');
for (const rep of replacements) {
  const lineIdx = rep.line - 1;
  if (lines[lineIdx] && lines[lineIdx].includes(rep.old)) {
    lines[lineIdx] = lines[lineIdx].replace(rep.old, rep.new);
    console.log(`Patched line ${rep.line}`);
  } else {
    console.log(`Failed to patch line ${rep.line}: Expected '${rep.old}' but got '${lines[lineIdx]}'`);
  }
}

fs.writeFileSync('src/algorithm.ts', lines.join('\n'));
