import { initialClasses, initialSubjects, initialTeachers, initialConfig } from './src/data';
import { generateTimetable, pushUnassignedToAfternoon } from './src/algorithm';

// Setup where Mon afternoon is off, and other days are full in afternoon
const config = {
  ...initialConfig,
  morningLessons: 4,
  afternoonLessons: 1,
  timeOff: [
    { day: 0, session: 'afternoon' },
    { day: 1, session: 'all' }
  ]
};

const fakeUnassigned = Array.from({ length: 15 }, (_, i) => ({
  classId: 'c_6a9',
  subjectId: i % 2 === 0 ? 's_toan' : 's_su',
  teacherId: 'none'
}));

const res = pushUnassignedToAfternoon(
  [],
  fakeUnassigned,
  initialClasses,
  initialSubjects,
  initialTeachers,
  config
);

const monAft = res.newSlots.filter(s => s.day === 0 && s.period >= 4);
console.log('Slots placed on Monday afternoon (should be 0):', monAft.length);

const tueAft = res.newSlots.filter(s => s.day === 1 && s.period >= 4);
console.log('Slots placed on Tuesday afternoon (should be 0):', tueAft.length);

let gaps = 0;
const morningLessons = 4;
for (const cls of initialClasses) {
  for (let d = 0; d < config.days; d++) {
    const aft = res.newSlots.filter(s => s.classId === cls.id && s.day === d && s.period >= morningLessons).map(s => s.period).sort((a,b)=>a-b);
    for (let i = 0; i < aft.length; i++) {
      if (aft[i] !== morningLessons + i) {
        console.log(`Remaining gap in ${cls.name} on day ${d}: ${aft.join(', ')}`);
        gaps++;
      }
    }
  }
}
console.log('Total gaps found:', gaps);

