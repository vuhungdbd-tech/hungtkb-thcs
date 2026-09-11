import { initialClasses, initialSubjects, initialTeachers, initialConfig } from './src/data';
import { getDailyPeriodsForClass } from './src/algorithm';

const cls = initialClasses[0]; // 6A1
const d = 4; // Friday

const config = {
    ...initialConfig,
    afternoonLessons: 3,
    gradeDailyPeriods: {
        6: [
            { morning: 4, afternoon: 0 },
            { morning: 4, afternoon: 3 },
            { morning: 4, afternoon: 3 },
            { morning: 4, afternoon: 2 },
            { morning: 4, afternoon: 2 }, // Friday 2
            { morning: 4, afternoon: 0 }
        ]
    }
};
console.log(getDailyPeriodsForClass(cls, d, config));
