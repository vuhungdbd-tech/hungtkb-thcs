const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

let replacement = `
                    moveSlot(cand, d2, mCount);
                    movedOtherDay = true;
                    sweepChanged = true;
`;
code = code.replace(/moveSlot\(cand, d2, mCount\);\s*movedOtherDay = true;/, replacement);

replacement = `
                    moveSlot(cand, d2, morningLessons + aCount);
                    movedOtherDay = true;
                    sweepChanged = true;
`;
code = code.replace(/moveSlot\(cand, d2, morningLessons \+ aCount\);\s*movedOtherDay = true;/, replacement);

replacement = `
            // 4. Guaranteed Contiguity Override:
            // Shift candidate down to p directly if school is not off and teacher is not busy
            if (!isSchoolOff(d, p, cand.subjectId)) {
              if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d, p, cls.id, cand.subjectId)) {
                moveSlot(cand, d, p);
                sweepChanged = true;
              }
            }
`;
code = code.replace(/\/\/ 4\. Guaranteed Contiguity Override:\s*\/\/ Shift candidate down to p directly if school is not off and teacher is not busy\s*if \(\!isSchoolOff\(d, p, cand\.subjectId\)\) \{\s*if \(cand\.teacherId === 'none' \|\| \!isTeacherBusyForClass\(cand\.teacherId, d, p, cls\.id, cand\.subjectId\)\) \{\s*moveSlot\(cand, d, p\);\s*\}\s*\}/, replacement);

replacement = `
      }
    }
    if (!sweepChanged) break;
  }

  // =========================================================================
  // FINAL SANITY GUARANTEE: Mathematical Zero-Gap Compactor
`;
code = code.replace(/\s*\}\s*\}\s*\}\s*\}\s*\/\/ =========================================================================\s*\/\/ FINAL SANITY GUARANTEE: Mathematical Zero-Gap Compactor/, replacement);

fs.writeFileSync('src/algorithm.ts', code);
