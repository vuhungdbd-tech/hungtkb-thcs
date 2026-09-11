import { Class, Subject, Teacher, Config, TimetableSlot, getAssignmentDefaultLessons, getSubjectDefaultWeekType, DailyPeriodLimit } from './types';

export function getDailyPeriodsForClass(
  cls: Class,
  day: number,
  config: Config
): { morning: number; afternoon: number } {
  const mLimit = Math.max(1, config.morningLessons || 4);
  const aLimit = Math.max(0, config.afternoonLessons || 0);

  if (config.classDailyPeriods && config.classDailyPeriods[cls.id] && config.classDailyPeriods[cls.id][day] !== undefined) {
    const lim = config.classDailyPeriods[cls.id][day];
    return {
      morning: Math.min(mLimit, lim.morning ?? mLimit),
      afternoon: Math.min(aLimit, lim.afternoon ?? aLimit),
    };
  }
  if (config.gradeDailyPeriods && config.gradeDailyPeriods[cls.grade] && config.gradeDailyPeriods[cls.grade][day] !== undefined) {
    const lim = config.gradeDailyPeriods[cls.grade][day];
    return {
      morning: Math.min(mLimit, lim.morning ?? mLimit),
      afternoon: Math.min(aLimit, lim.afternoon ?? aLimit),
    };
  }
  return {
    morning: mLimit,
    afternoon: aLimit,
  };
}

export function isValidTeacher(teacher?: Teacher | null): boolean {
  if (!teacher) return false;
  if (!teacher.id || teacher.id === 'none' || teacher.id === '0') return false;
  const name = (teacher.name || '').trim();
  if (
    !name ||
    name === '0' ||
    name.toLowerCase() === 'none' ||
    name.toLowerCase() === 'trống' ||
    name.toLowerCase() === 'chưa phân công' ||
    name.toLowerCase() === 'chưa có' ||
    name === 'null' ||
    name === 'undefined'
  ) {
    return false;
  }
  return true;
}

export const getIntegratedGroupKey = (s: Subject): string | null => {
  if (s.type === 'integrated') {
    return s.name.includes('(') ? s.name.split('(')[0].trim() : s.name.trim();
  }
  const trimmed = s.name.trim();
  if (
    trimmed.startsWith('KHTN') ||
    trimmed.startsWith('LS&ĐL') ||
    trimmed.startsWith('Lịch sử và Địa lí') ||
    trimmed.startsWith('Khoa học tự nhiên') ||
    trimmed.startsWith('Nghệ thuật')
  ) {
    return trimmed.includes('(') ? trimmed.split('(')[0].trim() : trimmed;
  }
  return null;
};

export interface ClassSubjectPlannedItem {
  sub: Subject;
  effectiveLessons: number;
  assignedTeacherInfos: Array<{
    teacher: Teacher;
    assignment: any;
    allocatedLessons: number;
    subTopic?: string;
    weekType?: 'all' | 'odd' | 'even';
  }>;
}

export function getClassSubjectPlans(
  cls: Class,
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): ClassSubjectPlannedItem[] {
  const currentTerm = config.currentTerm || 'I';
  const currentWeekType = config.currentWeekType || 'all';

  const getSubjectLessons = (subject: Subject, grade: number): number => {
    if (subject.gradeConfigs && subject.gradeConfigs[grade]) {
      const gConf = subject.gradeConfigs[grade];
      if (currentWeekType === 'custom' && gConf.customWeek !== undefined && gConf.customWeek !== null && String(gConf.customWeek).trim() !== '') {
        const val = Number(gConf.customWeek);
        if (!isNaN(val) && val >= 0) return val;
      }
      if (currentWeekType === 'odd' && gConf.oddWeek !== undefined && gConf.oddWeek !== null && String(gConf.oddWeek).trim() !== '') {
        const val = Number(gConf.oddWeek);
        if (!isNaN(val) && val >= 0) return val;
      }
      if (currentWeekType === 'even' && gConf.evenWeek !== undefined && gConf.evenWeek !== null && String(gConf.evenWeek).trim() !== '') {
        const val = Number(gConf.evenWeek);
        if (!isNaN(val) && val >= 0) return val;
      }
      const termConfig = currentTerm === 'I' ? gConf.term1 : gConf.term2;
      if (termConfig !== undefined && termConfig !== null && String(termConfig).trim() !== '') {
        const val = Number(termConfig);
        if (!isNaN(val) && val >= 0) return val;
      }
    }
    return subject.lessonsPerWeek || 0;
  };

  // 1. Gather raw teacher assignments for each subject (filter out invalid teachers like '0', 'none')
  const subTeachersMap = new Map<string, Array<{
    teacher: Teacher;
    assignment: any;
    allocatedLessons: number;
    subTopic?: string;
    weekType?: 'all' | 'odd' | 'even';
  }>>();

  for (const sub of subjects) {
    const stdLessons = getSubjectLessons(sub, cls.grade);
    const rawAssigned: Array<{
      teacher: Teacher;
      assignment: any;
      hasExplicit: boolean;
      alloc: number;
      subTopic?: string;
      weekType?: 'all' | 'odd' | 'even';
    }> = [];

    for (const t of teachers) {
      if (!isValidTeacher(t)) continue;

      for (const a of t.assignments) {
        if (a.subjectId === sub.id && a.classIds.includes(cls.id)) {
          const alloc = a.classLessons?.[cls.id];
          const subTop = a.subTopics?.[cls.id];
          const wType = a.weekTypes?.[cls.id] || getSubjectDefaultWeekType(sub, cls.grade);

          if (currentWeekType === 'odd' && wType === 'even') continue;
          if (currentWeekType === 'even' && wType === 'odd') continue;

          const hasExplicit = alloc !== undefined && alloc !== null && alloc >= 0;
          rawAssigned.push({
            teacher: t,
            assignment: a,
            hasExplicit,
            alloc: hasExplicit ? alloc : 0,
            subTopic: subTop,
            weekType: wType,
          });
        }
      }
    }

    const assigned: Array<{
      teacher: Teacher;
      assignment: any;
      allocatedLessons: number;
      subTopic?: string;
      weekType?: 'all' | 'odd' | 'even';
    }> = [];

    const explicitTeachers = rawAssigned.filter(r => r.hasExplicit);
    const nonExplicitTeachers = rawAssigned.filter(r => !r.hasExplicit);
    const explicitTotal = explicitTeachers.reduce((s, r) => s + r.alloc, 0);

    for (const r of explicitTeachers) {
      assigned.push({
        teacher: r.teacher,
        assignment: r.assignment,
        allocatedLessons: r.alloc,
        subTopic: r.subTopic,
        weekType: r.weekType,
      });
    }

    if (nonExplicitTeachers.length > 0) {
      const remainingQuota = Math.max(0, stdLessons - explicitTotal);
      if (nonExplicitTeachers.length === 1) {
        assigned.push({
          teacher: nonExplicitTeachers[0].teacher,
          assignment: nonExplicitTeachers[0].assignment,
          allocatedLessons: remainingQuota,
          subTopic: nonExplicitTeachers[0].subTopic,
          weekType: nonExplicitTeachers[0].weekType,
        });
      } else {
        const base = Math.floor(remainingQuota / nonExplicitTeachers.length);
        const rem = remainingQuota % nonExplicitTeachers.length;
        nonExplicitTeachers.forEach((r, idx) => {
          assigned.push({
            teacher: r.teacher,
            assignment: r.assignment,
            allocatedLessons: base + (idx < rem ? 1 : 0),
            subTopic: r.subTopic,
            weekType: r.weekType,
          });
        });
      }
    }

    subTeachersMap.set(sub.id, assigned);
  }

  // 2. Group statistics for integrated subjects (e.g. KHTN: Lý, Hóa, Sinh; LS&ĐL: Sử, Địa)
  const groupStats = new Map<string, {
    quota: number;
    assignedTotal: number;
    explicitTotal: number;
    hasExplicit: boolean;
    remainingDeficit: number;
  }>();
  const groupSubsMap = new Map<string, Subject[]>();

  for (const sub of subjects) {
    const gKey = getIntegratedGroupKey(sub);
    if (gKey) {
      if (!groupSubsMap.has(gKey)) groupSubsMap.set(gKey, []);
      groupSubsMap.get(gKey)!.push(sub);
    }
  }

  groupSubsMap.forEach((subsInGroup, gKey) => {
    let quota = 0;
    let assignedTotal = 0;
    let explicitTotal = 0;
    let hasExplicit = false;

    subsInGroup.forEach(s => {
      quota += getSubjectLessons(s, cls.grade);
      const tList = subTeachersMap.get(s.id) || [];
      tList.forEach(tInfo => {
        assignedTotal += Math.max(0, tInfo.allocatedLessons);
        const alloc = tInfo.assignment?.classLessons?.[cls.id];
        if (alloc !== undefined && alloc !== null && alloc >= 0) {
          explicitTotal += alloc;
          hasExplicit = true;
        }
      });
    });

    const remainingDeficit = Math.max(0, quota - (hasExplicit ? explicitTotal : assignedTotal));
    groupStats.set(gKey, { quota, assignedTotal, explicitTotal, hasExplicit, remainingDeficit });
  });

  // 3. Compute effective lessons and plan item for each subject
  const plan: ClassSubjectPlannedItem[] = [];

  for (const sub of subjects) {
    const stdLessons = getSubjectLessons(sub, cls.grade);
    const assigned = subTeachersMap.get(sub.id) || [];
    const gKey = getIntegratedGroupKey(sub);

    const hasWeekSpecificConfig = Boolean(
      sub.gradeConfigs?.[cls.grade] && (
        (currentWeekType === 'custom' && sub.gradeConfigs[cls.grade].customWeek !== undefined && sub.gradeConfigs[cls.grade].customWeek !== null && String(sub.gradeConfigs[cls.grade].customWeek).trim() !== '') ||
        (currentWeekType === 'odd' && sub.gradeConfigs[cls.grade].oddWeek !== undefined && sub.gradeConfigs[cls.grade].oddWeek !== null && String(sub.gradeConfigs[cls.grade].oddWeek).trim() !== '') ||
        (currentWeekType === 'even' && sub.gradeConfigs[cls.grade].evenWeek !== undefined && sub.gradeConfigs[cls.grade].evenWeek !== null && String(sub.gradeConfigs[cls.grade].evenWeek).trim() !== '')
      )
    );

    let effectiveLessons = stdLessons;

    // When week type is specific (custom/odd/even) or subject has specific config, stdLessons is strictly authoritative
    if (hasWeekSpecificConfig || currentWeekType !== 'all') {
      if (assigned.length === 0) {
        effectiveLessons = 0;
      } else if (stdLessons === 0) {
        effectiveLessons = 0;
        assigned.forEach(info => { info.allocatedLessons = 0; });
      } else {
        effectiveLessons = stdLessons;
        const currentSum = assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0);
        if (currentSum === effectiveLessons) {
          // Perfectly matched
        } else if (currentSum > 0) {
          let rem = effectiveLessons;
          for (let i = 0; i < assigned.length; i++) {
            const isLast = (i === assigned.length - 1);
            const share = isLast ? rem : Math.round((assigned[i].allocatedLessons / currentSum) * effectiveLessons);
            const allocVal = Math.min(rem, Math.max(0, share));
            assigned[i].allocatedLessons = allocVal;
            rem -= allocVal;
          }
        } else {
          const base = Math.floor(effectiveLessons / assigned.length);
          let rem = effectiveLessons % assigned.length;
          assigned.forEach((info, idx) => {
            info.allocatedLessons = base + (idx < rem ? 1 : 0);
          });
        }
      }
    } else if (gKey && groupStats.has(gKey)) {
      const gStat = groupStats.get(gKey)!;
      if (assigned.length > 0) {
        const allExplicitZero = assigned.every(info => info.allocatedLessons === 0);
        if (allExplicitZero) {
          effectiveLessons = 0;
        } else {
          // Check if this specific sub-subject has explicit allocated lessons (e.g. alloc >= 0)
          const subHasExplicit = assigned.some(info => {
            const alloc = info.assignment?.classLessons?.[cls.id];
            return alloc !== undefined && alloc !== null && alloc >= 0;
          });

          if (subHasExplicit) {
            effectiveLessons = assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0);
          } else {
            // No explicit allocation for this sub-subject:
            // If the entire group quota is already filled by other sub-subjects that have explicit lessons (e.g. Hóa 3 + Sinh 1 = 4 >= 4)
            // then Lý intentionally has 0 lessons this week!
            if (gStat.hasExplicit && gStat.explicitTotal >= gStat.quota) {
              effectiveLessons = 0;
            } else if (gStat.hasExplicit) {
              effectiveLessons = Math.min(stdLessons, gStat.remainingDeficit);
              gStat.remainingDeficit = Math.max(0, gStat.remainingDeficit - effectiveLessons);
            } else {
              effectiveLessons = Math.min(stdLessons, assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0));
            }
          }
        }
      } else {
        // No teacher assigned for this specific sub-subject
        effectiveLessons = 0;
      }
    } else {
      // Non-integrated subject in normal week ('all')
      if (assigned.length === 0) {
        effectiveLessons = 0;
      } else {
        const allExplicitZero = assigned.every(info => info.allocatedLessons === 0);
        if (allExplicitZero) {
          effectiveLessons = 0;
        } else {
          let explicitSum = 0;
          let hasExplicit = false;
          assigned.forEach(info => {
            const alloc = info.assignment?.classLessons?.[cls.id];
            if (alloc !== undefined && alloc !== null && alloc >= 0) {
              explicitSum += alloc;
              hasExplicit = true;
            }
          });
          if (hasExplicit) {
            effectiveLessons = explicitSum;
          } else {
            effectiveLessons = Math.min(stdLessons, assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0));
          }
        }
      }
    }

    plan.push({
      sub,
      effectiveLessons,
      assignedTeacherInfos: assigned,
    });
  }

  return plan;
}

export function calculateClassRequiredLessons(
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): Record<string, number> {
  const req: Record<string, number> = {};

  for (const cls of classes) {
    const plans = getClassSubjectPlans(cls, subjects, teachers, config);
    let total = 0;

    for (const item of plans) {
      if (item.effectiveLessons <= 0) continue;

      if (item.assignedTeacherInfos.length === 0) {
        total += item.effectiveLessons;
      } else {
        let totalExplicit = 0;
        let unassignedTeachersCount = 0;
        item.assignedTeacherInfos.forEach(info => {
          if (info.allocatedLessons >= 0) totalExplicit += info.allocatedLessons;
          else unassignedTeachersCount++;
        });

        let defaultPerTeacher = 0;
        if (unassignedTeachersCount > 0) {
          const remainingLessons = Math.max(0, item.effectiveLessons - totalExplicit);
          defaultPerTeacher = Math.floor(remainingLessons / unassignedTeachersCount);
        }

        const counts = item.assignedTeacherInfos.map(info => info.allocatedLessons >= 0 ? info.allocatedLessons : defaultPerTeacher);
        total += counts.reduce((a, b) => a + b, 0);
      }
    }
    req[cls.id] = total;
  }
  return req;
}

export interface AutoOptimizeResult {
  newConfig: Config;
  classRequiredLessons: Record<string, number>;
  adjustedSummary: {
    classId: string;
    className: string;
    grade: number;
    required: number;
    oldCapacity: number;
    newCapacity: number;
  }[];
}

