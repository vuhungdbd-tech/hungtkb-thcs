import json
from scripts.parse_timetable import morning_data, afternoon_data, classes, parse_sub_teacher

# Class definitions
class_data = []
for c in classes:
    grade = int(c[0])
    cid = f'c_{c.lower()}'
    class_data.append({
        'id': cid,
        'name': c,
        'grade': grade
    })

# Subject definitions
subject_data = [
    {'id': 's_toan', 'name': 'Toán', 'lessonsPerWeek': 4, 'type': 'main', 'allowDouble': True, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': False},
    {'id': 's_van', 'name': 'Văn', 'lessonsPerWeek': 4, 'type': 'main', 'allowDouble': True, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': False},
    {'id': 's_anh', 'name': 'T. Anh', 'lessonsPerWeek': 3, 'type': 'main', 'allowDouble': False, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': True},
    {'id': 's_khtn', 'name': 'KHTN', 'lessonsPerWeek': 4, 'type': 'integrated', 'allowDouble': True, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': True},
    {'id': 's_su', 'name': 'Sử', 'lessonsPerWeek': 2, 'type': 'integrated', 'allowDouble': False, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': True,
     'gradeConfigs': {6: {'term1': 1, 'term2': 1}, 7: {'term1': 2, 'term2': 2}, 8: {'term1': 2, 'term2': 2}, 9: {'term1': 1, 'term2': 1}}},
    {'id': 's_dia', 'name': 'Địa', 'lessonsPerWeek': 1, 'type': 'integrated', 'allowDouble': False, 'session': 'all', 'hasExam': True, 'allowGradeOverlap': True,
     'gradeConfigs': {6: {'term1': 2, 'term2': 2}, 7: {'term1': 1, 'term2': 1}, 8: {'term1': 1, 'term2': 1}, 9: {'term1': 2, 'term2': 2}}},
    {'id': 's_gdcd', 'name': 'GDCD', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_gdtc', 'name': 'GDTC', 'lessonsPerWeek': 2, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_mt', 'name': 'MT', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_nhac', 'name': 'Nhạc', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_tin', 'name': 'Tin', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_cn', 'name': 'CN', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True,
     'gradeConfigs': {6: {'term1': 1, 'term2': 1}, 7: {'term1': 1, 'term2': 1}, 8: {'term1': 2, 'term2': 2}, 9: {'term1': 2, 'term2': 2}}},
    {'id': 's_hdtn', 'name': 'HĐTN', 'lessonsPerWeek': 3, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
    {'id': 's_gddp', 'name': 'GDĐP', 'lessonsPerWeek': 1, 'type': 'sub', 'allowDouble': False, 'session': 'all', 'allowGradeOverlap': True},
]

sub_name_to_id = {
    'Toán': 's_toan',
    'Văn': 's_van',
    'T. Anh': 's_anh',
    'KHTN': 's_khtn',
    'Sử': 's_su',
    'Địa': 's_dia',
    'GDCD': 's_gdcd',
    'GDTC': 's_gdtc',
    'MT': 's_mt',
    'Nhạc': 's_nhac',
    'AN': 's_nhac',
    'Tin': 's_tin',
    'CN': 's_cn',
    'HĐTN': 's_hdtn',
    'HĐTNHN': 's_hdtn',
    'GDĐP': 's_gddp',
    'GDDP': 's_gddp',
}

class_name_to_id = {c: f'c_{c.lower()}' for c in classes}

# Normalize string
def clean_sub_tea(c, val):
    sub, tea = parse_sub_teacher(val)
    if not tea:
        if val.startswith('HĐTN'):
            sub = 'HĐTN'
            tea = 'GVCN'
        else:
            return None, None
    sub = sub.strip()
    tea = tea.strip()
    if sub == 'GDDP': sub = 'GDĐP'
    if sub == 'HĐTNHN': sub = 'HĐTN'
    if sub == 'AN': sub = 'Nhạc'
    return sub, tea

slots = []
tea_assigned = {} # tea_id -> { 'name': tea, 'sub_to_cls': { sub_id: set(cls_ids) }, 'total': 0 }

# Collect morning
for d, pmap in morning_data.items():
    for p, cmap in pmap.items():
        for c, val in cmap.items():
            sub, tea = clean_sub_tea(c, val)
            if not sub: continue
            pidx = p - 1 # 0, 1, 2, 3
            cid = class_name_to_id[c]
            sid = sub_name_to_id[sub]
            tid = f't_{tea.lower()}'
            slots.append({
                'classId': cid,
                'day': d,
                'period': pidx,
                'subjectId': sid,
                'teacherId': tid
            })
            if tid not in tea_assigned:
                tea_assigned[tid] = {'name': tea, 'sub_to_cls': {}, 'total': 0}
            tea_assigned[tid]['sub_to_cls'].setdefault(sid, set()).add(cid)
            tea_assigned[tid]['total'] += 1

# Collect afternoon
for d, pmap in afternoon_data.items():
    for p, cmap in pmap.items():
        for c, val in cmap.items():
            sub, tea = clean_sub_tea(c, val)
            if not sub: continue
            pidx = 3 + p # 4, 5, 6
            cid = class_name_to_id[c]
            sid = sub_name_to_id[sub]
            tid = f't_{tea.lower()}'
            slots.append({
                'classId': cid,
                'day': d,
                'period': pidx,
                'subjectId': sid,
                'teacherId': tid
            })
            if tid not in tea_assigned:
                tea_assigned[tid] = {'name': tea, 'sub_to_cls': {}, 'total': 0}
            tea_assigned[tid]['sub_to_cls'].setdefault(sid, set()).add(cid)
            tea_assigned[tid]['total'] += 1

teacher_data = []
for tid, tinfo in sorted(tea_assigned.items()):
    assignments = []
    for sid, clist in tinfo['sub_to_cls'].items():
        assignments.append({
            'subjectId': sid,
            'classIds': sorted(list(clist))
        })
    spec = ''
    # Determine primary specialization
    sids = list(tinfo['sub_to_cls'].keys())
    spec_names = [s['name'] for s in subject_data if s['id'] in sids]
    spec = ', '.join(spec_names[:2])
    
    max_weekly = max(tinfo['total'], 20)
    teacher_data.append({
        'id': tid,
        'name': f'GV {tinfo["name"]}' if tinfo["name"] != 'GVCN' else 'GVCN',
        'specialization': spec,
        'assignments': assignments,
        'maxLessonsPerWeek': max_weekly,
        'maxLessonsPerSession': 7,
        'maxConsecutive': 4,
        'normalLessons': tinfo['total'],
        'extraLessons': 0
    })

# Compute classDailyPeriods
# For each class and day: morning is 4 for days 0..4 (Mon-Fri)
# afternoon is count of afternoon slots on that day
class_daily_periods = {}
for c in classes:
    cid = class_name_to_id[c]
    day_limits = []
    for d in range(6):
        if d == 5: # Saturday
            day_limits.append({'morning': 0, 'afternoon': 0})
        else:
            m_count = sum(1 for s in slots if s['classId'] == cid and s['day'] == d and s['period'] < 4)
            a_count = sum(1 for s in slots if s['classId'] == cid and s['day'] == d and s['period'] >= 4)
            day_limits.append({'morning': m_count, 'afternoon': a_count})
    class_daily_periods[cid] = day_limits


config_data = {
    'days': 6,
    'morningLessons': 4,
    'afternoonLessons': 3,
    'schoolName': 'TRƯỜNG PTDTBT THCS XA DUNG - PHÂN HIỆU SUỐI LƯ',
    'appName': 'TKB Smart',
    'appSubtitle': 'ỨNG DỤNG SẮP XẾP THỜI KHÓA BIỂU',
    'schoolYear': '2025 - 2026',
    'executionDate': '08/12/2025',
    'relaxConstraints': True,
    'timeOff': [
        {'day': 0, 'session': 'afternoon'},
        {'day': 5, 'session': 'all'}
    ],
    'exams': [
        {'grade': 6, 'midTerm1Subjects': [], 'finalTerm1Subjects': [], 'midTerm2Subjects': [], 'finalTerm2Subjects': []},
        {'grade': 7, 'midTerm1Subjects': [], 'finalTerm1Subjects': [], 'midTerm2Subjects': [], 'finalTerm2Subjects': []},
        {'grade': 8, 'midTerm1Subjects': [], 'finalTerm1Subjects': [], 'midTerm2Subjects': [], 'finalTerm2Subjects': []},
        {'grade': 9, 'midTerm1Subjects': [], 'finalTerm1Subjects': [], 'midTerm2Subjects': [], 'finalTerm2Subjects': []},
    ],
    'currentExamTerm': 'none',
    'gradeCounts': {6: 4, 7: 3, 8: 3, 9: 3},
    'gradePrefixes': {6: 'A', 7: 'B', 8: 'C', 9: 'D'},
    'classDailyPeriods': class_daily_periods
}

# Output to TypeScript file
ts_content = f'''import {{ Class, Subject, Teacher, Config, TimetableSlot }} from './types';

export const initialConfig: Config = {json.dumps(config_data, ensure_ascii=False, indent=2)};

export const initialClasses: Class[] = {json.dumps(class_data, ensure_ascii=False, indent=2)};

export const initialSubjects: Subject[] = {json.dumps(subject_data, ensure_ascii=False, indent=2)};

export const initialTeachers: Teacher[] = {json.dumps(teacher_data, ensure_ascii=False, indent=2)};

export const initialSlots: TimetableSlot[] = {json.dumps(slots, ensure_ascii=False, indent=2)};

export const initialWeeklyTimetables: Record<number, {{ timetable: TimetableSlot[], unassigned: any[], weekType: 'all' | 'odd' | 'even' | 'custom' }}> = {{
  1: {{
    timetable: initialSlots,
    unassigned: [],
    weekType: 'all'
  }}
}};
'''

with open('src/data.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Generated src/data.ts successfully!")
print(f"Total slots: {len(slots)}")
print(f"Total classes: {len(class_data)}")
print(f"Total teachers: {len(teacher_data)}")
