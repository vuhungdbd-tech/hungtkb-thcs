import fs from 'fs';

let content = fs.readFileSync('src/algorithm.ts', 'utf8');

content = content.replace(
  /(\/\/ Strategy A: Place directly into first available afternoon slot\n\s*for \(const d of afternoonCandidateDays\) \{\n\s*if \(placed\) break;\n\n\s*)for \(let p = aftStart; p < aftEnd && !placed; p\+\+\) \{(\n\s*if \(isSchoolOff\(d, p\) \|\| classSchedule\[cls\.id\]\[d\]\?\.\[p\]\) continue;\n\n\s*const tId = lesson\.teacherId;\n\s*if \(tId && tId !== 'none'\) \{\n\s*if \(isTeacherBusyForClass\(tId, d, p, cls\.id, lesson\.subjectId, true\)\) continue;\n\s*\})/g,
  `$1// Calculate next contiguous period
        let nextP = aftStart;
        while (nextP < aftEnd && classSchedule[cls.id][d]?.[nextP]) {
          nextP++;
        }
        if (nextP >= aftEnd || isSchoolOff(d, nextP)) continue;
        
        const p = nextP;
        
        const tId = lesson.teacherId;
        if (tId && tId !== 'none') {
          if (isTeacherBusyForClass(tId, d, p, cls.id, lesson.subjectId, true)) continue;
        }`
);

content = content.replace(
  /(\/\/ Strategy A: Direct placement into free afternoon slot\n\s*for \(const d of candidateDays\) \{\n\s*if \(placed\) break;\n\s*if \(pass === 1 && classSubjectDays\[cls\.id\]\?\.\[lesson\.subjectId\]\?\.has\(d\) && !sub\?\.allowDouble\) \{\n\s*continue;\n\s*\}\n\n\s*)for \(let p = morningLessons; p < totalPeriods && !placed; p\+\+\) \{(\n\s*if \(classSchedule\[cls\.id\]\?\.\[d\]\?\.\[p\]\) continue;\n\s*if \(tId && tId !== 'none' && isTeacherBusy\(tId, d, p, cls\.id, lesson\.subjectId\)\) continue;)/g,
  `$1// Calculate next contiguous period
        let nextP = morningLessons;
        while (nextP < totalPeriods && classSchedule[cls.id]?.[d]?.[nextP]) {
          nextP++;
        }
        if (nextP >= totalPeriods) continue;
        
        const p = nextP;
        if (tId && tId !== 'none' && isTeacherBusy(tId, d, p, cls.id, lesson.subjectId)) continue;`
);

fs.writeFileSync('src/algorithm.ts', content);
console.log('Fixed algorithm');