export function autoOptimizeClassDailyPeriods(
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): AutoOptimizeResult {
  const req = calculateClassRequiredLessons(classes, subjects, teachers, config);
  const numDays = config.days || 6;
  const daysList = Array.from({ length: numDays }, (_, i) => i);

  const isSchoolOff = (day: number, session: 'morning' | 'afternoon'): boolean => {
    if (!config.timeOff) return false;
    return config.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
  };

  const newClassDailyPeriods: Record<string, DailyPeriodLimit[]> = { ...(config.classDailyPeriods || {}) };
  const newGradeDailyPeriods: Record<number, DailyPeriodLimit[]> = { ...(config.gradeDailyPeriods || {}) };

  let maxMorningFound = Math.max(1, config.morningLessons || 4);
  let maxAfternoonFound = Math.max(0, config.afternoonLessons || 3);

  const adjustedSummary: AutoOptimizeResult['adjustedSummary'] = [];

  const grades = Array.from(new Set(classes.map(c => c.grade))).sort();

  for (const grade of grades) {
    const gradeClasses = classes.filter(c => c.grade === grade);
    if (gradeClasses.length === 0) continue;

    const reqs = gradeClasses.map(c => req[c.id] || 0);
    const maxReq = Math.max(...reqs, 0);

    const calculateSchedule = (targetLessons: number): DailyPeriodLimit[] => {
      const openMorningDays = daysList.filter(d => !isSchoolOff(d, 'morning'));
      const openAfternoonDays = daysList.filter(d => !isSchoolOff(d, 'afternoon') && d !== 5);

      const schedule: DailyPeriodLimit[] = daysList.map(() => ({ morning: 0, afternoon: 0 }));
      if (targetLessons <= 0) return schedule;

      // Check if Saturday morning is open
      const hasSaturdayMorning = openMorningDays.includes(5);
      const weekdayMornings = openMorningDays.filter(d => d !== 5);

      const morningCap = Math.max(1, config.morningLessons || 4);
      const satMorningCap = Math.min(morningCap, 4);

      // Total morning capacity based on configured morning lessons
      const totalMorningCapacity = weekdayMornings.length * morningCap + (hasSaturdayMorning ? satMorningCap : 0);

      // Strategy 1: If can fit entirely in mornings:
      if (targetLessons <= totalMorningCapacity) {
        let rem = targetLessons;
        for (const d of openMorningDays) {
          const cap = (d === 5) ? satMorningCap : morningCap;
          const alloc = Math.min(cap, rem);
          schedule[d].morning = alloc;
          rem -= alloc;
          if (rem <= 0) break;
        }
        return schedule;
      }

      // Strategy 2: Target lessons > morning capacity (e.g. 26 to 32 lessons)
      // Fill ALL open mornings to the configured limit (e.g. 4 periods for all grades)
      let morningTotal = 0;
      for (const d of weekdayMornings) {
        schedule[d].morning = morningCap;
        morningTotal += morningCap;
      }
      if (hasSaturdayMorning) {
        schedule[5].morning = satMorningCap;
        morningTotal += satMorningCap;
      }

      // Remaining lessons are pushed to afternoons
      let remainingAfternoon = targetLessons - morningTotal;

      // Preferred afternoons: T3 (1), T4 (2), T5 (3), T6 (4), T2 (0)
      const preferredAfternoonOrder = [1, 2, 3, 4, 0].filter(d => openAfternoonDays.includes(d));

      if (preferredAfternoonOrder.length > 0 && remainingAfternoon > 0) {
        const afternoonCap = Math.max(1, config.afternoonLessons || 3);
        const baseAft = Math.floor(remainingAfternoon / preferredAfternoonOrder.length);
        let remAft = remainingAfternoon % preferredAfternoonOrder.length;

        for (let idx = 0; idx < preferredAfternoonOrder.length; idx++) {
          const d = preferredAfternoonOrder[idx];
          const ideal = baseAft + (idx < remAft ? 1 : 0);
          const alloc = Math.min(afternoonCap, ideal);
          schedule[d].afternoon = alloc;
          remainingAfternoon -= alloc;
        }

        // Spillover if any remaining lessons exceed afternoonCap
        if (remainingAfternoon > 0) {
          for (const d of preferredAfternoonOrder) {
            if (remainingAfternoon <= 0) break;
            const afternoonMax = Math.max(1, config.afternoonLessons || 4);
            if (schedule[d].afternoon < afternoonMax) {
              const add = Math.min(afternoonMax - schedule[d].afternoon, remainingAfternoon);
              schedule[d].afternoon += add;
              remainingAfternoon -= add;
            }
          }
        }
      }

      return schedule;
    };

    const gradeSchedule = calculateSchedule(maxReq);
    newGradeDailyPeriods[grade] = gradeSchedule;

    for (const cls of gradeClasses) {
      const clsReq = req[cls.id] || 0;
      let oldCap = 0;
      for (let d = 0; d < numDays; d++) {
        const lim = getDailyPeriodsForClass(cls, d, config);
        if (!isSchoolOff(d, 'morning')) oldCap += lim.morning;
        if (!isSchoolOff(d, 'afternoon')) oldCap += lim.afternoon;
      }

      let clsSchedule: DailyPeriodLimit[];
      if (clsReq === maxReq) {
        clsSchedule = gradeSchedule;
        delete newClassDailyPeriods[cls.id];
      } else {
        clsSchedule = calculateSchedule(clsReq);
        newClassDailyPeriods[cls.id] = clsSchedule;
      }

      let newCap = 0;
      for (let d = 0; d < numDays; d++) {
        newCap += clsSchedule[d].morning + clsSchedule[d].afternoon;
        if (clsSchedule[d].morning > maxMorningFound) maxMorningFound = clsSchedule[d].morning;
        if (clsSchedule[d].afternoon > maxAfternoonFound) maxAfternoonFound = clsSchedule[d].afternoon;
      }

      if (oldCap !== newCap || oldCap < clsReq) {
        adjustedSummary.push({
          classId: cls.id,
          className: cls.name,
          grade: cls.grade,
          required: clsReq,
          oldCapacity: oldCap,
          newCapacity: newCap,
        });
      }
    }
  }

  const newConfig: Config = {
    ...config,
    classDailyPeriods: newClassDailyPeriods,
    gradeDailyPeriods: newGradeDailyPeriods,
    morningLessons: maxMorningFound,
    afternoonLessons: maxAfternoonFound,
  };

  return {
    newConfig,
    classRequiredLessons: req,
    adjustedSummary,
  };
}

export interface LessonToSchedule {
  classId: string;
  subjectId: string;
  teacherId: string;
  type: string;
  isDouble: boolean;
  session: string;
  isExam?: boolean;
  subTopic?: string;
  reason?: string;
}

