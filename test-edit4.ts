import { initialClasses, initialSubjects, initialTeachers, initialConfig } from './src/data';
import { generateTimetable, pushUnassignedToAfternoon } from './src/algorithm';

const config = {
  ...initialConfig,
  morningLessons: 4,
  afternoonLessons: 1, 
  timeOff: [
    { day: 0, session: 'afternoon' }
  ]
};

const gen = generateTimetable(initialClasses, initialSubjects, initialTeachers, config);
console.log('Unassigned before push:', gen.unassigned.length);

const res = pushUnassignedToAfternoon(
  gen.slots,
  gen.unassigned,
  initialClasses,
  initialSubjects,
  initialTeachers,
  config
);

console.log('Unassigned after push:', res.remainingUnassigned.length);
const monAft = res.newSlots.filter(s => s.day === 0 && s.period >= 4);
console.log('Monday afternoon slots:', monAft.length);

let gaps = 0;
for (const cls of initialClasses) {
  for (let d = 0; d < config.days; d++) {
    const aft = res.newSlots.filter(s => s.classId === cls.id && s.day === d && s.period >= 4).map(s => s.period).sort((a,b)=>a-b);
    for (let i = 0; i < aft.length; i++) {
      if (aft[i] !== 4 + i) {
        gaps++;
      }
    }
  }
}
console.log('Gaps in afternoon:', gaps);

