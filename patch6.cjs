const fs = require('fs');
let code = fs.readFileSync('src/algorithm.ts', 'utf8');

const replacement = `
              moveSlot(cand, d, p);
              sweepChanged = true;
              continue;
            }

            // 2. Can ANY slot of this class in the entire week move to (d, p)?
            let weeklySwapDone = false;
            const weeklySlots = slots.filter(s => s.classId === cls.id && !s.isFixed && !s.isExam && (s.day !== d || s.period >= startP + K));
            for (const ws of weeklySlots) {
              const wsSub = subjects.find(s => s.id === ws.subjectId);
              const candSub = subjects.find(s => s.id === cand.subjectId);
              const wsCreatesDup = ws.day !== d && classSubjectDays[cls.id]?.[ws.subjectId]?.has(d) && !wsSub?.allowDouble;
              const candCreatesDup = cand.day !== ws.day && classSubjectDays[cls.id]?.[cand.subjectId]?.has(ws.day) && !candSub?.allowDouble;
              if (wsCreatesDup || candCreatesDup) continue;

              const canWsTakeP = !isSchoolOff(d, p, ws.subjectId) && (ws.teacherId === 'none' || !isTeacherBusyForClass(ws.teacherId, d, p, cls.id, ws.subjectId));
              const canCandTakeWs = !isSchoolOff(ws.day, ws.period, cand.subjectId) && (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, ws.day, ws.period, cls.id, cand.subjectId));
              if (canWsTakeP && canCandTakeWs) {
                moveSlot(cand, ws.day, ws.period);
                moveSlot(ws, d, p);
                weeklySwapDone = true;
                sweepChanged = true;
                break;
              }
            }
            if (weeklySwapDone) continue;

            // 2.5 Pull ANY slot from another day to fill the gap without moving cand
            let pullDone = false;
            if (K + 1 <= sessionSpan) {
              const pullCandidates = slots.filter(s => s.classId === cls.id && !s.isFixed && !s.isExam && s.day !== d);
              for (const ws of pullCandidates) {
                const wsSub = subjects.find(s => s.id === ws.subjectId);
                const wsCreatesDup = classSubjectDays[cls.id]?.[ws.subjectId]?.has(d) && !wsSub?.allowDouble;
                if (wsCreatesDup) continue;
                
                const canWsTakeP = !isSchoolOff(d, p, ws.subjectId) && (ws.teacherId === 'none' || !isTeacherBusyForClass(ws.teacherId, d, p, cls.id, ws.subjectId));
                if (canWsTakeP) {
                  moveSlot(ws, d, p);
                  pullDone = true;
                  sweepChanged = true;
                  break;
                }
              }
            }
            if (pullDone) continue;

            // 3. Move cand to an open contiguous slot on another day
`;

code = code.replace(/moveSlot\(cand, d, p\);\s*continue;\s*\}\s*\/\/ 2\. Can ANY slot of this class in the entire week move to \(d, p\)\?[\s\S]*?if \(weeklySwapDone\) continue;\s*\/\/ 3\. Move cand to an open contiguous slot on another day/, replacement);
fs.writeFileSync('src/algorithm.ts', code);