export function generateTimetable(
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): { slots: TimetableSlot[], unassigned: LessonToSchedule[], autoAdjustedConfig?: Config } {
  // 0. Auto-check and optimize class daily periods if capacity is mismatched
  const classReq = calculateClassRequiredLessons(classes, subjects, teachers, config);
  const numDays = config.days || 6;
  let hasCapacityDeficit = false;

  for (const cls of classes) {
    const required = classReq[cls.id] || 0;
    let cap = 0;
    let morningCap = 0;
    let totalMorningOpenDays = 0;
    for (let d = 0; d < numDays; d++) {
      const isMOff = config.timeOff?.some(off => off.day === d && (off.session === 'all' || off.session === 'morning'));
      const isAOff = config.timeOff?.some(off => off.day === d && (off.session === 'all' || off.session === 'afternoon'));
      const lim = getDailyPeriodsForClass(cls, d, config);
      if (!isMOff) {
        cap += lim.morning;
        morningCap += lim.morning;
        totalMorningOpenDays++;
      }
      if (!isAOff) cap += lim.afternoon;
    }
    const maxMorningPossible = totalMorningOpenDays * Math.max(1, config.morningLessons || 4);
    if (cap < required || (required > morningCap && morningCap < maxMorningPossible)) {
      hasCapacityDeficit = true;
      break;
    }
  }

  let effectiveConfig = config;
  let autoAdjustedConfig: Config | undefined = undefined;

  if (hasCapacityDeficit) {
    const opt = autoOptimizeClassDailyPeriods(classes, subjects, teachers, config);
    effectiveConfig = opt.newConfig;
    autoAdjustedConfig = opt.newConfig;
  }

  config = effectiveConfig;

  let slots: TimetableSlot[] = [];
  const unassigned: LessonToSchedule[] = [];
  const totalPeriods = config.morningLessons + config.afternoonLessons;

  // Helper to get exam subjects for a grade based on config
  const getExamSubjectsForGrade = (grade: number): Subject[] => {
    const gradeExamConfig = (config.exams || []).find(e => e.grade === grade);
    const examTerm = config.currentExamTerm || 'none';
    if (examTerm === 'none' || !gradeExamConfig) return [];
    
    const subjectsKey = `${examTerm}Subjects` as keyof typeof gradeExamConfig;
    const selectedIds = gradeExamConfig[subjectsKey] as string[] | undefined;

    if (selectedIds && selectedIds.length > 0) {
      return subjects.filter(s => selectedIds.includes(s.id));
    }

    const examCount = (gradeExamConfig[examTerm as keyof typeof gradeExamConfig] as number) || 0;
    if (examCount <= 0) return [];

    const availableExamSubjects = subjects
      .filter(s => s.hasExam)
      .sort((a, b) => {
        const typeOrder = { main: 0, integrated: 1, sub: 2 };
        if (a.type !== b.type) {
          return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
        }
        return a.name.localeCompare(b.name);
      });

    let currentExamPeriods = 0;
    const examSubjects: Subject[] = [];
    for (const s of availableExamSubjects) {
      const duration = s.examDuration || 1;
      if (currentExamPeriods + duration <= examCount) {
        examSubjects.push(s);
        currentExamPeriods += duration;
      }
    }
    return examSubjects;
  };

  // 1. Generate all required lessons
  let lessons: LessonToSchedule[] = [];
  
  for (const cls of classes) {
    const examSubjects = getExamSubjectsForGrade(cls.grade);
    const plans = getClassSubjectPlans(cls, subjects, teachers, config);
    
    for (const planItem of plans) {
      const sub = planItem.sub;
      const clsLessonsPerWeek = planItem.effectiveLessons;
      
      if (clsLessonsPerWeek <= 0) continue;

      const assignedTeacherInfos = planItem.assignedTeacherInfos;

      if (assignedTeacherInfos.length === 0) {
        for (let i = 0; i < clsLessonsPerWeek; i++) {
          unassigned.push({
            classId: cls.id,
            subjectId: sub.id,
            teacherId: 'none',
            type: sub.type,
            isDouble: false,
            session: sub.session,
            reason: 'Chưa phân công giáo viên'
          });
        }
        continue;
      }

      // Calculate lesson count for each assigned teacher
      let totalExplicit = 0;
      let unassignedTeachersCount = 0;

      assignedTeacherInfos.forEach(info => {
        if (info.allocatedLessons >= 0) {
          totalExplicit += info.allocatedLessons;
        } else {
          unassignedTeachersCount++;
        }
      });

      if (unassignedTeachersCount === 0 && totalExplicit === 0) {
        continue;
      }

      let defaultPerTeacher = 0;
      if (unassignedTeachersCount > 0) {
        const remainingLessons = Math.max(0, clsLessonsPerWeek - totalExplicit);
        defaultPerTeacher = Math.floor(remainingLessons / unassignedTeachersCount);
      }

      const finalTeacherList = assignedTeacherInfos.map(info => {
        const count = info.allocatedLessons >= 0 ? info.allocatedLessons : defaultPerTeacher;
        return { ...info, count };
      }).filter(item => item.count > 0);

      if (finalTeacherList.length === 0) {
        for (let i = 0; i < clsLessonsPerWeek; i++) {
          unassigned.push({
            classId: cls.id,
            subjectId: sub.id,
            teacherId: 'none',
            type: sub.type,
            isDouble: false,
            session: sub.session,
            reason: 'Chưa đủ định mức tiết phân công'
          });
        }
        continue;
      }

      let isFirstLessonForSubject = true;
      const isSubjectExam = examSubjects.some(es => es.id === sub.id);

      for (const tInfo of finalTeacherList) {
        let remaining = tInfo.count;
        const teacherId = tInfo.teacher.id;
        const subTopic = tInfo.subTopic;

        while (remaining > 0) {
          let isExam = false;
          let isExamDouble = false;
          if (isSubjectExam && isFirstLessonForSubject) {
            isExam = true;
            isFirstLessonForSubject = false;
            if ((sub.examDuration || 1) === 2 && remaining >= 2) {
              isExamDouble = true;
            }
          }

          if (isExamDouble) {
            lessons.push({ classId: cls.id, subjectId: sub.id, teacherId, type: sub.type, isDouble: true, session: sub.session, isExam: true, subTopic });
            remaining -= 2;
          } else if (sub.allowDouble && remaining >= 2 && !isExam) {
            lessons.push({ classId: cls.id, subjectId: sub.id, teacherId, type: sub.type, isDouble: true, session: sub.session, isExam: false, subTopic });
            remaining -= 2;
          } else {
            lessons.push({ classId: cls.id, subjectId: sub.id, teacherId, type: sub.type, isDouble: false, session: sub.session, isExam, subTopic });
            remaining -= 1;
          }
        }
      }
    }
  }

  // 2. Count teacher loads
  const teacherLoad: Record<string, number> = {};
  for (const l of lessons) {
    if (l.teacherId && l.teacherId !== 'none') {
      teacherLoad[l.teacherId] = (teacherLoad[l.teacherId] || 0) + (l.isDouble ? 2 : 1);
    }
  }

  // Sort lessons: Exams first, then heavy teachers, then double lessons, then type
  lessons.sort((a, b) => {
    if (a.isExam && !b.isExam) return -1;
    if (!a.isExam && b.isExam) return 1;

    const loadA = teacherLoad[a.teacherId] || 0;
    const loadB = teacherLoad[b.teacherId] || 0;
    
    // Extremely busy teachers (>= 20 lessons) MUST be scheduled first to avoid conflicts
    if (loadA >= 20 || loadB >= 20) {
      if (loadA !== loadB) return loadB - loadA;
    }

    // Sort by teacher load first. Only group by type if load difference is small
    if (Math.abs(loadB - loadA) > 2) {
       return loadB - loadA;
    }

    const typeOrder = { main: 0, integrated: 1, sub: 2 };
    if (typeOrder[a.type as keyof typeof typeOrder] !== typeOrder[b.type as keyof typeof typeOrder]) {
      return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
    }
    
    if (loadA !== loadB) return loadB - loadA;

    if (a.isDouble && !b.isDouble) return -1;
    if (!a.isDouble && b.isDouble) return 1;
    return 0;
  });

  // State maps
  const classSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const teacherSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const classSubjectDays: Record<string, Record<string, Set<number>>> = {};
  const teacherDailyCount: Record<string, Record<number, number>> = {};
  const gradeSubjectExamSlot: Record<number, Record<string, { day: number, period: number }>> = {};

  for (const cls of classes) {
    classSchedule[cls.id] = {};
    classSubjectDays[cls.id] = {};
    for (let d = 0; d < config.days; d++) classSchedule[cls.id][d] = {};
    for (const sub of subjects) classSubjectDays[cls.id][sub.id] = new Set();
  }
  for (const t of teachers) {
    teacherSchedule[t.id] = {};
    teacherDailyCount[t.id] = {};
    for (let d = 0; d < config.days; d++) {
      teacherSchedule[t.id][d] = {};
      teacherDailyCount[t.id][d] = 0;
    }
  }

  const teacherSubjects: Record<string, Set<string>> = {};
  for (const t of teachers) {
    teacherSubjects[t.id] = new Set(t.assignments.map(a => a.subjectId));
  }

  const isSchoolOff = (day: number, period: number, subjectId?: string): boolean => {
    if (subjectId) {
      const sub = subjects.find(s => s.id === subjectId);
      if (sub?.bannedPeriods?.includes(period) && !config.relaxConstraints) return true;
    }
    if (!config.timeOff) return false;
    const session = period < config.morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
  };

  const isPeriodBanned = (subjectId: string, period: number): boolean => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub || !sub.bannedPeriods || config.relaxConstraints) return false;
    return sub.bannedPeriods.includes(period);
  };

  const isTeacherOff = (teacherId: string, day: number, period: number): boolean => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.timeOff) return false;
    const session = period < config.morningLessons ? 'morning' : 'afternoon';
    return teacher.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
  };

  const isTeacherOccupiedAtAll = (teacherId: string, day: number, period: number): boolean => {
    if (teacherId === 'none') return false;
    return slots.some(s => s.teacherId === teacherId && s.day === day && s.period === period);
  };

  const isTeacherBusyForClass = (
    teacherId: string,
    day: number,
    period: number,
    classId: string,
    subjectId: string,
    relaxConstraints: boolean = false
  ): boolean => {
    if (teacherId === 'none') return false;
    if (isTeacherOff(teacherId, day, period)) return true;

    const activeSlots = slots.filter(s => s.teacherId === teacherId && s.day === day && s.period === period && s.classId !== classId);
    if (activeSlots.length === 0) return false;

    const cls = classes.find(c => c.id === classId);
    if (!cls) return true;

    const sub = subjects.find(s => s.id === subjectId);
    const allowGradeOverlap = sub?.allowGradeOverlap !== false;

    if (!allowGradeOverlap) {
      return true;
    }

    const hasConflict = activeSlots.some(s => {
      const otherCls = classes.find(c => c.id === s.classId);
      // HĐTN school-wide assembly (Chào cờ) allows multi-class/grade overlap
      if (subjectId === 's_hdtn' && s.subjectId === 's_hdtn') {
        return false;
      }
      // Hard rules: A teacher can NEVER teach different grades or different subjects simultaneously
      return !otherCls || otherCls.grade !== cls.grade || s.subjectId !== subjectId;
    });

    if (hasConflict) return true;

    const maxOverlap = sub?.maxOverlapClasses;
    if (maxOverlap && maxOverlap > 0 && !relaxConstraints) {
      if (activeSlots.length >= maxOverlap) {
        return true;
      }
    }

    return false;
  };

  const findExamTeacher = (lesson: LessonToSchedule, day: number, period: number, excludeTeacherId?: string): string | null => {
    const sub = subjects.find(s => s.id === lesson.subjectId);
    if (!sub || !lesson.isExam) return lesson.teacherId;

    const isTeacherQualified = (teacherId: string) => {
      const teacher = teachers.find(t => t.id === teacherId);
      if (!teacher) return false;
      const isTeachingSubject = teacherSubjects[teacherId].has(lesson.subjectId);
      if (isTeachingSubject) return false;

      if (teacher.specialization && sub.name) {
        const spec = teacher.specialization.toLowerCase();
        const subName = sub.name.toLowerCase();
        if (spec.includes(subName) || subName.includes(spec)) return false;
      }
      return true;
    };

    for (const t of teachers) {
      if (t.id === excludeTeacherId) continue;
      if (!isTeacherQualified(t.id)) continue;
      if (isTeacherOff(t.id, day, period)) continue;
      if (isTeacherOccupiedAtAll(t.id, day, period)) continue;
      if (teacherDailyCount[t.id][day] + 1 > t.maxLessonsPerSession) continue;
      return t.id;
    }
    return null;
  };

  const checkSlotValidity = (
    lesson: LessonToSchedule, 
    day: number, 
    period: number, 
    relaxConstraints: boolean = false
  ): { valid: boolean, reason?: string } => {
    const cls = classes.find(c => c.id === lesson.classId);
    const sub = subjects.find(s => s.id === lesson.subjectId);

    // Subject-specific banned periods check (Tránh tiết cấu hình môn học)
    if (sub && sub.bannedPeriods && sub.bannedPeriods.length > 0 && !relaxConstraints) {
      if (sub.bannedPeriods.includes(period)) {
        return { valid: false, reason: 'Tránh tiết cấu hình môn học' };
      }
      if (lesson.isDouble && sub.bannedPeriods.includes(period + 1)) {
        return { valid: false, reason: 'Tránh tiết cấu hình môn học (Tiết đôi)' };
      }
    }
    
    // Exam sync
    if (lesson.isExam && cls) {
      const gradeSlot = gradeSubjectExamSlot[cls.grade]?.[lesson.subjectId];
      if (gradeSlot) {
        if (gradeSlot.day !== day || gradeSlot.period !== period) return { valid: false, reason: 'Lịch thi đồng bộ khối' };
      } else {
        const gradeExamConfig = (config.exams || []).find(e => e.grade === cls.grade);
        if (gradeExamConfig && gradeExamConfig.preferredDay !== undefined) {
          if (day !== gradeExamConfig.preferredDay) return { valid: false, reason: 'Ngày thi ưu tiên' };
          const gradeExamSubjects = getExamSubjectsForGrade(cls.grade);
          const isFirstExamSubject = gradeExamSubjects[0]?.id === lesson.subjectId;
          if (isFirstExamSubject && gradeExamConfig.preferredPeriod !== undefined && period !== gradeExamConfig.preferredPeriod) {
            return { valid: false, reason: 'Tiết thi ưu tiên' };
          }
        }
      }
    }

    // Session check
    if (lesson.session === 'morning' && period >= config.morningLessons) return { valid: false, reason: 'Sai buổi học' };
    if (lesson.session === 'afternoon' && period < config.morningLessons) return { valid: false, reason: 'Sai buổi học' };

    // Daily periods limit check for class
    if (cls) {
      const limits = getDailyPeriodsForClass(cls, day, config);
      const isMorning = period < config.morningLessons;
      if (isMorning) {
        const morningCap = relaxConstraints ? config.morningLessons : limits.morning;
        if (morningCap > 0 && period >= morningCap) return { valid: false, reason: 'Vượt quá số tiết sáng cấu hình cho lớp' };
        if (lesson.isDouble && morningCap > 0 && period + 1 >= morningCap) return { valid: false, reason: 'Tiết đôi vượt giới hạn tiết sáng' };
      } else {
        const afternoonP = period - config.morningLessons;
        const afternoonCap = relaxConstraints ? Math.min(config.afternoonLessons, Math.max(limits.afternoon, 3)) : limits.afternoon;
        if (afternoonP >= afternoonCap) return { valid: false, reason: 'Vượt quá số tiết chiều cấu hình cho lớp' };
        if (lesson.isDouble && afternoonP + 1 >= afternoonCap) return { valid: false, reason: 'Tiết đôi vượt giới hạn tiết chiều' };
      }
    }

    // School off
    if (isSchoolOff(day, period)) return { valid: false, reason: 'Trường nghỉ' };
    if (lesson.isDouble && isSchoolOff(day, period + 1)) return { valid: false, reason: 'Trường nghỉ (Tiết đôi)' };

    // Class occupied?
    if (classSchedule[lesson.classId][day][period]) return { valid: false, reason: 'Lớp bận' };
    if (lesson.isDouble && (period + 1 >= totalPeriods || classSchedule[lesson.classId][day][period + 1])) {
      return { valid: false, reason: 'Không đủ tiết đôi cho lớp' };
    }

    // Teacher occupied?
    if (lesson.isExam) {
      if (lesson.isDouble) {
        const t1 = findExamTeacher(lesson, day, period);
        if (!t1) return { valid: false, reason: 'Thiếu giám thị (Tiết 1)' };
        const t2 = findExamTeacher(lesson, day, period + 1, t1);
        if (!t2) return { valid: false, reason: 'Thiếu giám thị (Tiết 2)' };
      } else {
        const primary = findExamTeacher(lesson, day, period);
        if (!primary) return { valid: false, reason: 'Thiếu giám thị' };
      }
    } else {
      if (isTeacherOff(lesson.teacherId, day, period)) return { valid: false, reason: 'Giáo viên xin nghỉ' };
      if (lesson.isDouble && isTeacherOff(lesson.teacherId, day, period + 1)) return { valid: false, reason: 'Giáo viên xin nghỉ (Tiết đôi)' };

      if (lesson.teacherId !== 'none') {
        if (isTeacherBusyForClass(lesson.teacherId, day, period, lesson.classId, lesson.subjectId, relaxConstraints)) {
          return { valid: false, reason: 'Giáo viên bận ở lớp khác' };
        }
        if (lesson.isDouble && isTeacherBusyForClass(lesson.teacherId, day, period + 1, lesson.classId, lesson.subjectId, relaxConstraints)) {
          return { valid: false, reason: 'Giáo viên bận ở lớp khác (Tiết đôi)' };
        }
      }

      const teacher = teachers.find(t => t.id === lesson.teacherId);
      if (teacher) {
        let newPeriodsAdded = 0;
        if (!isTeacherOccupiedAtAll(lesson.teacherId, day, period)) {
          newPeriodsAdded += 1;
        }
        if (lesson.isDouble && !isTeacherOccupiedAtAll(lesson.teacherId, day, period + 1)) {
          newPeriodsAdded += 1;
        }
        
        if ((teacherDailyCount[lesson.teacherId][day] || 0) + newPeriodsAdded > teacher.maxLessonsPerSession) {
          if (!relaxConstraints) return { valid: false, reason: 'Vượt định mức tiết/buổi của giáo viên' };
        }
      }
    }

    // Subject daily limit check
    if (classSubjectDays[lesson.classId][lesson.subjectId].has(day)) {
      if (!sub?.allowDouble) {
        return { valid: false, reason: 'Môn học đã có trong ngày' };
      }
      if (!relaxConstraints) return { valid: false, reason: 'Môn học đã có trong ngày' };
    }

    // Subject grade overlap restriction (if allowGradeOverlap === false)
    const allowGradeOverlap = sub?.allowGradeOverlap !== false; // Default true unless explicitly false

    if (!allowGradeOverlap && cls) {
      const isSameGradeOverlap = classes.some(otherCls => 
        otherCls.grade === cls.grade &&
        otherCls.id !== cls.id &&
        classSchedule[otherCls.id]?.[day]?.[period] === lesson.subjectId
      );
      if (isSameGradeOverlap && !relaxConstraints) {
        return { valid: false, reason: 'Không cho phép trùng tiết môn trong cùng khối' };
      }
    }

    return { valid: true };
  };

  const placeLesson = (lesson: LessonToSchedule, day: number, period: number) => {
    const cls = classes.find(c => c.id === lesson.classId);
    if (lesson.isExam && cls) {
      if (!gradeSubjectExamSlot[cls.grade]) gradeSubjectExamSlot[cls.grade] = {};
      if (!gradeSubjectExamSlot[cls.grade][lesson.subjectId]) {
        gradeSubjectExamSlot[cls.grade][lesson.subjectId] = { day, period };
      }
    }

    if (lesson.isExam && lesson.isDouble) {
      const t1 = findExamTeacher(lesson, day, period);
      const t2 = findExamTeacher(lesson, day, period + 1, t1);
      
      if (t1 && t2) {
        classSchedule[lesson.classId][day][period] = lesson.subjectId;
        teacherSchedule[t1][day][period] = lesson.classId;
        teacherDailyCount[t1][day]++;
        slots.push({ classId: lesson.classId, day, period, subjectId: lesson.subjectId, teacherId: t1, isExam: true });

        classSchedule[lesson.classId][day][period + 1] = lesson.subjectId;
        teacherSchedule[t2][day][period + 1] = lesson.classId;
        teacherDailyCount[t2][day]++;
        slots.push({ classId: lesson.classId, day, period: period + 1, subjectId: lesson.subjectId, teacherId: t2, isExam: true });
        
        classSubjectDays[lesson.classId][lesson.subjectId].add(day);
      }
    } else {
      const primaryTeacherId = findExamTeacher(lesson, day, period) || lesson.teacherId;

      classSchedule[lesson.classId][day][period] = lesson.subjectId;
      if (primaryTeacherId && primaryTeacherId !== 'none' && teacherSchedule[primaryTeacherId]) {
        if (!teacherSchedule[primaryTeacherId][day][period]) {
          teacherDailyCount[primaryTeacherId][day]++;
        }
        teacherSchedule[primaryTeacherId][day][period] = lesson.classId;
      }

      classSubjectDays[lesson.classId][lesson.subjectId].add(day);
      slots.push({ 
        classId: lesson.classId, 
        day, 
        period, 
        subjectId: lesson.subjectId, 
        teacherId: primaryTeacherId, 
        isExam: lesson.isExam,
        subTopic: lesson.subTopic,
      });

      if (lesson.isDouble) {
        classSchedule[lesson.classId][day][period + 1] = lesson.subjectId;
        if (primaryTeacherId && primaryTeacherId !== 'none' && teacherSchedule[primaryTeacherId]) {
          if (!teacherSchedule[primaryTeacherId][day][period + 1]) {
            teacherDailyCount[primaryTeacherId][day]++;
          }
          teacherSchedule[primaryTeacherId][day][period + 1] = lesson.classId;
        }
        slots.push({ 
          classId: lesson.classId, 
          day, 
          period: period + 1, 
          subjectId: lesson.subjectId, 
          teacherId: primaryTeacherId, 
          isExam: lesson.isExam,
          subTopic: lesson.subTopic,
        });
      }
    }
  };

  // Pre-assign Fixed Periods (Chào cờ, HĐTN...)
  if (config.fixedPeriods && config.fixedPeriods.length > 0) {
    for (const fp of config.fixedPeriods) {
      const { day, period, subjectId } = fp;
      if (day < 0 || day >= config.days || period < 0 || period >= totalPeriods) continue;

      for (const cls of classes) {
        // Find if this class already has a lesson of this subject in the 'lessons' pool
        const idx = lessons.findIndex(l => l.classId === cls.id && l.subjectId === subjectId);
        
        if (idx !== -1) {
          const l = lessons[idx];
          if (l.isDouble) {
            // Split it: convert current to single and place it, and add a single lesson back to pool
            l.isDouble = false;
            lessons.push({
              ...l,
              isDouble: false
            });
            lessons.splice(idx, 1);
          } else {
            lessons.splice(idx, 1);
          }
          
          // Place directly
          classSchedule[cls.id][day][period] = subjectId;
          classSubjectDays[cls.id][subjectId].add(day);

          const teacherId = l.teacherId;
          if (teacherId && teacherId !== 'none' && teacherSchedule[teacherId]) {
            teacherSchedule[teacherId][day][period] = cls.id;
            teacherDailyCount[teacherId][day] = (teacherDailyCount[teacherId][day] || 0) + 1;
          }

          slots.push({
            classId: cls.id,
            day,
            period,
            subjectId,
            teacherId,
            subTopic: l.subTopic,
            isExam: l.isExam,
            isFixed: true
          });
        }
        // If not in lessons pool (no teacher assigned or 0 lessons planned), do not push unassigned placeholder slot
      }
    }
  }

  // 3. Greedy placement prioritizing filling daily target periods cleanly
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    let placed = false;
    const failureReasons = new Set<string>();
    const openSlotFailureReasons: string[] = [];
    
    const tryPlace = (relaxConstraints: boolean) => {
      let bestSlot: { day: number, period: number } | null = null;
      let bestScore = Infinity;

      const cls = classes.find(c => c.id === lesson.classId);

      for (let day = 0; day < config.days; day++) {
        const limits = cls ? getDailyPeriodsForClass(cls, day, config) : { morning: config.morningLessons, afternoon: config.afternoonLessons };
        
        for (let period = 0; period < totalPeriods; period++) {
          if (lesson.isDouble && period === config.morningLessons - 1) continue;
          
          const result = checkSlotValidity(lesson, day, period, relaxConstraints);
          if (result.valid) {
            const isMorning = period < config.morningLessons;
            const targetCapacity = isMorning ? limits.morning : limits.afternoon;
            if (targetCapacity <= 0 && !relaxConstraints) continue;

            // Count existing lessons on this session for the class
            const sessionStart = isMorning ? 0 : config.morningLessons;
            const sessionEnd = isMorning ? config.morningLessons : totalPeriods;
            let currentCount = 0;
            let lowestEmpty = sessionStart;

            for (let p = sessionStart; p < sessionEnd; p++) {
              if (classSchedule[lesson.classId][day]?.[p]) {
                currentCount++;
              }
            }
            while (lowestEmpty < sessionEnd && classSchedule[lesson.classId][day]?.[lowestEmpty]) {
              lowestEmpty++;
            }

            // Reward filling contiguous slots from period 1 downwards, but allow later periods if needed
            const gapPenalty = (period - lowestEmpty) * 20000;

            // Morning-first priority: Heavily prioritize morning, but if morning cannot fit the lesson (teacher collision / duplicate subject), allow afternoon
            let afternoonPrematurePenalty = 0;
            if (!isMorning && lesson.session !== 'afternoon') {
              let emptyMorningSlots = 0;
              for (let d = 0; d < config.days; d++) {
                const dLim = cls ? getDailyPeriodsForClass(cls, d, config) : { morning: config.morningLessons, afternoon: config.afternoonLessons };
                for (let p = 0; p < dLim.morning; p++) {
                  if (!isSchoolOff(d, p, lesson.subjectId) && !classSchedule[lesson.classId][d]?.[p]) {
                    emptyMorningSlots++;
                  }
                }
              }
              if (emptyMorningSlots > 0) {
                // High penalty ensures valid morning slots are always picked first,
                // but allows afternoon placement when morning is blocked
                afternoonPrematurePenalty = 5000000;
              }
            }

            // Strong reward for filling days that already have lessons up to targetCapacity
            const underFill = targetCapacity - (currentCount + (lesson.isDouble ? 2 : 1));
            const targetFillReward = (underFill < 0 ? 50000 : underFill * 20000);

            // Day preference: fill early days completely first
            const dayOrderPenalty = day * 100;

            // Teacher gap penalty
            let teacherGapPenalty = 0;
            const tId = lesson.teacherId;
            if (tId && tId !== 'none') {
              let tLowest = sessionStart;
              while (tLowest < sessionEnd && isTeacherOccupiedAtAll(tId, day, tLowest)) {
                tLowest++;
              }
              if (period > tLowest) {
                teacherGapPenalty = (period - tLowest) * 15000;
              }
            }

            // Grade parallel scheduling preference (for subjects allowing grade overlap like Tiếng Anh, Thể dục)
            let gradeParallelBonus = 0;
            let staggerGradePenalty = 0;
            const sub = subjects.find(s => s.id === lesson.subjectId);
            const allowGradeOverlap = sub?.allowGradeOverlap !== false;
            if (allowGradeOverlap && cls) {
              const sameGradeCount = classes.filter(otherCls => 
                otherCls.grade === cls.grade &&
                otherCls.id !== cls.id &&
                classSchedule[otherCls.id]?.[day]?.[period] === lesson.subjectId
              ).length;
              if (sameGradeCount > 0) {
                // If it is the same teacher, give an even stronger bonus to combine them and reduce teacher quota (dạy ghép)
                const sameTeacherAndSubject = slots.some(s => 
                  s.teacherId === lesson.teacherId && 
                  s.day === day && 
                  s.period === period && 
                  s.subjectId === lesson.subjectId
                );
                if (sameTeacherAndSubject) {
                  gradeParallelBonus = -500000; // Extremely strong bonus to group them with the same teacher
                } else {
                  gradeParallelBonus = -150000; // Strong bonus to align parallel classes for different teachers
                }

                // Check for grade overlap staggering (trùng so le giữa các khối)
                // If another grade already has an overlapping block of classes for a grade-overlap subject on this same slot, apply a penalty
                const otherGradesOverlapping = Array.from(new Set(classes.map(c => c.grade)))
                  .filter(g => g !== cls.grade)
                  .some(otherGrade => {
                    const classesOfOtherGrade = classes.filter(c => c.grade === otherGrade);
                    const subjectsInPeriod = classesOfOtherGrade
                      .map(c => classSchedule[c.id]?.[day]?.[period])
                      .filter(Boolean);
                    
                    const freqs: Record<string, number> = {};
                    for (const sId of subjectsInPeriod) {
                      freqs[sId] = (freqs[sId] || 0) + 1;
                    }
                    
                    return Object.entries(freqs).some(([sId, count]) => {
                      if (count < 2) return false;
                      const otherSub = subjects.find(s => s.id === sId);
                      return otherSub?.allowGradeOverlap !== false;
                    });
                  });

                if (otherGradesOverlapping) {
                  staggerGradePenalty = 250000; // Apply staggered penalty to push this grade's overlap to another period
                }
              }
            }

            // Morning priority penalty
            let morningPriorityPenalty = 0;
            if (sub?.morningPriority && !isMorning) {
              morningPriorityPenalty = 400000; // Strong penalty for afternoon slots of morning priority subjects
            }

            const relaxPenalty = relaxConstraints ? 2000000 : 0;
            const score = gapPenalty + afternoonPrematurePenalty + targetFillReward + dayOrderPenalty + teacherGapPenalty + gradeParallelBonus + staggerGradePenalty + morningPriorityPenalty + relaxPenalty + Math.random();
            
            if (score < bestScore) {
              bestScore = score;
              bestSlot = { day, period };
            }
          } else if (!relaxConstraints && result.reason) {
            failureReasons.add(result.reason);
            if (!isSchoolOff(day, period, lesson.subjectId)) {
              openSlotFailureReasons.push(result.reason);
            }
          }
        }
      }
      if (bestSlot) {
        placeLesson(lesson, bestSlot.day, bestSlot.period);
        return true;
      }
      return false;
    };

    placed = tryPlace(config.relaxConstraints || false);

    if (!placed && lesson.isDouble) {
      lessons.push({ ...lesson, isDouble: false });
      lessons.push({ ...lesson, isDouble: false });
      continue;
    }

    if (!placed && !lesson.isDouble) {
      placed = tryPlace(true);
    }

    if (!placed) {
      let reason = 'Không tìm thấy tiết trống phù hợp';

      const teacher = teachers.find(t => t.id === lesson.teacherId);
      const cls = classes.find(c => c.id === lesson.classId);

      let totalOpenSchoolSlots = 0;
      for (let d = 0; d < config.days; d++) {
        for (let p = 0; p < totalPeriods; p++) {
          if (!isSchoolOff(d, p)) totalOpenSchoolSlots++;
        }
      }

      const openTeacherConflictCount = openSlotFailureReasons.filter(r => r === 'Giáo viên bận ở lớp khác').length;
      const openClassOccupiedCount = openSlotFailureReasons.filter(r => r === 'Lớp bận').length;
      const openSubjectSameDayCount = openSlotFailureReasons.filter(r => r === 'Môn học đã có trong ngày').length;

      if (teacher && (teacherLoad[teacher.id] || 0) > totalOpenSchoolSlots) {
        reason = `Giáo viên ${teacher.name} bị trùng/quá tải lịch (${teacherLoad[teacher.id]} tiết/tuần)`;
      } else if (openTeacherConflictCount > 0 && openTeacherConflictCount >= openClassOccupiedCount) {
        reason = `Giáo viên ${teacher?.name || ''} bị trùng lịch dạy ở các lớp khác`;
      } else if (openSubjectSameDayCount > 0 && openClassOccupiedCount > 0) {
        reason = `Môn học đã trùng trong ngày hoặc không còn tiết trống phù hợp`;
      } else if (openClassOccupiedCount > 0) {
        reason = `Lớp ${cls?.name || ''} đã kín tiết trong các buổi mở`;
      } else if (failureReasons.has('Giáo viên xin nghỉ')) {
        reason = `Giáo viên ${teacher?.name || ''} xin nghỉ vào các tiết trống còn lại`;
      } else if (failureReasons.has('Vượt định mức tiết/buổi của giáo viên')) {
        reason = `Giáo viên ${teacher?.name || ''} vượt định mức tiết/buổi`;
      } else if (failureReasons.has('Trường nghỉ')) {
        reason = 'Các buổi chiều đã thiết lập nghỉ học';
      }
      
      unassigned.push({ ...lesson, reason });
    }
  }

  // 3.5 Displacement / Swap Resolver for Unassigned Lessons
  for (let u = unassigned.length - 1; u >= 0; u--) {
    const lesson = unassigned[u];
    const cls = classes.find(c => c.id === lesson.classId);
    if (!cls) continue;

    let resolved = false;

    for (let d = 0; d < config.days && !resolved; d++) {
      const limits = getDailyPeriodsForClass(cls, d, config);
      for (let p = 0; p < totalPeriods && !resolved; p++) {
        if (isSchoolOff(d, p, lesson.subjectId)) continue;

        const isMorning = p < config.morningLessons;
        if (isMorning && p >= limits.morning) continue;
        if (!isMorning && (p - config.morningLessons) >= limits.afternoon) continue;

        // Check if teacher for unassigned lesson is free at (d, p)
        if (lesson.teacherId !== 'none') {
          if (isTeacherBusyForClass(lesson.teacherId, d, p, cls.id, lesson.subjectId)) continue;
        }

        if (classSubjectDays[cls.id][lesson.subjectId].has(d)) continue;

        const existingSubId = classSchedule[cls.id][d][p];
        if (!existingSubId) continue;

        const existingSlot = slots.find(s => s.classId === cls.id && s.day === d && s.period === p);
        if (!existingSlot || existingSlot.isExam || existingSlot.isFixed) continue;

        const existingTeacherId = existingSlot.teacherId;

        // Find alternative slot (d2, p2) for existingSlot
        for (let d2 = 0; d2 < config.days && !resolved; d2++) {
          if (d2 === d) continue;
          if (classSubjectDays[cls.id][existingSubId].has(d2)) continue;

          const limits2 = getDailyPeriodsForClass(cls, d2, config);
          for (let p2 = 0; p2 < totalPeriods && !resolved; p2++) {
            if (isSchoolOff(d2, p2, lesson.subjectId)) continue;

            const isMorning2 = p2 < config.morningLessons;
            if (isMorning2 && p2 >= limits2.morning) continue;
            if (!isMorning2 && (p2 - config.morningLessons) >= limits2.afternoon) continue;

            if (classSchedule[cls.id][d2][p2]) continue;

            // Ensure contiguity: p2 MUST be the lowestEmpty of that session on d2
            const sessionStart2 = isMorning2 ? 0 : config.morningLessons;
            const sessionEnd2 = isMorning2 ? config.morningLessons : totalPeriods;
            let lowestEmpty2 = sessionStart2;
            while (lowestEmpty2 < sessionEnd2 && classSchedule[cls.id][d2]?.[lowestEmpty2]) {
              lowestEmpty2++;
            }
            if (p2 !== lowestEmpty2) continue;

            if (existingTeacherId !== 'none') {
              if (isTeacherBusyForClass(existingTeacherId, d2, p2, cls.id, existingSubId)) continue;
            }

            // Perform swap
            delete classSchedule[cls.id][d][p];
            if (existingTeacherId !== 'none' && teacherSchedule[existingTeacherId]) {
              delete teacherSchedule[existingTeacherId][d][p];
              teacherSchedule[existingTeacherId][d2][p2] = cls.id;
            }
            classSchedule[cls.id][d2][p2] = existingSubId;
            existingSlot.day = d2;
            existingSlot.period = p2;
            classSubjectDays[cls.id][existingSubId].delete(d);
            classSubjectDays[cls.id][existingSubId].add(d2);

            placeLesson(lesson, d, p);
            unassigned.splice(u, 1);
            resolved = true;
          }
        }
      }
    }
  }

  // 3.8 Direct Relaxation Fill Pass for Remaining Unassigned Lessons
  for (let u = unassigned.length - 1; u >= 0; u--) {
    const lesson = unassigned[u];
    const cls = classes.find(c => c.id === lesson.classId);
    if (!cls) continue;

    let placed = false;
    for (let d = 0; d < config.days && !placed; d++) {
      const limits = getDailyPeriodsForClass(cls, d, config);
      for (let p = 0; p < totalPeriods && !placed; p++) {
        if (isSchoolOff(d, p, lesson.subjectId)) continue;

        const isMorning = p < config.morningLessons;
        let maxAllowed = isMorning ? limits.morning : limits.afternoon;
        if (config.relaxConstraints) {
          if (isMorning) {
            maxAllowed = Math.min(config.morningLessons, Math.max(limits.morning, 4));
          } else {
            maxAllowed = limits.afternoon > 0 ? Math.min(config.afternoonLessons, limits.afternoon + 1) : 0;
          }
        }
        if (isMorning && p >= maxAllowed) continue;
        if (!isMorning && (p - config.morningLessons) >= maxAllowed) continue;

        // Slot already taken?
        if (classSchedule[cls.id][d][p]) continue;

        // Subject daily limit check: avoid creating same-day duplicates
        const sub = subjects.find(s => s.id === lesson.subjectId);
        if (classSubjectDays[cls.id]?.[lesson.subjectId]?.has(d)) {
          if (!sub?.allowDouble) continue;
        }

        // Ensure contiguity: must only place at lowestEmpty of this session
        const sessionStart = isMorning ? 0 : config.morningLessons;
        const sessionEnd = isMorning ? config.morningLessons : totalPeriods;
        let lowestEmpty = sessionStart;
        while (lowestEmpty < sessionEnd && classSchedule[cls.id][d]?.[lowestEmpty]) {
          lowestEmpty++;
        }
        if (p !== lowestEmpty) continue;

        // Is session correct for subject?
        if (lesson.session === 'morning' && !isMorning) continue;
        if (lesson.session === 'afternoon' && isMorning) continue;

        // Is teacher available?
        if (lesson.teacherId !== 'none') {
          if (isTeacherBusyForClass(lesson.teacherId, d, p, cls.id, lesson.subjectId, true)) continue;
        }

        // Place lesson directly into this open slot
        placeLesson(lesson, d, p);
        unassigned.splice(u, 1);
        placed = true;
      }
    }
  }

  // =========================================================================
  // 3.9 PUSH REMAINING UNASSIGNED LESSONS TO AFTERNOON
  // User mandate: "Những môn như hình gốc không thể sắp xếp thì đẩy sang buổi chiều"
  // If any subject (e.g. Ngữ Văn, Toán, etc.) cannot be placed due to morning collisions,
  // push them directly into the afternoon of that class.
  // =========================================================================
  for (let u = unassigned.length - 1; u >= 0; u--) {
    const lesson = unassigned[u];
    const cls = classes.find(c => c.id === lesson.classId);
    if (!cls) continue;
    const sub = subjects.find(s => s.id === lesson.subjectId);

    let placed = false;

    // Days where afternoon is not school off
    const afternoonCandidateDays: number[] = [];
    for (let d = 0; d < config.days; d++) {
      if (!isSchoolOff(d, config.morningLessons, lesson.subjectId)) {
        afternoonCandidateDays.push(d);
      }
    }

    // Sort days: prioritize days that do not have this subject yet, then fewer afternoon lessons
    afternoonCandidateDays.sort((dA, dB) => {
      const hasA = classSubjectDays[cls.id]?.[lesson.subjectId]?.has(dA) ? 1 : 0;
      const hasB = classSubjectDays[cls.id]?.[lesson.subjectId]?.has(dB) ? 1 : 0;
      if (hasA !== hasB) return hasA - hasB;
      const countA = slots.filter(s => s.classId === cls.id && s.day === dA && s.period >= config.morningLessons).length;
      const countB = slots.filter(s => s.classId === cls.id && s.day === dB && s.period >= config.morningLessons).length;
      return countA - countB;
    });

    const aftStart = config.morningLessons;
    const aftEnd = totalPeriods;

    // Strategy A: Place directly into first available afternoon slot
    for (const d of afternoonCandidateDays) {
      if (placed) break;

      // Calculate next contiguous period
        let nextP = aftStart;
        while (nextP < aftEnd && classSchedule[cls.id][d]?.[nextP]) {
          nextP++;
        }
        if (nextP >= aftEnd || isSchoolOff(d, nextP, lesson.subjectId)) continue;
        
        const p = nextP;
        
        const tId = lesson.teacherId;
        if (tId && tId !== 'none') {
          if (isTeacherBusyForClass(tId, d, p, cls.id, lesson.subjectId, true)) continue;
        }

        const alreadyInDay = classSubjectDays[cls.id]?.[lesson.subjectId]?.has(d);
        if (alreadyInDay && !sub?.allowDouble) {
          continue;
        }

        placeLesson(lesson, d, p);
        unassigned.splice(u, 1);
        placed = true;
        break;
    }

    // Strategy B: If no free afternoon slot, swap an afternoon lesson of another subject to morning
    if (!placed) {
      for (const d of afternoonCandidateDays) {
        if (placed) break;
        if (classSubjectDays[cls.id]?.[lesson.subjectId]?.has(d) && !sub?.allowDouble) continue;

        for (let pA = aftStart; pA < aftEnd && !placed; pA++) {
          if (isSchoolOff(d, pA, lesson.subjectId)) continue;
          const sExisting = slots.find(s => s.classId === cls.id && s.day === d && s.period === pA && !s.isFixed && !s.isExam);
          if (!sExisting) continue;

          const tUnassigned = lesson.teacherId;
          if (tUnassigned && tUnassigned !== 'none' && isTeacherBusyForClass(tUnassigned, d, pA, cls.id, lesson.subjectId, true)) continue;

          const tExisting = sExisting.teacherId;
          for (let dM = 0; dM < config.days && !placed; dM++) {
            const limitsM = getDailyPeriodsForClass(cls, dM, config);
            for (let pM = 0; pM < limitsM.morning && !placed; pM++) {
              if (isSchoolOff(dM, pM, sExisting.subjectId) || classSchedule[cls.id][dM]?.[pM]) continue;
              if (dM !== d && classSubjectDays[cls.id]?.[sExisting.subjectId]?.has(dM)) continue;
              if (tExisting && tExisting !== 'none' && isTeacherBusyForClass(tExisting, dM, pM, cls.id, sExisting.subjectId, true)) continue;

              // Swap: sExisting -> (dM, pM), unassigned lesson -> (d, pA)
              delete classSchedule[cls.id][d][pA];
              if (tExisting && tExisting !== 'none' && teacherSchedule[tExisting]) {
                delete teacherSchedule[tExisting][d][pA];
                teacherSchedule[tExisting][dM][pM] = cls.id;
              }
              classSchedule[cls.id][dM][pM] = sExisting.subjectId;
              sExisting.day = dM;
              sExisting.period = pM;
              if (d !== dM) {
                classSubjectDays[cls.id][sExisting.subjectId]?.delete(d);
                classSubjectDays[cls.id][sExisting.subjectId]?.add(dM);
              }

              placeLesson(lesson, d, pA);
              unassigned.splice(u, 1);
              placed = true;
              break;
            }
          }
        }
      }
    }
  }

  // 4. Inter-Day Compaction (Fill incomplete days up to target limits)
  for (let compIter = 0; compIter < 15; compIter++) {
    let movedAny = false;
    for (const cls of classes) {
      for (let dayTarget = 0; dayTarget < config.days; dayTarget++) {
        for (const isMorning of [true, false]) {
          const limitsTarget = getDailyPeriodsForClass(cls, dayTarget, config);
          const capTarget = isMorning ? limitsTarget.morning : limitsTarget.afternoon;
          if (capTarget <= 0) continue;

          const startP = isMorning ? 0 : config.morningLessons;
          const endP = isMorning ? config.morningLessons : totalPeriods;

          // Count lessons on target day
          let countTarget = 0;
          for (let p = startP; p < endP; p++) {
            if (classSchedule[cls.id][dayTarget]?.[p]) countTarget++;
          }

          if (countTarget < capTarget) {
            // Target day is under-filled. Look for a donor day that has lessons.
            for (let dayDonor = config.days - 1; dayDonor > dayTarget; dayDonor--) {
              let countDonor = 0;
              for (let p = startP; p < endP; p++) {
                if (classSchedule[cls.id][dayDonor]?.[p]) countDonor++;
              }

              if (countDonor > 0) {
                // Only take from the tail of dayDonor to avoid creating a gap on donor day
                let pDonor = endP - 1;
                while (pDonor >= startP && !classSchedule[cls.id][dayDonor]?.[pDonor]) {
                  pDonor--;
                }
                if (pDonor < startP) continue;

                const subId = classSchedule[cls.id][dayDonor]?.[pDonor];
                if (!subId) continue;

                const sDonor = slots.find(s => s.classId === cls.id && s.day === dayDonor && s.period === pDonor);
                if (!sDonor || sDonor.isExam || sDonor.isFixed) continue;

                // Check if target day already has this subject
                if (classSubjectDays[cls.id][subId].has(dayTarget)) continue;

                // Only place into the lowest empty slot of target day to avoid creating a gap
                let pTarget = startP;
                while (pTarget < endP && classSchedule[cls.id][dayTarget]?.[pTarget]) {
                  pTarget++;
                }
                if (pTarget >= startP + capTarget) continue;

                const tId = sDonor.teacherId;
                const canMove = !isSchoolOff(dayTarget, pTarget, sDonor.subjectId) &&
                                (tId === 'none' || !isTeacherBusyForClass(tId, dayTarget, pTarget, cls.id, subId));

                if (canMove) {
                  // Move lesson
                  delete classSchedule[cls.id][dayDonor][pDonor];
                  if (tId && tId !== 'none' && teacherSchedule[tId]) {
                    delete teacherSchedule[tId][dayDonor][pDonor];
                    teacherSchedule[tId][dayTarget][pTarget] = cls.id;
                  }
                  classSchedule[cls.id][dayTarget][pTarget] = subId;
                  sDonor.day = dayTarget;
                  sDonor.period = pTarget;

                  classSubjectDays[cls.id][subId].delete(dayDonor);
                  classSubjectDays[cls.id][subId].add(dayTarget);

                  countTarget++;
                  movedAny = true;
                  break;
                }
              }
              if (movedAny || countTarget >= capTarget) break;
            }
          }
        }
      }
    }
    if (!movedAny) break;
  }

  // Run comprehensive morning-drain and zero-gap contiguity compaction
  slots = compactTimetable(slots, classes, subjects, teachers, config);
  const { newSlots: conflictFreeSlots } = pushConflictsAndDuplicatesToOtherDays(slots, classes, subjects, teachers, config);
  slots = conflictFreeSlots;

  return { slots, unassigned, autoAdjustedConfig };
}

