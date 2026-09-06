import { Class, Subject, Teacher, Config, TimetableSlot, getAssignmentDefaultLessons, getSubjectDefaultWeekType, DailyPeriodLimit } from './types';

export function getDailyPeriodsForClass(
  cls: Class,
  day: number,
  config: Config
): { morning: number; afternoon: number } {
  if (config.classDailyPeriods && config.classDailyPeriods[cls.id] && config.classDailyPeriods[cls.id][day] !== undefined) {
    const lim = config.classDailyPeriods[cls.id][day];
    return {
      morning: lim.morning ?? config.morningLessons,
      afternoon: lim.afternoon ?? config.afternoonLessons,
    };
  }
  if (config.gradeDailyPeriods && config.gradeDailyPeriods[cls.grade] && config.gradeDailyPeriods[cls.grade][day] !== undefined) {
    const lim = config.gradeDailyPeriods[cls.grade][day];
    return {
      morning: lim.morning ?? config.morningLessons,
      afternoon: lim.afternoon ?? config.afternoonLessons,
    };
  }
  return {
    morning: config.morningLessons,
    afternoon: config.afternoonLessons,
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
      if (currentWeekType === 'custom' && gConf.customWeek !== undefined && gConf.customWeek !== null && gConf.customWeek >= 0) {
        return gConf.customWeek;
      }
      if (currentWeekType === 'odd' && gConf.oddWeek !== undefined && gConf.oddWeek !== null && gConf.oddWeek >= 0) {
        return gConf.oddWeek;
      }
      if (currentWeekType === 'even' && gConf.evenWeek !== undefined && gConf.evenWeek !== null && gConf.evenWeek >= 0) {
        return gConf.evenWeek;
      }
      const termConfig = currentTerm === 'I' ? gConf.term1 : gConf.term2;
      if (termConfig !== undefined && termConfig !== null) return termConfig;
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
    const assigned: Array<{
      teacher: Teacher;
      assignment: any;
      allocatedLessons: number;
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

          const finalLessons = alloc !== undefined && alloc !== null && alloc >= 0
            ? alloc
            : getAssignmentDefaultLessons(sub, cls.grade, wType, config);

          assigned.push({
            teacher: t,
            assignment: a,
            allocatedLessons: finalLessons,
            subTopic: subTop,
            weekType: wType,
          });
        }
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

    let effectiveLessons = stdLessons;

    if (gKey && groupStats.has(gKey)) {
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
              effectiveLessons = assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0);
            }
          }
        }
      } else {
        // No teacher assigned for this specific sub-subject
        if ((gStat.hasExplicit && gStat.explicitTotal >= gStat.quota) || gStat.assignedTotal >= gStat.quota) {
          effectiveLessons = 0;
        } else {
          // Unassigned subject: do not schedule on timetable
          effectiveLessons = 0;
        }
      }
    } else {
      // Non-integrated subject
      if (assigned.length === 0) {
        // No teacher assigned: do not schedule on timetable
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
            effectiveLessons = assigned.reduce((sum, info) => sum + Math.max(0, info.allocatedLessons), 0);
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

  let maxMorningFound = Math.max(config.morningLessons || 5, 5);
  let maxAfternoonFound = Math.max(config.afternoonLessons || 3, 3);

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
        const basePerDay = Math.floor(targetLessons / openMorningDays.length);
        let extra = targetLessons % openMorningDays.length;
        for (const d of openMorningDays) {
          const cap = (d === 5) ? satMorningCap : morningCap;
          const alloc = Math.min(cap, basePerDay + (extra > 0 ? 1 : 0));
          if (extra > 0) extra--;
          schedule[d].morning = alloc;
          rem -= alloc;
        }
        return schedule;
      }

      // Strategy 2: Target lessons > morning capacity (e.g. 26 to 32 lessons)
      // Fill ALL open mornings to the configured limit (e.g. 4 or 5 periods)
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

      // Preferred afternoons: T3 (1), T5 (3), T4 (2), T6 (4), T2 (0)
      const preferredAfternoonOrder = [1, 3, 2, 4, 0].filter(d => openAfternoonDays.includes(d));

      for (const d of preferredAfternoonOrder) {
        if (remainingAfternoon <= 0) break;
        const afternoonCap = Math.max(1, config.afternoonLessons || 3);
        const alloc = Math.min(afternoonCap, remainingAfternoon);
        schedule[d].afternoon = alloc;
        remainingAfternoon -= alloc;
      }

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
    morningLessons: Math.max(5, maxMorningFound),
    afternoonLessons: Math.max(3, maxAfternoonFound),
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
    for (let d = 0; d < numDays; d++) {
      const isMOff = config.timeOff?.some(off => off.day === d && (off.session === 'all' || off.session === 'morning'));
      const isAOff = config.timeOff?.some(off => off.day === d && (off.session === 'all' || off.session === 'afternoon'));
      const lim = getDailyPeriodsForClass(cls, d, config);
      if (!isMOff) cap += lim.morning;
      if (!isAOff) cap += lim.afternoon;
    }
    if (cap < required) {
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

  const isSchoolOff = (day: number, period: number): boolean => {
    if (!config.timeOff) return false;
    const session = period < config.morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
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
    if (cls && !relaxConstraints) {
      const limits = getDailyPeriodsForClass(cls, day, config);
      const isMorning = period < config.morningLessons;
      if (isMorning) {
        if (period >= limits.morning) return { valid: false, reason: 'Vượt quá số tiết sáng cấu hình cho lớp' };
        if (lesson.isDouble && period + 1 >= limits.morning) return { valid: false, reason: 'Tiết đôi vượt giới hạn tiết sáng' };
      } else {
        const afternoonP = period - config.morningLessons;
        if (afternoonP >= limits.afternoon) return { valid: false, reason: 'Vượt quá số tiết chiều cấu hình cho lớp' };
        if (lesson.isDouble && afternoonP + 1 >= limits.afternoon) return { valid: false, reason: 'Tiết đôi vượt giới hạn tiết chiều' };
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

            // Critical: strictly prevent non-contiguous slots (must fill from period 1 onwards)
            // Under NO circumstance can a period jump ahead of lowestEmpty, creating a gap
            if (period > lowestEmpty) {
              continue;
            }
            const gapPenalty = 0;

            // Morning-first priority: Heavily penalize scheduling into afternoon while morning slots are still open
            let afternoonPrematurePenalty = 0;
            if (!isMorning && lesson.session !== 'afternoon') {
              let emptyMorningSlots = 0;
              for (let d = 0; d < config.days; d++) {
                const dLim = cls ? getDailyPeriodsForClass(cls, d, config) : { morning: config.morningLessons, afternoon: config.afternoonLessons };
                for (let p = 0; p < dLim.morning; p++) {
                  if (!isSchoolOff(d, p) && !classSchedule[lesson.classId][d]?.[p]) {
                    emptyMorningSlots++;
                  }
                }
              }
              if (emptyMorningSlots > 0) {
                // Massive penalty so all valid morning slots across the week are filled first before using afternoon
                afternoonPrematurePenalty = 10000000 + emptyMorningSlots * 500000;
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
            if (!isSchoolOff(day, period)) {
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
        if (isSchoolOff(d, p)) continue;

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
            if (isSchoolOff(d2, p2)) continue;

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
        if (isSchoolOff(d, p)) continue;

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
                const canMove = !isSchoolOff(dayTarget, pTarget) &&
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

  const isSchoolOff = (day: number, period: number): boolean => {
    if (!config.timeOff) return false;
    const session = period < morningLessons ? 'morning' : 'afternoon';
    return config.timeOff.some(off => off.day === day && (off.session === 'all' || off.session === session));
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

  // PHASE 1: Morning-First Drainage (Push afternoon lessons up to fill all open morning slots)
  for (let pass = 0; pass < 25; pass++) {
    let movedAny = false;
    for (const cls of classes) {
      for (let dM = 0; dM < config.days; dM++) {
        const limitsM = getDailyPeriodsForClass(cls, dM, config);
        const morningCapM = limitsM.morning > 0 ? Math.min(morningLessons, limitsM.morning) : morningLessons;

        for (let pM = 0; pM < morningCapM; pM++) {
          if (isSchoolOff(dM, pM)) continue;
          if (classSchedule[cls.id]?.[dM]?.[pM]) continue; // slot already has lesson

          // (dM, pM) is an empty morning slot! Find an afternoon lesson of this class to move up
          for (let dA = 0; dA < config.days && !classSchedule[cls.id]?.[dM]?.[pM]; dA++) {
            const aftStart = morningLessons;
            const aftEnd = totalPeriods;

            // Only take the TAIL lesson of afternoon to NEVER leave holes in afternoon!
            let pTail = aftEnd - 1;
            while (pTail >= aftStart && !classSchedule[cls.id]?.[dA]?.[pTail]) {
              pTail--;
            }
            if (pTail < aftStart) continue;
            const pA = pTail;

            const subId = classSchedule[cls.id]?.[dA]?.[pA];
            if (!subId) continue;

            const s = slots.find(slot => slot.classId === cls.id && slot.day === dA && slot.period === pA);
            if (!s || s.isFixed || s.isExam) continue;

            const sub = subjects.find(sb => sb.id === subId);
            if (sub?.session === 'afternoon') continue; // explicitly requires afternoon

            if (dA !== dM && classSubjectDays[cls.id]?.[subId]?.has(dM)) continue; // avoid duplicate subject on dM

            const tId = s.teacherId;
            if (tId !== 'none' && isTeacherBusyForClass(tId, dM, pM, cls.id, subId)) continue;

            // Move afternoon lesson to morning!
            moveSlot(s, dM, pM);
            movedAny = true;
            break;
          }
        }
      }
    }
    if (!movedAny) break;
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
          const sessionSpan = isMorning ? morningLessons : afternoonLessons;
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
                  if (!isSchoolOff(d, p) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, d, p, cls.id, sCand.subjectId))) {
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
                const otherClsFreeAtCand = !classSchedule[otherClsId]?.[d]?.[pCand] && !isSchoolOff(d, pCand);
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

                const canOccTakeP = !isSchoolOff(d, p) && (sOcc.teacherId === 'none' || !isTeacherBusyForClass(sOcc.teacherId, d, p, cls.id, sOcc.subjectId));
                const canCandTakeOcc = !isSchoolOff(d, pOcc) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, d, pOcc, cls.id, sCand.subjectId));

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

                const canDonorTakeP = !isSchoolOff(d, p) && (sDonor.teacherId === 'none' || !isTeacherBusyForClass(sDonor.teacherId, d, p, cls.id, sDonor.subjectId));
                const canCandTakeDonor = !isSchoolOff(sDonor.day, sDonor.period) && (sCand.teacherId === 'none' || !isTeacherBusyForClass(sCand.teacherId, sDonor.day, sDonor.period, cls.id, sCand.subjectId));

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
                  if (isSchoolOff(d, targetP)) { valid = false; break; }
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
  for (const cls of classes) {
    for (let d = 0; d < config.days; d++) {
      for (const isMorning of [true, false]) {
        const startP = isMorning ? 0 : morningLessons;
        const sessionSpan = isMorning ? morningLessons : afternoonLessons;
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
            if (!isSchoolOff(d, p) && (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d, p, cls.id, cand.subjectId))) {
              moveSlot(cand, d, p);
              continue;
            }

            // 2. Can ANY slot of this class in the entire week move to (d, p)?
            let weeklySwapDone = false;
            const weeklySlots = slots.filter(s => s.classId === cls.id && !s.isFixed && !s.isExam && (s.day !== d || s.period >= startP + K));
            for (const ws of weeklySlots) {
              const canWsTakeP = !isSchoolOff(d, p) && (ws.teacherId === 'none' || !isTeacherBusyForClass(ws.teacherId, d, p, cls.id, ws.subjectId));
              const canCandTakeWs = !isSchoolOff(ws.day, ws.period) && (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, ws.day, ws.period, cls.id, cand.subjectId));
              if (canWsTakeP && canCandTakeWs) {
                moveSlot(cand, ws.day, ws.period);
                moveSlot(ws, d, p);
                weeklySwapDone = true;
                break;
              }
            }
            if (weeklySwapDone) continue;

            // 3. Move cand to an open contiguous slot on another day
            let movedOtherDay = false;
            for (let d2 = 0; d2 < config.days && !movedOtherDay; d2++) {
              if (d2 === d) continue;
              if (isMorning) {
                const mCount = slots.filter(s => s.classId === cls.id && s.day === d2 && s.period < morningLessons).length;
                if (mCount < morningLessons && !isSchoolOff(d2, mCount)) {
                  if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d2, mCount, cls.id, cand.subjectId)) {
                    moveSlot(cand, d2, mCount);
                    movedOtherDay = true;
                    break;
                  }
                }
              } else {
                const aCount = slots.filter(s => s.classId === cls.id && s.day === d2 && s.period >= morningLessons && s.period < totalPeriods).length;
                if (aCount < afternoonLessons && !isSchoolOff(d2, morningLessons + aCount)) {
                  if (cand.teacherId === 'none' || !isTeacherBusyForClass(cand.teacherId, d2, morningLessons + aCount, cls.id, cand.subjectId)) {
                    moveSlot(cand, d2, morningLessons + aCount);
                    movedOtherDay = true;
                    break;
                  }
                }
              }
            }
            if (movedOtherDay) continue;

            // 4. Guaranteed Contiguity Override:
            // Shift candidate down to p directly so students NEVER have an empty period in the middle of session!
            if (!isSchoolOff(d, p)) {
              // If another class collides with cand's teacher at (d, p), try to shift that other class's slot
              if (cand.teacherId !== 'none' && teacherSchedule[cand.teacherId]?.[d]?.[p]) {
                const collidingClsId = teacherSchedule[cand.teacherId][d][p];
                if (collidingClsId !== cls.id) {
                  const collSlot = slots.find(s => s.classId === collidingClsId && s.day === d && s.period === p);
                  if (collSlot && !collSlot.isFixed && !collSlot.isExam) {
                    // Try to move collSlot to cand's old period cand.period
                    if (!classSchedule[collidingClsId]?.[d]?.[cand.period] && !isSchoolOff(d, cand.period)) {
                      moveSlot(collSlot, d, cand.period);
                    }
                  }
                }
              }
              moveSlot(cand, d, p);
            }
          }
        }
      }
    }
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
        const sessionSpan = isMorning ? morningLessons : afternoonLessons;
        if (sessionSpan <= 0) continue;
        const endP = startP + sessionSpan;

        const sessionSlots = slots
          .filter(s => s.classId === cls.id && s.day === d && s.period >= startP && s.period < endP)
          .sort((a, b) => a.period - b.period);

        for (let i = 0; i < sessionSlots.length; i++) {
          const targetP = startP + i;
          const s = sessionSlots[i];
          if (s.period !== targetP) {
            moveSlot(s, d, targetP);
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
    result[wNum] = {
      ...wData,
      timetable: compactTimetable(wData.timetable, classes, subjects, teachers, weekConfig)
    };
  }
  return result;
};

