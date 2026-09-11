import { initialClasses, initialSubjects, initialTeachers, initialConfig } from './src/data';
import { pushUnassignedToAfternoon } from './src/algorithm';

const config = {
  ...initialConfig,
  morningLessons: 4,
  afternoonLessons: 1, // Only 1 lesson per afternoon allowed initially, but algorithm can expand up to 4
  timeOff: [
    { day: 0, session: 'afternoon' }
  ]
};

const fakeUnassigned = [
  { classId: 'c_6a9', subjectId: 's_su', teacherId: 'none' },
  { classId: 'c_6a9', subjectId: 's_su', teacherId: 'none' },
  { classId: 'c_6a9', subjectId: 's_toan', teacherId: 'none' },
  { classId: 'c_6a9', subjectId: 's_van', teacherId: 'none' },
  { classId: 'c_6a9', subjectId: 's_dia', teacherId: 'none' }
];

const res = pushUnassignedToAfternoon(
  [],
  fakeUnassigned,
  initialClasses,
  initialSubjects,
  initialTeachers,
  config
);

console.log('Placed slots for 6A9:', res.newSlots.filter(s => s.classId === 'c_6a9').map(s => `${s.subjectId} (Day ${s.day} Per ${s.period})`));