// Helper: generate permutations of small arrays (for <= 5 items)
function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of getPermutations(remaining)) {
      result.push([current, ...p]);
    }
  }
  return result;
}

/**
 * Filters out all invalid slots from a timetable:
 * - Slots without a valid teacher (teacherId is 'none', '0', empty, or teacher name is '0'/'none'/unassigned)
 * - Slots belonging to a subject that has 0 effective lessons for that class in this week (e.g. KHTN Lý in Week 1)
 * - Slots for teachers not assigned to that class & subject
 * - Excess slots exceeding the class-subject planned lesson quota
 */
export function cleanAndFilterTimetableSlots(
  initialSlots: TimetableSlot[],
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): TimetableSlot[] {
  if (!initialSlots || initialSlots.length === 0) return [];

  // Pre-calculate planned lessons for each class to enforce limits and detect 0-lesson subjects
  const classPlansMap = new Map<string, Map<string, number>>();
  for (const cls of classes) {
    const plans = getClassSubjectPlans(cls, subjects, teachers, config);
    const subLimitMap = new Map<string, number>();
    for (const p of plans) {
      subLimitMap.set(p.sub.id, p.effectiveLessons);
    }
    classPlansMap.set(cls.id, subLimitMap);
  }

  // Count placed slots per class and subject to prevent exceeding effectiveLessons
  const placedCount: Record<string, Record<string, number>> = {};
  const validSlots: TimetableSlot[] = [];

  for (const slot of initialSlots) {
    // 1. Check class exists
    const cls = classes.find(c => c.id === slot.classId);
    if (!cls) continue;

    // 2. Check subject exists
    const sub = subjects.find(s => s.id === slot.subjectId);
    if (!sub) continue;

    // 3. Check teacher is valid and not 'none' / '0'
    if (!slot.teacherId || slot.teacherId === 'none' || slot.teacherId === '0') continue;
    const teacher = teachers.find(t => t.id === slot.teacherId);
    if (!isValidTeacher(teacher)) continue;

    // 4. Check effective lessons for this class & subject in this week
    const effectiveLimit = classPlansMap.get(cls.id)?.get(sub.id) ?? 0;
    if (effectiveLimit <= 0) continue; // 0-lesson subject (e.g. Lý week 1): EXCLUDE!

    // 5. Check that this teacher is actually assigned to this class & subject
    const isTeacherAssigned = teacher?.assignments?.some(a =>
      a.subjectId === sub.id &&
      a.classIds.includes(cls.id) &&
      (a.classLessons?.[cls.id] === undefined || a.classLessons?.[cls.id] > 0)
    );
    if (!isTeacherAssigned) continue;

    // 6. Check slot quota doesn't exceed effectiveLessons
    if (!placedCount[cls.id]) placedCount[cls.id] = {};
    const currentPlaced = placedCount[cls.id][sub.id] || 0;
    if (currentPlaced >= effectiveLimit) continue; // Exceeds allowed quota: EXCLUDE!

    placedCount[cls.id][sub.id] = currentPlaced + 1;
    validSlots.push({ ...slot });
  }

  return validSlots;
}

/**
 * Compacts timetable so that:
 * 1. Morning slots are filled first up to configured capacity (excess pushed to afternoon).
 * 2. Lessons in every session are strictly contiguous starting from period 1 (tiết 1, 2, 3...).
 * 3. Empty periods are strictly pushed to the end of the day/session (no gaps like 1-3-5).
 */
export function compactTimetable(
  initialSlots: TimetableSlot[],
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): TimetableSlot[] {
  // Step 1: Clean out any 0-lesson subjects or unassigned/invalid teachers first
  const cleanedSlots = cleanAndFilterTimetableSlots(initialSlots, classes, subjects, teachers, config);
  const slots = cleanedSlots.map(s => ({ ...s }));
  const morningLessons = Math.max(1, config.morningLessons || 4);
  const afternoonLessons = Math.max(0, config.afternoonLessons || 0);
  const totalPeriods = morningLessons + afternoonLessons;

  // Build state maps
  const classSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const teacherSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const classSubjectDays: Record<string, Record<string, Set<number>>> = {};

  for (const cls of classes) {
    classSchedule[cls.id] = {};
    classSubjectDays[cls.id] = {};
    for (let d = 0; d < config.days; d++) classSchedule[cls.id][d] = {};
    for (const sub of subjects) classSubjectDays[cls.id][sub.id] = new Set();
  }
  for (const t of teachers) {
    teacherSchedule[t.id] = {};
    for (let d = 0; d < config.days; d++) teacherSchedule[t.id][d] = {};
  }

  // Populate from slots
  for (const s of slots) {
    if (classSchedule[s.classId]?.[s.day]) {
      classSchedule[s.classId][s.day][s.period] = s.subjectId;
    }
    if (s.teacherId && s.teacherId !== 'none' && teacherSchedule[s.teacherId]?.[s.day]) {
      teacherSchedule[s.teacherId][s.day][s.period] = s.classId;
    }
    if (classSubjectDays[s.classId]?.[s.subjectId]) {
      classSubjectDays[s.classId][s.subjectId].add(s.day);
    }
  }

  const isSchoolOff = (day: number, period: number, subjectId?: string): boolean => {
    if (subjectId) {
      const sub = subjects.find(s => s.id === subjectId);
      if (sub?.bannedPeriods?.includes(period) && !config.relaxConstraints) return true;
    }
    if (!config.timeOff) return false;
    const session = period < morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
  };

  const isPeriodBanned = (subjectId: string, period: number): boolean => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub || !sub.bannedPeriods || config.relaxConstraints) return false;
    return sub.bannedPeriods.includes(period);
  };

  const isTeacherOff = (teacherId: string, day: number, period: number): boolean => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.timeOff) return false;
    const session = period < morningLessons ? 'morning' : 'afternoon';
    return teacher.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
  };

  const isTeacherBusyForClass = (
    teacherId: string,
    day: number,
    period: number,
    classId: string,
    subjectId: string
  ): boolean => {
    if (teacherId === 'none') return false;
    if (isTeacherOff(teacherId, day, period)) return true;

    const activeSlots = slots.filter(s => s.teacherId === teacherId && s.day === day && s.period === period && s.classId !== classId);
    if (activeSlots.length === 0) return false;

    const cls = classes.find(c => c.id === classId);
    if (!cls) return true;

    const sub = subjects.find(s => s.id === subjectId);
    const allowGradeOverlap = sub?.allowGradeOverlap !== false;
    if (!allowGradeOverlap) return true;

    const hasConflict = activeSlots.some(s => {
      const otherCls = classes.find(c => c.id === s.classId);
      if (subjectId === 's_hdtn' && s.subjectId === 's_hdtn') {
        return false;
      }
      return !otherCls || otherCls.grade !== cls.grade || s.subjectId !== subjectId;
    });
    if (hasConflict) return true;

    const maxOverlap = sub?.maxOverlapClasses;
    if (maxOverlap && maxOverlap > 0 && activeSlots.length >= maxOverlap) {
      return true;
    }
    return false;
  };

  const moveSlot = (s: TimetableSlot, toDay: number, toPeriod: number) => {
    const fromDay = s.day;
    const fromPeriod = s.period;
    const clsId = s.classId;
    const subId = s.subjectId;
    const tId = s.teacherId;

    if (classSchedule[clsId]?.[fromDay]) {
      delete classSchedule[clsId][fromDay][fromPeriod];
    }
    if (tId && tId !== 'none' && teacherSchedule[tId]?.[fromDay]) {
      delete teacherSchedule[tId][fromDay][fromPeriod];
    }
    if (fromDay !== toDay) {
      classSubjectDays[clsId]?.[subId]?.delete(fromDay);
    }

    if (!classSchedule[clsId]) classSchedule[clsId] = {};
    if (!classSchedule[clsId][toDay]) classSchedule[clsId][toDay] = {};
    classSchedule[clsId][toDay][toPeriod] = subId;

    if (tId && tId !== 'none') {
      if (!teacherSchedule[tId]) teacherSchedule[tId] = {};
      if (!teacherSchedule[tId][toDay]) teacherSchedule[tId][toDay] = {};
      teacherSchedule[tId][toDay][toPeriod] = clsId;
    }
    if (fromDay !== toDay) {
      if (!classSubjectDays[clsId]) classSubjectDays[clsId] = {};
      if (!classSubjectDays[clsId][subId]) classSubjectDays[clsId][subId] = new Set();
      classSubjectDays[clsId][subId].add(toDay);
    }

    s.day = toDay;
    s.period = toPeriod;
  };

  // PHASE 1: Morning-First Drainage (Ensure all classes have exactly 4 morning lessons every day 0..4)
  for (let pass = 0; pass < 30; pass++) {
    let movedAny = false;
    for (const cls of classes) {
      for (let dM = 0; dM < config.days; dM++) {
        const limitsM = getDailyPeriodsForClass(cls, dM, config);
        const morningCapM = limitsM.morning;
        if (morningCapM <= 0) continue;

        for (let pM = 0; pM < morningCapM; pM++) {
          if (isSchoolOff(dM, pM)) continue;
          if (classSchedule[cls.id]?.[dM]?.[pM]) continue; // Already has lesson

          // Hole at (dM, pM)! Look for an afternoon lesson of this class to move up
          let filled = false;

          // Strategy 1.1: Direct move from any afternoon slot
          for (let dA = 0; dA < config.days && !filled; dA++) {
            const aftSlots = slots.filter(s => s.classId === cls.id && s.day === dA && s.period >= morningLessons && !s.isFixed && !s.isExam);
            for (const sA of aftSlots) {
              const subId = sA.subjectId;
              const sub = subjects.find(sb => sb.id === subId);
              if (sub?.session === 'afternoon') continue;
              if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;
              if (isSchoolOff(dM, pM, subId)) continue;

              const tId = sA.teacherId;
              if (tId !== 'none' && isTeacherBusyForClass(tId, dM, pM, cls.id, subId)) continue;

              moveSlot(sA, dM, pM);
              movedAny = true;
              filled = true;
              break;
            }
          }

          // Strategy 1.2: 2-way Swap with an existing morning lesson on the same morning dM
          if (!filled) {
            for (let pOther = 0; pOther < morningCapM && !filled; pOther++) {
              if (pOther === pM) continue;
              const sOther = slots.find(s => s.classId === cls.id && s.day === dM && s.period === pOther && !s.isFixed && !s.isExam);
              if (!sOther) continue;

              const tOther = sOther.teacherId;
              if (tOther !== 'none' && isTeacherBusyForClass(tOther, dM, pM, cls.id, sOther.subjectId)) continue;

              for (let dA = 0; dA < config.days && !filled; dA++) {
                const aftSlots = slots.filter(s => s.classId === cls.id && s.day === dA && s.period >= morningLessons && !s.isFixed && !s.isExam);
                for (const sA of aftSlots) {
                  const subId = sA.subjectId;
                  const sub = subjects.find(sb => sb.id === subId);
                  if (sub?.session === 'afternoon') continue;
              if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue;
              if (isSchoolOff(dM, pM, subId)) continue;

                  const tA = sA.teacherId;
                  if (tA !== 'none' && isTeacherBusyForClass(tA, dM, pOther, cls.id, subId)) continue;

                  moveSlot(sOther, dM, pM);
                  moveSlot(sA, dM, pOther);
                  movedAny = true;
                  filled = true;
                  break;
                }
              }
            }
          }

          // Strategy 1.3: 2-way Swap with a morning lesson on ANOTHER day dM2
          if (!filled) {
            for (let dM2 = 0; dM2 < config.days && !filled; dM2++) {
              if (dM2 === dM) continue;
              const limitsM2 = getDailyPeriodsForClass(cls, dM2, config);
              for (let pM2 = 0; pM2 < limitsM2.morning && !filled; pM2++) {
                const sM2 = slots.find(s => s.classId === cls.id && s.day === dM2 && s.period === pM2 && !s.isFixed && !s.isExam);
                if (!sM2) continue;

                if (classSubjectDays[cls.id]?.[sM2.subjectId]?.has(dM)) continue;
                const tM2 = sM2.teacherId;
                if (tM2 !== 'none' && isTeacherBusyForClass(tM2, dM, pM, cls.id, sM2.subjectId)) continue;

                for (let dA = 0; dA < config.days && !filled; dA++) {
                  const aftSlots = slots.filter(s => s.classId === cls.id && s.day === dA && s.period >= morningLessons && !s.isFixed && !s.isExam);
                  for (const sA of aftSlots) {
                    const subId = sA.subjectId;
                    const sub = subjects.find(sb => sb.id === subId);
                    if (sub?.session === 'afternoon') continue;
                    if (dA !== dM2 && classSubjectDays[cls.id]?.[subId]?.has(dM2)) continue;

                    const tA = sA.teacherId;
                    if (tA !== 'none' && isTeacherBusyForClass(tA, dM2, pM2, cls.id, subId)) continue;

                    moveSlot(sM2, dM, pM);
                    moveSlot(sA, dM2, pM2);
                    movedAny = true;
                    filled = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (!movedAny) break;
  }

  // PHASE 1.5: Afternoon Rebalancing
  // Enforce configured afternoon targets (e.g. T3: 3, T4: 2/3, T5: 2/3, T6: 2/1, T2: 0, T7: 0)
  // Prevent any class from having 0 or 1 lesson on T3, T4, T5
  for (let rebalIter = 0; rebalIter < 30; rebalIter++) {
    let rebalAny = false;

    for (const cls of classes) {
      for (let dTarget = 0; dTarget < config.days; dTarget++) {
        const limitsTarget = getDailyPeriodsForClass(cls, dTarget, config);
        const aftTarget = limitsTarget.afternoon;
        if (aftTarget <= 0) continue;

        const currentAftTargetSlots = slots.filter(s => s.classId === cls.id && s.day === dTarget && s.period >= morningLessons);
        if (currentAftTargetSlots.length < aftTarget) {
          let filledOne = false;

          for (let dDonor = 0; dDonor < config.days && !filledOne; dDonor++) {
            if (dDonor === dTarget) continue;
            const limitsDonor = getDailyPeriodsForClass(cls, dDonor, config);
            const aftDonorCount = slots.filter(s => s.classId === cls.id && s.day === dDonor && s.period >= morningLessons).length;

            const canDonate = (aftDonorCount > limitsDonor.afternoon) || 
                              (currentAftTargetSlots.length <= 1 && aftDonorCount >= 3) || 
                              (aftTarget === 3 && currentAftTargetSlots.length < 3 && aftDonorCount >= 3);
            if (!canDonate) continue;

            const donorSlots = slots.filter(s => s.classId === cls.id && s.day === dDonor && s.period >= morningLessons && !s.isFixed && !s.isExam);
            for (const sDonor of donorSlots) {
              const subId = sDonor.subjectId;
              if (classSubjectDays[cls.id]?.[subId]?.has(dTarget)) continue;

              for (let pT = morningLessons; pT < morningLessons + aftTarget; pT++) {
                if (isSchoolOff(dTarget, pT, sDonor.subjectId) || classSchedule[cls.id]?.[dTarget]?.[pT]) continue;

                const tId = sDonor.teacherId;
                if (tId !== 'none' && isTeacherBusyForClass(tId, dTarget, pT, cls.id, subId)) continue;

                moveSlot(sDonor, dTarget, pT);
                rebalAny = true;
                filledOne = true;
                break;
              }
              if (filledOne) break;

              // 2-way swap between sDonor and an existing slot in dTarget
              if (!filledOne) {
                for (let pOcc = morningLessons; pOcc < morningLessons + aftTarget && !filledOne; pOcc++) {
                  const sOcc = slots.find(s => s.classId === cls.id && s.day === dTarget && s.period === pOcc && !s.isFixed && !s.isExam);
                  if (!sOcc) continue;

                  const occSubId = sOcc.subjectId;
                  if (classSubjectDays[cls.id]?.[occSubId]?.has(dDonor)) continue;
                  const tOcc = sOcc.teacherId;
                  if (tOcc !== 'none' && isTeacherBusyForClass(tOcc, dDonor, sDonor.period, cls.id, occSubId)) continue;

                  for (let pT = morningLessons; pT < morningLessons + aftTarget; pT++) {
                    if (isSchoolOff(dTarget, pT, sDonor.subjectId)) continue;
                    if (pT !== pOcc && classSchedule[cls.id]?.[dTarget]?.[pT]) continue;

                    if (sDonor.teacherId !== 'none' && isTeacherBusyForClass(sDonor.teacherId, dTarget, pT, cls.id, subId)) continue;

                    moveSlot(sOcc, dDonor, sDonor.period);
                    moveSlot(sDonor, dTarget, pT);
                    rebalAny = true;
                    filledOne = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }
    if (!rebalAny) break;
  }

  // =========================================================================
  // PHASE 2: Strict Zero-Gap Contiguity Compactor
  // Every session with K lessons MUST occupy startP ... startP + K - 1.
  // Gaps (empty periods followed by lessons) are completely forbidden.
  // Any empty period within the session MUST pull down lessons from period 1 onwards.
  // =========================================================================
  for (let packIter = 0; packIter < 25; packIter++) {
    let changedAny = false;

    for (const cls of classes) {
      for (let d = 0; d < config.days; d++) {
        for (const isMorning of [true, false]) {
          const startP = isMorning ? 0 : morningLessons;
          const limits = getDailyPeriodsForClass(cls, d, config);
          const sessionSpan = isMorning ? limits.morning : limits.afternoon;
          if (sessionSpan <= 0) continue;
          const endP = startP + sessionSpan;

          // Find all slots belonging to this class on day d in this session
          const sessionSlots = slots.filter(s => s.classId === cls.id && s.day === d && s.period >= startP && s.period < endP);
          const K = sessionSlots.length;
          if (K === 0 || K >= sessionSpan) continue;

          // Check for holes in the target contiguous range [startP ... startP + K - 1]
          for (let p = startP; p < startP + K; p++) {
            if (classSchedule[cls.id]?.[d]?.[p]) continue; // slot is occupied, good

            // Period p is an empty hole! It MUST be filled by pulling down a lesson from pCand > p
            let filled = false;

            // Strategy 1: Direct Shift from ANY lesson at pCand > p in this session
            for (let pCand = p + 1; pCand < endP && !filled; pCand++) {
              if (classSchedule[cls.id]?.[d]?.[pCand]) {
                const sCand = slots.find(s => s.classId === cls.id && s.day === d && s.period === pCand);
                if (sCand && !sCand.isFixed && !sCand.isExam) {
                  if (!isSchoolOff(d, p, sCand.subjectId) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, d, p, cls.id, sCand.subjectId))) {
                    moveSlot(sCand, d, p);
                    changedAny = true;
                    filled = true;
                    break;
                  }
                }
              }
            }
            if (filled) continue;

            // Strategy 2: Same-Teacher Cross-Class Swap
            // If candidate sCand's teacher T is teaching other class at (d, p), swap their periods!
            for (let pCand = p + 1; pCand < endP && !filled; pCand++) {
              const sCand = slots.find(s => s.classId === cls.id && s.day === d && s.period === pCand);
              if (!sCand || sCand.isFixed || sCand.isExam) continue;
              const tId = sCand.teacherId;
              if (tId === 'none') continue;

              const otherSlot = slots.find(os => os.teacherId === tId && os.day === d && os.period === p && os.classId !== cls.id);
              if (otherSlot && !otherSlot.isFixed && !otherSlot.isExam) {
                const otherClsId = otherSlot.classId;
                const otherClsFreeAtCand = !classSchedule[otherClsId]?.[d]?.[pCand] && !isSchoolOff(d, pCand, otherSlot.subjectId);
                if (otherClsFreeAtCand) {
                  moveSlot(otherSlot, d, pCand);
                  moveSlot(sCand, d, p);
                  changedAny = true;
                  filled = true;
                  break;
                }
              }
            }
            if (filled) continue;

            // Strategy 3: Intra-Session 2-Slot Swap
            // Check if an already occupied period pOcc (< startP + K) can move to p, while sCand moves to pOcc
            for (let pOcc = startP; pOcc < startP + K && !filled; pOcc++) {
              if (pOcc === p) continue;
              const sOcc = slots.find(s => s.classId === cls.id && s.day === d && s.period === pOcc);
              if (!sOcc || sOcc.isFixed || sOcc.isExam) continue;

              for (let pCand = p + 1; pCand < endP && !filled; pCand++) {
                const sCand = slots.find(s => s.classId === cls.id && s.day === d && s.period === pCand);
                if (!sCand || sCand.isFixed || sCand.isExam) continue;

                const canOccTakeP = !isSchoolOff(d, p, sOcc.subjectId) && (sOcc.teacherId === 'none' || !isTeacherBusyForClass(sOcc.teacherId, d, p, cls.id, sOcc.subjectId));
                const canCandTakeOcc = !isSchoolOff(d, pOcc, sCand.subjectId) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, d, pOcc, cls.id, sCand.subjectId));

                if (canOccTakeP && canCandTakeOcc) {
                  moveSlot(sOcc, d, p);
                  moveSlot(sCand, d, pOcc);
                  changedAny = true;
                  filled = true;
                  break;
                }
              }
            }
            if (filled) continue;

            // Strategy 4: Cross-Day Slot Swap for this class
            for (let pCand = p + 1; pCand < endP && !filled; pCand++) {
              const sCand = slots.find(s => s.classId === cls.id && s.day === d && s.period === pCand);
              if (!sCand || sCand.isFixed || sCand.isExam) continue;
              const candSub = subjects.find(sub => sub.id === sCand.subjectId);

              const donorSlots = slots.filter(s => s.classId === cls.id && s.day !== d);
              for (const sDonor of donorSlots) {
                if (sDonor.isFixed || sDonor.isExam || sDonor.subjectId === sCand.subjectId) continue;
                const donorSub = subjects.find(sub => sub.id === sDonor.subjectId);
                const isDonorMorning = sDonor.period < morningLessons;

                if (isMorning && donorSub?.session === 'afternoon') continue;
                if (!isMorning && donorSub?.session === 'morning') continue;
                if (isDonorMorning && candSub?.session === 'afternoon') continue;
                if (!isDonorMorning && candSub?.session === 'morning') continue;

                const donorCreatesDupOnD = classSubjectDays[cls.id]?.[sDonor.subjectId]?.has(d) && !donorSub?.allowDouble;
                const candCreatesDupOnDonorDay = classSubjectDays[cls.id]?.[sCand.subjectId]?.has(sDonor.day) && !candSub?.allowDouble;
                if (donorCreatesDupOnD || candCreatesDupOnDonorDay) continue;

                const canDonorTakeP = !isSchoolOff(d, p, sDonor.subjectId) && (sDonor.teacherId === 'none' || !isTeacherBusyForClass(sDonor.teacherId, d, p, cls.id, sDonor.subjectId));
                const canCandTakeDonor = !isSchoolOff(sDonor.day, sDonor.period, sCand.subjectId) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, sDonor.day, sDonor.period, cls.id, sCand.subjectId));

                if (canDonorTakeP && canCandTakeDonor) {
                  moveSlot(sCand, sDonor.day, sDonor.period);
                  moveSlot(sDonor, d, p);
                  changedAny = true;
                  filled = true;
                  break;
                }
              }
            }
          }

          // Strategy 5: Permutation Search for K lessons (if still not contiguous)
          let isContiguous = true;
          for (let p = startP; p < startP + K; p++) {
            if (!classSchedule[cls.id]?.[d]?.[p]) {
              isContiguous = false;
              break;
            }
          }
          if (!isContiguous) {
            const curSlots = slots.filter(s => s.classId === cls.id && s.day === d && s.period >= startP && s.period < endP);
            if (curSlots.length === K && K <= 6) {
              const targetPeriods = Array.from({ length: K }, (_, i) => startP + i);
              const perms = getPermutations(curSlots);

              for (const perm of perms) {
                let valid = true;
                for (let i = 0; i < K; i++) {
                  const s = perm[i];
                  const targetP = targetPeriods[i];
                  if (s.isFixed && s.period !== targetP) { valid = false; break; }
                  if (isSchoolOff(d, targetP, s.subjectId)) { valid = false; break; }
                  if (s.teacherId !== 'none') {
                    if (isTeacherBusyForClass(s.teacherId, d, targetP, cls.id, s.subjectId)) {
                      valid = false;
                      break;
                    }
                  }
                }
                if (valid) {
                  // Clear old positions
                  for (const s of curSlots) {
                    delete classSchedule[cls.id][d][s.period];
                    if (s.teacherId !== 'none' && teacherSchedule[s.teacherId]?.[d]) {
                      delete teacherSchedule[s.teacherId][d][s.period];
                    }
                  }
                  // Set new positions
                  for (let i = 0; i < K; i++) {
                    const s = perm[i];
                    const targetP = targetPeriods[i];
                    s.period = targetP;
                    classSchedule[cls.id][d][targetP] = s.subjectId;
                    if (s.teacherId !== 'none') {
                      if (!teacherSchedule[s.teacherId]) teacherSchedule[s.teacherId] = {};
                      if (!teacherSchedule[s.teacherId][d]) teacherSchedule[s.teacherId][d] = {};
                      teacherSchedule[s.teacherId][d][targetP] = cls.id;
                    }
                  }
                  changedAny = true;
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (!changedAny) break;
  }

  
  // =========================================================================
  // PHASE 3: Guaranteed Strict Contiguity Enforcer (Final Sweep)
  // Ensures 100% that NO class has gaps: every session with K lessons MUST occupy
  // startP ... startP + K - 1. If any tail lesson is still displaced, force it
  // into earlier holes so lessons are strictly contiguous from period 1 downwards.
  // =========================================================================
  for (let sweep = 0; sweep < 10; sweep++) {
    let sweepChanged = false;
    for (const cls of classes) {
      for (let d = 0; d < config.days; d++) {

      for (const isMorning of [true, false]) {
        const startP = isMorning ? 0 : morningLessons;
        const limits = getDailyPeriodsForClass(cls, d, config);
          const sessionSpan = isMorning ? limits.morning : limits.afternoon;
        if (sessionSpan <= 0) continue;
        const endP = startP + sessionSpan;

        const curSessionSlots = slots
          .filter(s => s.classId === cls.id && s.day === d && s.period >= startP && s.period < endP)
          .sort((a, b) => a.period - b.period);
        
        const K = curSessionSlots.length;
        if (K === 0 || K >= sessionSpan) continue;

        // Check if there are gaps
        for (let p = startP; p < startP + K; p++) {
          if (!classSchedule[cls.id]?.[d]?.[p]) {
            // Period p is an empty hole!
            // Dynamically find any slot of this class currently sitting at period > p in this session
            const cand = slots.find(s => s.classId === cls.id && s.day === d && s.period > p && s.period < endP);
            if (!cand) continue;

            // 1. Can cand move to p?
            if (!isSchoolOff(d, p, cand.subjectId) && (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d, p, cls.id, cand.subjectId))) {
              
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

            let movedOtherDay = false;
            for (let d2 = 0; d2 < config.days && !movedOtherDay; d2++) {
              if (d2 === d) continue;
              const candSub = subjects.find(s => s.id === cand.subjectId);
              if (classSubjectDays[cls.id]?.[cand.subjectId]?.has(d2) && !candSub?.allowDouble) continue;

              if (isMorning) {
                const mCount = slots.filter(s => s.classId === cls.id && s.day === d2 && s.period < morningLessons).length;
                if (mCount < morningLessons && !isSchoolOff(d2, mCount, cand.subjectId)) {
                  if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d2, mCount, cls.id, cand.subjectId)) {
                    
                    moveSlot(cand, d2, mCount);
                    movedOtherDay = true;
                    sweepChanged = true;

                    break;
                  }
                }
              } else {
                const aCount = slots.filter(s => s.classId === cls.id && s.day === d2 && s.period >= morningLessons && s.period < totalPeriods).length;
                const d2Limit = getDailyPeriodsForClass(cls, d2, config);
                if (aCount < d2Limit.afternoon && !isSchoolOff(d2, morningLessons + aCount, cand.subjectId)) {
                  if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d2, morningLessons + aCount, cls.id, cand.subjectId)) {
                    
                    moveSlot(cand, d2, morningLessons + aCount);
                    movedOtherDay = true;
                    sweepChanged = true;

                    break;
                  }
                }
              }
            }
            if (movedOtherDay) continue;

            
            // 4. Guaranteed Contiguity Override:
            // Shift candidate down to p directly if school is not off and teacher is not busy
            if (!isSchoolOff(d, p, cand.subjectId)) {
              if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d, p, cls.id, cand.subjectId)) {
                moveSlot(cand, d, p);
                sweepChanged = true;
              }
            }

          }
          }
        }
      }
    }
    if (!sweepChanged) break;
  }

  // =========================================================================
  // FINAL SANITY GUARANTEE: Mathematical Zero-Gap Compactor

  // For every single class, day, and session, lessons MUST be ordered contiguously
  // starting at startP without skipping any periods.
  // =========================================================================
  for (const cls of classes) {
    for (let d = 0; d < config.days; d++) {
      for (const isMorning of [true, false]) {
        const startP = isMorning ? 0 : morningLessons;
        const limits = getDailyPeriodsForClass(cls, d, config);
          const sessionSpan = isMorning ? limits.morning : limits.afternoon;
        if (sessionSpan <= 0) continue;
        const endP = startP + sessionSpan;

        const sessionSlots = slots
          .filter(s => s.classId === cls.id && s.day === d && s.period >= startP && s.period < endP)
          .sort((a, b) => a.period - b.period);

        for (let i = 0; i < sessionSlots.length; i++) {
          const targetP = startP + i;
          const s = sessionSlots[i];
          if (s.period !== targetP) {
            if (s.teacherId === 'none' || !isTeacherBusyForClass(s.teacherId, d, targetP, s.classId, s.subjectId)) {
              moveSlot(s, d, targetP);
            }
          }
        }
      }
    }
  }

  return slots;
}

export const sanitizeWeeklyTimetables = (
  weekly: Record<number, { timetable: TimetableSlot[], unassigned: any[], weekType?: 'all' | 'odd' | 'even' | 'custom' }>,
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): Record<number, { timetable: TimetableSlot[], unassigned: any[], weekType?: 'all' | 'odd' | 'even' | 'custom' }> => {
  const result: Record<number, { timetable: TimetableSlot[], unassigned: any[], weekType?: 'all' | 'odd' | 'even' | 'custom' }> = {};
  for (const [wStr, wData] of Object.entries(weekly)) {
    const wNum = Number(wStr);
    if (!wData || !Array.isArray(wData.timetable)) {
      result[wNum] = wData;
      continue;
    }
    const wType = wData.weekType || (wNum % 2 === 1 ? 'odd' : 'even');
    const weekConfig: Config = { ...config, currentWeek: wNum, currentWeekType: wType };
    const compacted = compactTimetable(wData.timetable, classes, subjects, teachers, weekConfig);
    const { newSlots: cleanTimetable } = pushConflictsAndDuplicatesToOtherDays(compacted, classes, subjects, teachers, weekConfig);
    result[wNum] = {
      ...wData,
      timetable: cleanTimetable
    };
  }
  return result;
};

export function pushUnassignedToAfternoon(
  currentSlots: TimetableSlot[],
  unassignedLessons: LessonToSchedule[],
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): { newSlots: TimetableSlot[]; remainingUnassigned: LessonToSchedule[]; newConfig?: Config; placedCount: number } {
  let slots = [...currentSlots];
  const unassigned = [...unassignedLessons];
  const morningLessons = Math.max(1, Number(config.morningLessons) || 4);
  const currentAfternoon = Math.max(0, Number(config.afternoonLessons) || 0);
  // Vietnamese secondary and high schools allow up to 4 afternoon lessons (periods 5, 6, 7, 8)
  const maxAllowedAfternoon = Math.max(currentAfternoon, 4);
  const totalPeriods = morningLessons + maxAllowedAfternoon;
  let maxAfternoonUsed = currentAfternoon;

  for (const s of slots) {
    if (s.period >= morningLessons) {
      const aftIdx = s.period - morningLessons + 1;
      if (aftIdx > maxAfternoonUsed) maxAfternoonUsed = aftIdx;
    }
  }

  // Build current occupancy maps
  const classSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const teacherSchedule: Record<string, Record<number, Record<number, string>>> = {};
  const classSubjectDays: Record<string, Record<string, Set<number>>> = {};

  for (const c of classes) {
    classSchedule[c.id] = {};
    classSubjectDays[c.id] = {};
    for (const s of subjects) {
      classSubjectDays[c.id][s.id] = new Set();
    }
  }
  for (const t of teachers) {
    teacherSchedule[t.id] = {};
  }

  for (const slot of slots) {
    if (!classSchedule[slot.classId]) classSchedule[slot.classId] = {};
    if (!classSchedule[slot.classId][slot.day]) classSchedule[slot.classId][slot.day] = {};
    classSchedule[slot.classId][slot.day][slot.period] = slot.subjectId;

    if (slot.teacherId && slot.teacherId !== 'none' && slot.teacherId !== '0') {
      if (!teacherSchedule[slot.teacherId]) teacherSchedule[slot.teacherId] = {};
      if (!teacherSchedule[slot.teacherId][slot.day]) teacherSchedule[slot.teacherId][slot.day] = {};
      teacherSchedule[slot.teacherId][slot.day][slot.period] = slot.classId;
    }

    if (!classSubjectDays[slot.classId]) classSubjectDays[slot.classId] = {};
    if (!classSubjectDays[slot.classId][slot.subjectId]) classSubjectDays[slot.classId][slot.subjectId] = new Set();
    classSubjectDays[slot.classId][slot.subjectId].add(slot.day);
  }

  const isSchoolOff = (d: number, p: number, subjectId?: string) => {
    if (subjectId) {
      const sub = subjects.find(s => s.id === subjectId);
      if (sub?.bannedPeriods?.includes(p) && !config.relaxConstraints) return true;
    }
    if (!config.timeOff) return false;
    const session = p < morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === d && (off.session === 'all' || off.session === session));
  };

  const isTeacherBusy = (tId: string, d: number, p: number, cId: string, sId: string, slotArray: TimetableSlot[] = slots) => {
    if (!tId || tId === 'none' || tId === '0') return false;
    if (tId === 't_gvcn') return false; // Sinh hoạt / Chào cờ
    const t = teachers.find(teach => teach.id === tId);
    if (!t) return false;
    if (t.timeOff) {
      const session = p < morningLessons ? 'morning' : 'afternoon';
      if (t.timeOff.some(to => to.day === d && (to.session === 'all' || to.session === session))) return true;
    }
    const occSlots = slotArray.filter(s => s.teacherId === tId && s.day === d && s.period === p && s.classId !== cId);
    if (occSlots.length === 0) return false;

    const sub = subjects.find(s => s.id === sId);
    if (sId === 's_hdtn' || sub?.allowGradeOverlap === true) {
      const cls = classes.find(c => c.id === cId);
      const allSameGradeAndSub = occSlots.every(s => {
        const otherCls = classes.find(c => c.id === s.classId);
        return otherCls?.grade === cls?.grade && s.subjectId === sId;
      });
      if (allSameGradeAndSub) return false;
    }
    return true;
  };

  // Pass 1: Standard afternoon days (respect school afternoon off, avoid same-day subject duplicate)
  // Pass 2: Relaxed afternoon days (if school afternoon was off on some days, or subject already had a morning lesson)
  unassigned.sort((a, b) => {
    const getPriority = (subId: string) => {
      if (subId === 's_toan' || subId === 's_van') return 1;
      const sub = subjects.find(s => s.id === subId);
      if (sub && (sub.name.toLowerCase().includes('toán') || sub.name.toLowerCase().includes('văn'))) return 1;
      return 0;
    };
    // Items with priority 1 will be moved to the end of the array, so they are processed FIRST in the backwards loop.
    return getPriority(a.subjectId) - getPriority(b.subjectId);
  });

  for (let pass = 1; pass <= 2; pass++) {
    for (let u = unassigned.length - 1; u >= 0; u--) {
      const lesson = unassigned[u];
      const cls = classes.find(c => c.id === lesson.classId);
      if (!cls) continue;
      const sub = subjects.find(s => s.id === lesson.subjectId);

      // Resolve valid teacher if 'none' or missing
      let tId = lesson.teacherId;
      if (!tId || tId === 'none' || tId === '0' || !isValidTeacher(teachers.find(t => t.id === tId))) {
        const assignedT = teachers.find(t =>
          isValidTeacher(t) &&
          t.assignments?.some(a => a.subjectId === lesson.subjectId && a.classIds.includes(cls.id))
        );
        if (assignedT) {
          tId = assignedT.id;
        } else {
          const anyT = teachers.find(t => isValidTeacher(t) && t.assignments?.some(a => a.subjectId === lesson.subjectId));
          if (anyT) tId = anyT.id;
        }
      }

      // Sort days by existing afternoon load and subject presence
      const candidateDays: number[] = [];
      for (let d = 0; d < config.days; d++) {
        const wholeDayOff = config.timeOff?.some(to => to.day === d && to.session === 'all');
        if (wholeDayOff) continue;
        if (isSchoolOff(d, morningLessons, lesson.subjectId)) continue;
        candidateDays.push(d);
      }

      candidateDays.sort((dA, dB) => {
        const hasA = classSubjectDays[cls.id]?.[lesson.subjectId]?.has(dA) ? 1 : 0;
        const hasB = classSubjectDays[cls.id]?.[lesson.subjectId]?.has(dB) ? 1 : 0;
        if (hasA !== hasB) return hasA - hasB;
        const countA = slots.filter(s => s.classId === cls.id && s.day === dA && s.period >= morningLessons).length;
        const countB = slots.filter(s => s.classId === cls.id && s.day === dB && s.period >= morningLessons).length;
        return countA - countB;
      });

      let placed = false;

      // Strategy A: Direct placement into free afternoon slot
      for (const d of candidateDays) {
        if (placed) break;
        if (pass === 1 && classSubjectDays[cls.id]?.[lesson.subjectId]?.has(d) && !sub?.allowDouble) {
          continue;
        }

        // Calculate next contiguous period
        const dailyLimit = getDailyPeriodsForClass(cls, d, config);
        const maxAftPeriods = morningLessons + dailyLimit.afternoon;
        let nextP = morningLessons;
        while (nextP < maxAftPeriods && classSchedule[cls.id]?.[d]?.[nextP]) {
          nextP++;
        }
        if (nextP >= maxAftPeriods) continue;
        
        const p = nextP;
        if (tId && tId !== 'none' && isTeacherBusy(tId, d, p, cls.id, lesson.subjectId, slots)) continue;

          if (!classSchedule[cls.id]) classSchedule[cls.id] = {};
          if (!classSchedule[cls.id][d]) classSchedule[cls.id][d] = {};
          classSchedule[cls.id][d][p] = lesson.subjectId;

          if (tId && tId !== 'none') {
            if (!teacherSchedule[tId]) teacherSchedule[tId] = {};
            if (!teacherSchedule[tId][d]) teacherSchedule[tId][d] = {};
            teacherSchedule[tId][d][p] = cls.id;
          }

          if (!classSubjectDays[cls.id]) classSubjectDays[cls.id] = {};
          if (!classSubjectDays[cls.id][lesson.subjectId]) classSubjectDays[cls.id][lesson.subjectId] = new Set();
          classSubjectDays[cls.id][lesson.subjectId].add(d);

          const aftIndex = p - morningLessons + 1;
          if (aftIndex > maxAfternoonUsed) maxAfternoonUsed = aftIndex;

          slots.push({
            classId: cls.id,
            subjectId: lesson.subjectId,
            teacherId: tId,
            day: d,
            period: p,
            subTopic: lesson.subTopic
          });

          unassigned.splice(u, 1);
          placed = true;
          break;
      }

      // Strategy B: Swap with a morning slot or an afternoon slot of another subject
      if (!placed && pass === 2) {
        for (const d of candidateDays) {
          if (placed) break;
          const dailyLimit = getDailyPeriodsForClass(cls, d, config);
          const maxAftPeriods = morningLessons + dailyLimit.afternoon;

          for (let pA = morningLessons; pA < maxAftPeriods && !placed; pA++) {
            const sExisting = slots.find(s => s.classId === cls.id && s.day === d && s.period === pA && !s.isFixed && !s.isExam);
            if (!sExisting) continue;

            const tUnassigned = tId;
            if (tUnassigned && tUnassigned !== 'none' && isTeacherBusy(tUnassigned, d, pA, cls.id, lesson.subjectId, slots)) continue;

            const tExisting = sExisting.teacherId;
            for (let dM = 0; dM < config.days && !placed; dM++) {
              const limitsM = getDailyPeriodsForClass(cls, dM, config);
              for (let pM = 0; pM < limitsM.morning && !placed; pM++) {
                if (isSchoolOff(dM, pM, sExisting.subjectId) || classSchedule[cls.id]?.[dM]?.[pM]) continue;
                if (dM !== d && classSubjectDays[cls.id]?.[sExisting.subjectId]?.has(dM)) continue;
                if (tExisting && tExisting !== 'none' && isTeacherBusy(tExisting, dM, pM, cls.id, sExisting.subjectId, slots)) continue;

                delete classSchedule[cls.id][d][pA];
                if (tExisting && tExisting !== 'none' && teacherSchedule[tExisting]) {
                  delete teacherSchedule[tExisting][d][pA];
                  teacherSchedule[tExisting][dM][pM] = cls.id;
                }
                classSchedule[cls.id][dM][pM] = sExisting.subjectId;
                sExisting.day = dM;
                sExisting.period = pM;
                if (d !== dM) {
                  classSubjectDays[cls.id][sExisting.subjectId]?.delete(d);
                  classSubjectDays[cls.id][sExisting.subjectId]?.add(dM);
                }

                classSchedule[cls.id][d][pA] = lesson.subjectId;
                if (tUnassigned && tUnassigned !== 'none') {
                  if (!teacherSchedule[tUnassigned]) teacherSchedule[tUnassigned] = {};
                  if (!teacherSchedule[tUnassigned][d]) teacherSchedule[tUnassigned][d] = {};
                  teacherSchedule[tUnassigned][d][pA] = cls.id;
                }
                if (!classSubjectDays[cls.id][lesson.subjectId]) classSubjectDays[cls.id][lesson.subjectId] = new Set();
                classSubjectDays[cls.id][lesson.subjectId].add(d);

                const aftIndex = pA - morningLessons + 1;
                if (aftIndex > maxAfternoonUsed) maxAfternoonUsed = aftIndex;

                slots.push({
                  classId: cls.id,
                  subjectId: lesson.subjectId,
                  teacherId: tUnassigned,
                  day: d,
                  period: pA,
                  subTopic: lesson.subTopic
                });

                unassigned.splice(u, 1);
                placed = true;
                break;
              }
            }
          }
        }
      }
    }
  }

  const newAfternoonLessons = Math.max(Number(config.afternoonLessons) || 0, maxAfternoonUsed);
  const updatedConfig: Config = {
    ...config,
    afternoonLessons: newAfternoonLessons
  };

  // If daily period limits exist, ensure afternoon capacity accommodates the placed slots
  if (updatedConfig.classDailyPeriods || updatedConfig.gradeDailyPeriods) {
    const newClassDaily = { ...(updatedConfig.classDailyPeriods || {}) };
    for (const slot of slots) {
      if (slot.period >= morningLessons) {
        const aftSlotIndex = slot.period - morningLessons + 1;
        const cId = slot.classId;
        const d = slot.day;
        if (!newClassDaily[cId]) {
          newClassDaily[cId] = Array.from({ length: config.days }, () => ({
            morning: morningLessons,
            afternoon: newAfternoonLessons
          }));
        }
        if (newClassDaily[cId][d] && (newClassDaily[cId][d].afternoon ?? 0) < aftSlotIndex) {
          newClassDaily[cId][d] = {
            ...newClassDaily[cId][d],
            afternoon: Math.max(newClassDaily[cId][d].afternoon ?? 0, aftSlotIndex)
          };
        }
      }
    }
    updatedConfig.classDailyPeriods = newClassDaily;
  }

  slots = compactTimetable(slots, classes, subjects, teachers, updatedConfig);
  const { newSlots: cleanSlots } = pushConflictsAndDuplicatesToOtherDays(slots, classes, subjects, teachers, updatedConfig);
  slots = cleanSlots;

  const eliminateAfternoonGaps = (sList: TimetableSlot[]) => {
    let changes = true;
    let iters = 0;
    while (changes && iters < 20) {
      changes = false;
      iters++;
      for (const cls of classes) {
        for (let d = 0; d < config.days; d++) {
          const aftSlots = sList.filter(s => s.classId === cls.id && s.day === d && s.period >= morningLessons).sort((a, b) => a.period - b.period);
          for (let i = 0; i < aftSlots.length; i++) {
            const expectedP = morningLessons + i;
            if (aftSlots[i].period !== expectedP) {
              const currentP = aftSlots[i].period;
              const targetP = expectedP;
              const s = aftSlots[i];
              
              const isTeacherBusyAtTarget = isTeacherBusy(s.teacherId, d, targetP, cls.id, s.subjectId, sList);

              // 1. Direct move
              if (!isSchoolOff(d, targetP, s.subjectId) && !isTeacherBusyAtTarget) {
                s.period = targetP;
                changes = true;
                break;
              }

              // 1.5. Direct move of another afternoon slot into targetP
              let movedOther = false;
              // Removed outer check
                for (let j = i + 1; j < aftSlots.length; j++) {
                  const sCand = aftSlots[j];
                  if (isSchoolOff(d, targetP, sCand.subjectId)) continue;
                  if (!isTeacherBusy(sCand.teacherId, d, targetP, cls.id, sCand.subjectId, sList)) {
                    sCand.period = targetP;
                    changes = true;
                    movedOther = true;
                    break;
                  }

              }
              if (movedOther) break;

              // 2. Cross-class swap with other class occupying targetP
              const otherSlot = sList.find(os => os.teacherId === s.teacherId && os.day === d && os.period === targetP && os.classId !== cls.id);
              if (otherSlot) {
                const otherClsFreeAtCurrent = !sList.some(os => os.classId === otherSlot.classId && os.day === d && os.period === currentP);
                if (otherClsFreeAtCurrent && !isSchoolOff(d, currentP, otherSlot.subjectId) && !isSchoolOff(d, targetP, s.subjectId)) {
                  otherSlot.period = currentP;
                  s.period = targetP;
                  changes = true;
                  break;
                }
              }

              // 3. Move s to another afternoon day with a free contiguous slot
              let movedToOtherDay = false;
              for (let d2 = 0; d2 < config.days; d2++) {
                if (d2 === d) continue;
                if (isSchoolOff(d2, morningLessons, s.subjectId)) continue;
                
                const d2Limit = getDailyPeriodsForClass(cls, d2, config);
                const maxAftP = morningLessons + d2Limit.afternoon;
                
                const d2Aft = sList.filter(os => os.classId === cls.id && os.day === d2 && os.period >= morningLessons).sort((a, b) => a.period - b.period);
                const nextP = morningLessons + d2Aft.length;
                if (nextP < maxAftP && !isSchoolOff(d2, nextP, s.subjectId) && !isTeacherBusy(s.teacherId, d2, nextP, cls.id, s.subjectId, sList)) {
                  // Check if duplicate on d2
                  const hasSubOnD2 = sList.some(os => os.classId === cls.id && os.day === d2 && os.subjectId === s.subjectId);
                  const sub = subjects.find(sb => sb.id === s.subjectId);
                  if (!hasSubOnD2 || sub?.allowDouble) {
                    s.day = d2;
                    s.period = nextP;
                    changes = true;
                    movedToOtherDay = true;
                    break;
                  }
                }
              }
              if (movedToOtherDay) break;

              // 4. Swap with an afternoon slot of this class on another day
              let swappedWithOtherDay = false;
              for (let d2 = 0; d2 < config.days; d2++) {
                if (d2 === d) continue;
                const d2AftSlots = sList.filter(os => os.classId === cls.id && os.day === d2 && os.period >= morningLessons);
                for (const os of d2AftSlots) {
                  const sTeacherBusy = isTeacherBusy(s.teacherId, d2, os.period, cls.id, s.subjectId, sList);
                  const osTeacherBusy = isTeacherBusy(os.teacherId, d, targetP, cls.id, os.subjectId, sList);
                  
                  if (!sTeacherBusy && !osTeacherBusy) {
                    const d2HasSub = sList.some(x => x.classId === cls.id && x.day === d2 && x.subjectId === s.subjectId && x !== os);
                    const sSub = subjects.find(sb => sb.id === s.subjectId);
                    const sDoubleOk = sSub?.allowDouble || !d2HasSub;
                    
                    const dHasSub = sList.some(x => x.classId === cls.id && x.day === d && x.subjectId === os.subjectId && x !== s);
                    const osSub = subjects.find(sb => sb.id === os.subjectId);
                    const osDoubleOk = osSub?.allowDouble || !dHasSub;
                    
                    if (sDoubleOk && osDoubleOk) {
                      s.day = os.day;
                      s.period = os.period;
                      os.day = d;
                      os.period = targetP;
                      changes = true;
                      swappedWithOtherDay = true;
                      break;
                    }
                  }
                }
                if (swappedWithOtherDay) break;
              }
              if (swappedWithOtherDay) break;
            }
          }
        }
      }
    }
  };

  eliminateAfternoonGaps(slots);
  slots = compactTimetable(slots, classes, subjects, teachers, updatedConfig);

  return {
    newSlots: slots,
    remainingUnassigned: unassigned,
    newConfig: updatedConfig,
    placedCount: unassignedLessons.length - unassigned.length
  };
}

/**
 * Pushes lessons with teacher conflicts (overlapping classes or teacher on leave)
 * or same-day duplicate subjects to other days.
 * Mandate: "Giáo viên bị trùng lịch hoặc trùng trong ngày thì đẩy sang ngày khác"
 */
export function pushConflictsAndDuplicatesToOtherDays(
  currentSlots: TimetableSlot[],
  classes: Class[],
  subjects: Subject[],
  teachers: Teacher[],
  config: Config
): { newSlots: TimetableSlot[]; resolvedCount: number } {
  let sList = currentSlots.map(s => ({ ...s }));
  const morningLessons = Math.max(1, Number(config.morningLessons) || 4);
  const afternoonLessons = Math.max(Number(config.afternoonLessons) || 0, 4);
  const totalPeriods = morningLessons + afternoonLessons;

  const isSchoolOff = (d: number, p: number, subjectId?: string) => {
    if (subjectId) {
      const sub = subjects.find(s => s.id === subjectId);
      if (sub?.bannedPeriods?.includes(p) && !config.relaxConstraints) return true;
    }
    if (!config.timeOff) return false;
    const session = p < morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === d && (off.session === 'all' || off.session === session));
  };

  const isPeriodBanned = (subjectId: string, period: number): boolean => {
    const sub = subjects.find(s => s.id === subjectId);
    if (!sub || !sub.bannedPeriods || config.relaxConstraints) return false;
    return sub.bannedPeriods.includes(period);
  };

  const isTeacherOff = (tId: string, d: number, p: number) => {
    const t = teachers.find(teach => teach.id === tId);
    if (!t || !t.timeOff) return false;
    const session = p < morningLessons ? 'morning' : 'afternoon';
    return t.timeOff.some(to => to.day === d && (to.session === 'all' || to.session === session));
  };

  const isTeacherBusy = (
    teacherId: string,
    d: number,
    p: number,
    classId: string,
    subjectId: string,
    slotList: TimetableSlot[]
  ) => {
    if (!teacherId || teacherId === 'none') return false;
    if (isTeacherOff(teacherId, d, p)) return true;

    const cls = classes.find(c => c.id === classId);
    const sub = subjects.find(s => s.id === subjectId);
    const occSlots = slotList.filter(s => s.teacherId === teacherId && s.day === d && s.period === p && s.classId !== classId);
    if (occSlots.length === 0) return false;

    if (teacherId === 't_gvcn') return false; // Chào cờ / sinh hoạt

    const allowGradeOverlap = sub?.allowGradeOverlap === true || subjectId === 's_hdtn';
    if (!allowGradeOverlap) return true;

    return occSlots.some(os => {
      const otherCls = classes.find(c => c.id === os.classId);
      if (subjectId === 's_hdtn' && os.subjectId === 's_hdtn') {
        return !otherCls || otherCls.grade !== cls?.grade;
      }
      return !otherCls || otherCls.grade !== cls?.grade || os.subjectId !== subjectId;
    });
  };

  let resolvedCount = 0;
  let changed = true;
  let iter = 0;

  while (changed && iter < 35) {
    changed = false;
    iter++;

    for (let i = 0; i < sList.length; i++) {
      const s = sList[i];
      if (s.isFixed || s.isExam) continue;

      const cls = classes.find(c => c.id === s.classId);
      const sub = subjects.find(subItem => subItem.id === s.subjectId);
      if (!cls || !sub) continue;

      // 1. Kiểm tra giáo viên bị trùng lịch (trùng tiết lớp khác hoặc ngày nghỉ)
      const isConflict = isTeacherBusy(s.teacherId, s.day, s.period, s.classId, s.subjectId, sList);

      // 2. Kiểm tra môn học bị trùng trong cùng một ngày
      const sameDaySubSlots = sList.filter(other => other.classId === s.classId && other.day === s.day && other.subjectId === s.subjectId);
      let isDuplicateInDay = false;
      if (!sub.allowDouble && sameDaySubSlots.length > 1) {
        sameDaySubSlots.sort((a, b) => a.period - b.period);
        if (s !== sameDaySubSlots[0]) {
          isDuplicateInDay = true;
        }
      } else if (sub.allowDouble && sameDaySubSlots.length > 2) {
        sameDaySubSlots.sort((a, b) => a.period - b.period);
        if (s !== sameDaySubSlots[0] && s !== sameDaySubSlots[1]) {
          isDuplicateInDay = true;
        }
      } else if (sub.allowDouble && sameDaySubSlots.length === 2) {
        sameDaySubSlots.sort((a, b) => a.period - b.period);
        if (sameDaySubSlots[1].period !== sameDaySubSlots[0].period + 1) {
          if (s === sameDaySubSlots[1]) {
            isDuplicateInDay = true;
          }
        }
      }

      if (!isConflict && !isDuplicateInDay) continue;

      // ĐẨY SANG NGÀY KHÁC (Push to another day)
      let pushed = false;
      const otherDays: number[] = [];
      for (let d = 0; d < config.days; d++) {
        if (d !== s.day) otherDays.push(d);
      }

      // Ưu tiên ngày lớp chưa có môn này và có ít tiết hơn
      otherDays.sort((dA, dB) => {
        const hasA = sList.some(other => other.classId === s.classId && other.day === dA && other.subjectId === s.subjectId) ? 1 : 0;
        const hasB = sList.some(other => other.classId === s.classId && other.day === dB && other.subjectId === s.subjectId) ? 1 : 0;
        if (hasA !== hasB) return hasA - hasB;
        const countA = sList.filter(other => other.classId === s.classId && other.day === dA).length;
        const countB = sList.filter(other => other.classId === s.classId && other.day === dB).length;
        return countA - countB;
      });

      for (const dTarget of otherDays) {
        if (pushed) break;

        const dTargetHasSub = sList.some(other => other.classId === s.classId && other.day === dTarget && other.subjectId === s.subjectId);
        if (dTargetHasSub && !sub.allowDouble) continue;

        // Cách 1: Chuyển trực tiếp vào một tiết trống ở ngày dTarget
        const limitTarget = getDailyPeriodsForClass(cls, dTarget, config);
        const maxPTarget = morningLessons + limitTarget.afternoon;
        for (let pTarget = 0; pTarget < maxPTarget; pTarget++) {
          if (pTarget < morningLessons && pTarget >= limitTarget.morning) continue;
          if (isSchoolOff(dTarget, pTarget, s.subjectId)) continue;
          const occ = sList.some(other => other.classId === s.classId && other.day === dTarget && other.period === pTarget);
          if (occ) continue;

          if (isTeacherBusy(s.teacherId, dTarget, pTarget, s.classId, s.subjectId, sList)) continue;

          s.day = dTarget;
          s.period = pTarget;
          pushed = true;
          changed = true;
          resolvedCount++;
          break;
        }

        if (pushed) break;

        // Cách 2: Đổi chéo (Swap 2 chiều) với 1 tiết của lớp ở ngày dTarget
        // Chỉ đổi với những tiết hợp lệ theo giới hạn ngày của dTarget và s.day
        const limitS = getDailyPeriodsForClass(cls, s.day, config);
        const maxPS = morningLessons + limitS.afternoon;
        
        const dTargetSlots = sList.filter(other => other.classId === s.classId && other.day === dTarget && !other.isFixed && !other.isExam);
        for (const sTarget of dTargetSlots) {
          if (sTarget.period >= maxPTarget || s.period >= maxPS) continue; // Prevent swapping into invalid out-of-bounds periods
          if (sTarget.period < morningLessons && sTarget.period >= limitTarget.morning) continue;
          if (s.period < morningLessons && s.period >= limitS.morning) continue;
          if (sTarget.subjectId === s.subjectId) continue;
          const subTarget = subjects.find(st => st.id === sTarget.subjectId);

          const sDayHasSubTarget = sList.some(other => other.classId === s.classId && other.day === s.day && other !== s && other.subjectId === sTarget.subjectId);
          if (sDayHasSubTarget && !subTarget?.allowDouble) continue;

          const dTargetAlreadyHasS = sList.some(other => other.classId === s.classId && other.day === dTarget && other !== sTarget && other.subjectId === s.subjectId);
          if (dTargetAlreadyHasS && !sub.allowDouble) continue;

          const temp = sList.filter(x => x !== s && x !== sTarget);
          if (isTeacherBusy(sTarget.teacherId, s.day, s.period, s.classId, sTarget.subjectId, temp)) continue;
          if (isTeacherBusy(s.teacherId, dTarget, sTarget.period, s.classId, s.subjectId, temp)) continue;

          const oldD = s.day;
          const oldP = s.period;

          s.day = dTarget;
          s.period = sTarget.period;

          sTarget.day = oldD;
          sTarget.period = oldP;

          pushed = true;
          changed = true;
          resolvedCount++;
          break;
        }

        if (pushed) break;

        // Cách 3: Đổi sTarget sang một tiết trống khác trên ngày s.day hoặc dTarget
        for (const sTarget of dTargetSlots) {
          if (sTarget.subjectId === s.subjectId) continue;
          const subTarget = subjects.find(st => st.id === sTarget.subjectId);

          const sDayHasSubTarget = sList.some(other => other.classId === s.classId && other.day === s.day && other !== s && other.subjectId === sTarget.subjectId);
          if (sDayHasSubTarget && !subTarget?.allowDouble) continue;

          const temp = sList.filter(x => x !== s && x !== sTarget);
          if (isTeacherBusy(s.teacherId, dTarget, sTarget.period, s.classId, s.subjectId, temp)) continue;

          for (let pFree = 0; pFree < totalPeriods; pFree++) {
            if (isSchoolOff(s.day, pFree, sTarget.subjectId)) continue;
            const occ = sList.some(other => other.classId === s.classId && other.day === s.day && other.period === pFree && other !== s);
            if (occ && pFree !== s.period) continue;
            if (isTeacherBusy(sTarget.teacherId, s.day, pFree, s.classId, sTarget.subjectId, temp)) continue;

            s.day = dTarget;
            s.period = sTarget.period;

            sTarget.day = s.day;
            sTarget.period = pFree;

            pushed = true;
            changed = true;
            resolvedCount++;
            break;
          }
          if (pushed) break;
        }
      }
    }
  }

  // Thu dọn liền mạch TKB sau khi đổi lịch
  sList = compactTimetable(sList, classes, subjects, teachers, config);

  return { newSlots: sList, resolvedCount };
}

