import { Class, Subject, Teacher, Config, TimetableSlot } from './types';

export const initialConfig: Config = {
  "days": 6,
  "morningLessons": 4,
  "afternoonLessons": 3,
  "schoolName": "TRƯỜNG PTDTBT THCS XA DUNG - PHÂN HIỆU SUỐI LƯ",
  "appName": "TKB Smart",
  "appSubtitle": "ỨNG DỤNG SẮP XẾP THỜI KHÓA BIỂU",
  "schoolYear": "2025 - 2026",
  "executionDate": "08/12/2025",
  "relaxConstraints": true,
  "timeOff": [
    {
      "day": 0,
      "session": "afternoon"
    },
    {
      "day": 5,
      "session": "all"
    }
  ],
  "exams": [
    {
      "grade": 6,
      "midTerm1Subjects": [],
      "finalTerm1Subjects": [],
      "midTerm2Subjects": [],
      "finalTerm2Subjects": []
    },
    {
      "grade": 7,
      "midTerm1Subjects": [],
      "finalTerm1Subjects": [],
      "midTerm2Subjects": [],
      "finalTerm2Subjects": []
    },
    {
      "grade": 8,
      "midTerm1Subjects": [],
      "finalTerm1Subjects": [],
      "midTerm2Subjects": [],
      "finalTerm2Subjects": []
    },
    {
      "grade": 9,
      "midTerm1Subjects": [],
      "finalTerm1Subjects": [],
      "midTerm2Subjects": [],
      "finalTerm2Subjects": []
    }
  ],
  "currentExamTerm": "none",
  "gradeCounts": {
    "6": 4,
    "7": 3,
    "8": 3,
    "9": 3
  },
  "gradePrefixes": {
    "6": "A",
    "7": "B",
    "8": "C",
    "9": "D"
  },
  "gradeDailyPeriods": {
    "6": [
      { "morning": 4, "afternoon": 0 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 0, "afternoon": 0 }
    ],
    "7": [
      { "morning": 4, "afternoon": 0 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 0, "afternoon": 0 }
    ],
    "8": [
      { "morning": 4, "afternoon": 0 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 4, "afternoon": 2 },
      { "morning": 0, "afternoon": 0 }
    ],
    "9": [
      { "morning": 4, "afternoon": 0 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 3 },
      { "morning": 4, "afternoon": 1 },
      { "morning": 0, "afternoon": 0 }
    ]
  },
  "classDailyPeriods": {
    "c_6a9": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_6a10": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_6a11": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_6a12": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_7b9": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_7b10": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_7b11": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 1
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_8c8": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_8c9": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_8c10": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 4,
        "afternoon": 2
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_9d8": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 1
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_9d9": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 1
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ],
    "c_9d10": [
      {
        "morning": 4,
        "afternoon": 0
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 3
      },
      {
        "morning": 4,
        "afternoon": 1
      },
      {
        "morning": 0,
        "afternoon": 0
      }
    ]
  }
};

export const initialClasses: Class[] = [
  {
    "id": "c_6a9",
    "name": "6A9",
    "grade": 6
  },
  {
    "id": "c_6a10",
    "name": "6A10",
    "grade": 6
  },
  {
    "id": "c_6a11",
    "name": "6A11",
    "grade": 6
  },
  {
    "id": "c_6a12",
    "name": "6A12",
    "grade": 6
  },
  {
    "id": "c_7b9",
    "name": "7B9",
    "grade": 7
  },
  {
    "id": "c_7b10",
    "name": "7B10",
    "grade": 7
  },
  {
    "id": "c_7b11",
    "name": "7B11",
    "grade": 7
  },
  {
    "id": "c_8c8",
    "name": "8C8",
    "grade": 8
  },
  {
    "id": "c_8c9",
    "name": "8C9",
    "grade": 8
  },
  {
    "id": "c_8c10",
    "name": "8C10",
    "grade": 8
  },
  {
    "id": "c_9d8",
    "name": "9D8",
    "grade": 9
  },
  {
    "id": "c_9d9",
    "name": "9D9",
    "grade": 9
  },
  {
    "id": "c_9d10",
    "name": "9D10",
    "grade": 9
  }
];

export const initialSubjects: Subject[] = [
  {
    "id": "s_toan",
    "name": "Toán",
    "lessonsPerWeek": 4,
    "type": "main",
    "allowDouble": true,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": false
  },
  {
    "id": "s_van",
    "name": "Văn",
    "lessonsPerWeek": 4,
    "type": "main",
    "allowDouble": true,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": false
  },
  {
    "id": "s_anh",
    "name": "T. Anh",
    "lessonsPerWeek": 3,
    "type": "main",
    "allowDouble": false,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": true
  },
  {
    "id": "s_khtn",
    "name": "KHTN",
    "lessonsPerWeek": 4,
    "type": "integrated",
    "allowDouble": true,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": true
  },
  {
    "id": "s_su",
    "name": "Sử",
    "lessonsPerWeek": 2,
    "type": "integrated",
    "allowDouble": false,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": true,
    "gradeConfigs": {
      "6": {
        "term1": 1,
        "term2": 1
      },
      "7": {
        "term1": 2,
        "term2": 2
      },
      "8": {
        "term1": 2,
        "term2": 2
      },
      "9": {
        "term1": 1,
        "term2": 1
      }
    }
  },
  {
    "id": "s_dia",
    "name": "Địa",
    "lessonsPerWeek": 1,
    "type": "integrated",
    "allowDouble": false,
    "session": "all",
    "hasExam": true,
    "allowGradeOverlap": true,
    "gradeConfigs": {
      "6": {
        "term1": 2,
        "term2": 2
      },
      "7": {
        "term1": 1,
        "term2": 1
      },
      "8": {
        "term1": 1,
        "term2": 1
      },
      "9": {
        "term1": 2,
        "term2": 2
      }
    }
  },
  {
    "id": "s_gdcd",
    "name": "GDCD",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_gdtc",
    "name": "GDTC",
    "lessonsPerWeek": 2,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_mt",
    "name": "MT",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_nhac",
    "name": "Nhạc",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_tin",
    "name": "Tin",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_cn",
    "name": "CN",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true,
    "gradeConfigs": {
      "6": {
        "term1": 1,
        "term2": 1
      },
      "7": {
        "term1": 1,
        "term2": 1
      },
      "8": {
        "term1": 2,
        "term2": 2
      },
      "9": {
        "term1": 2,
        "term2": 2
      }
    }
  },
  {
    "id": "s_hdtn",
    "name": "HĐTN",
    "lessonsPerWeek": 3,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  },
  {
    "id": "s_gddp",
    "name": "GDĐP",
    "lessonsPerWeek": 1,
    "type": "sub",
    "allowDouble": false,
    "session": "all",
    "allowGradeOverlap": true
  }
];

export const initialTeachers: Teacher[] = [
  {
    "id": "t_an",
    "name": "GV An",
    "specialization": "HĐTN, GDĐP",
    "assignments": [
      {
        "subjectId": "s_gddp",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 19,
    "extraLessons": 0
  },
  {
    "id": "t_gvcn",
    "name": "GVCN",
    "specialization": "HĐTN",
    "assignments": [
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 13,
    "extraLessons": 0
  },
  {
    "id": "t_hoa",
    "name": "GV Hoa",
    "specialization": "Toán, GDCD",
    "assignments": [
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_6a12",
          "c_6a9"
        ]
      },
      {
        "subjectId": "s_tin",
        "classIds": [
          "c_6a9",
          "c_7b10",
          "c_7b11"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_7b10",
          "c_7b11",
          "c_7b9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 14,
    "extraLessons": 0
  },
  {
    "id": "t_hoàn",
    "name": "GV Hoàn",
    "specialization": "KHTN, HĐTN",
    "assignments": [
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_6a9"
        ]
      },
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_7b9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 3,
    "extraLessons": 0
  },
  {
    "id": "t_hoàng",
    "name": "GV Hoàng",
    "specialization": "Toán, KHTN",
    "assignments": [
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_7b10",
          "c_7b11",
          "c_7b9"
        ]
      },
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_8c10"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_8c10"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_huấn",
    "name": "GV Huấn",
    "specialization": "Toán, GDCD",
    "assignments": [
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_8c8",
          "c_8c9"
        ]
      },
      {
        "subjectId": "s_tin",
        "classIds": [
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_8c8"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_hùng",
    "name": "GV Hùng",
    "specialization": "Toán, GDCD",
    "assignments": [
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_tin",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_9d8"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_hưng",
    "name": "GV Hưng",
    "specialization": "HĐTN",
    "assignments": [
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_8c8"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 2,
    "extraLessons": 0
  },
  {
    "id": "t_hương",
    "name": "GV Hương",
    "specialization": "T. Anh",
    "assignments": [
      {
        "subjectId": "s_anh",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 39,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 39,
    "extraLessons": 0
  },
  {
    "id": "t_hặc",
    "name": "GV Hặc",
    "specialization": "Nhạc, CN",
    "assignments": [
      {
        "subjectId": "s_nhac",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_6a12"
        ]
      },
      {
        "subjectId": "s_cn",
        "classIds": [
          "c_6a11"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_kiên",
    "name": "GV Kiên",
    "specialization": "Văn, Địa",
    "assignments": [
      {
        "subjectId": "s_van",
        "classIds": [
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_dia",
        "classIds": [
          "c_6a10",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 21,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 21,
    "extraLessons": 0
  },
  {
    "id": "t_lan",
    "name": "GV Lan",
    "specialization": "MT, CN",
    "assignments": [
      {
        "subjectId": "s_mt",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_cn",
        "classIds": [
          "c_6a12"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_7b11"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_linh",
    "name": "GV Linh",
    "specialization": "Toán, GDCD",
    "assignments": [
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_7b9"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_8c9"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_8c9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 11,
    "extraLessons": 0
  },
  {
    "id": "t_long",
    "name": "GV Long",
    "specialization": "KHTN, HĐTN",
    "assignments": [
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_7b10"
        ]
      }
    ],
    "maxLessonsPerWeek": 23,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 23,
    "extraLessons": 0
  },
  {
    "id": "t_ngoan",
    "name": "GV Ngoan",
    "specialization": "Toán, HĐTN",
    "assignments": [
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_6a10",
          "c_6a11"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_8c10"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 14,
    "extraLessons": 0
  },
  {
    "id": "t_ngọc",
    "name": "GV Ngọc",
    "specialization": "KHTN, HĐTN",
    "assignments": [
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_hdtn",
        "classIds": [
          "c_7b9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 8,
    "extraLessons": 0
  },
  {
    "id": "t_phương",
    "name": "GV Phương",
    "specialization": "Văn, Địa",
    "assignments": [
      {
        "subjectId": "s_van",
        "classIds": [
          "c_7b10",
          "c_7b11",
          "c_7b9"
        ]
      },
      {
        "subjectId": "s_dia",
        "classIds": [
          "c_6a11",
          "c_6a12",
          "c_8c10",
          "c_8c8",
          "c_8c9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 19,
    "extraLessons": 0
  },
  {
    "id": "t_thiết",
    "name": "GV Thiết",
    "specialization": "GDCD, CN",
    "assignments": [
      {
        "subjectId": "s_cn",
        "classIds": [
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_thiện",
    "name": "GV Thiện",
    "specialization": "Văn, Sử",
    "assignments": [
      {
        "subjectId": "s_su",
        "classIds": [
          "c_7b11",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_van",
        "classIds": [
          "c_9d10"
        ]
      },
      {
        "subjectId": "s_gdcd",
        "classIds": [
          "c_9d10"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_thuận",
    "name": "GV Thuận",
    "specialization": "Văn, Sử",
    "assignments": [
      {
        "subjectId": "s_su",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b9"
        ]
      },
      {
        "subjectId": "s_van",
        "classIds": [
          "c_8c10",
          "c_8c8",
          "c_8c9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 20,
    "extraLessons": 0
  },
  {
    "id": "t_thắm",
    "name": "GV Thắm",
    "specialization": "Văn",
    "assignments": [
      {
        "subjectId": "s_van",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 16,
    "extraLessons": 0
  },
  {
    "id": "t_tiến",
    "name": "GV Tiến",
    "specialization": "GDTC",
    "assignments": [
      {
        "subjectId": "s_gdtc",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9",
          "c_7b10",
          "c_7b11",
          "c_7b9",
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      }
    ],
    "maxLessonsPerWeek": 26,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 26,
    "extraLessons": 0
  },
  {
    "id": "t_trung",
    "name": "GV Trung",
    "specialization": "Toán, KHTN",
    "assignments": [
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_8c10",
          "c_8c8",
          "c_8c9",
          "c_9d10",
          "c_9d8",
          "c_9d9"
        ]
      },
      {
        "subjectId": "s_toan",
        "classIds": [
          "c_7b10",
          "c_7b11"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 17,
    "extraLessons": 0
  },
  {
    "id": "t_tú",
    "name": "GV Tú",
    "specialization": "KHTN, CN",
    "assignments": [
      {
        "subjectId": "s_khtn",
        "classIds": [
          "c_6a10",
          "c_6a11",
          "c_6a12",
          "c_6a9"
        ]
      },
      {
        "subjectId": "s_cn",
        "classIds": [
          "c_6a10",
          "c_6a9"
        ]
      }
    ],
    "maxLessonsPerWeek": 20,
    "maxLessonsPerSession": 7,
    "maxConsecutive": 4,
    "normalLessons": 6,
    "extraLessons": 0
  }
];

export const initialSlots: TimetableSlot[] = [
  {
    "classId": "c_6a9",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_6a10",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_6a11",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_6a12",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_7b9",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_7b10",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_7b11",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_8c8",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_8c9",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_8c10",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_9d8",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_9d9",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_9d10",
    "day": 0,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_gvcn"
  },
  {
    "classId": "c_6a9",
    "day": 0,
    "period": 1,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_6a10",
    "day": 0,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 0,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a12",
    "day": 0,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_7b9",
    "day": 0,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_7b10",
    "day": 0,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b11",
    "day": 0,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c8",
    "day": 0,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c9",
    "day": 0,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 0,
    "period": 1,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d8",
    "day": 0,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 0,
    "period": 1,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_9d10",
    "day": 0,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a9",
    "day": 0,
    "period": 2,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a10",
    "day": 0,
    "period": 2,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_6a11",
    "day": 0,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 0,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_7b9",
    "day": 0,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b10",
    "day": 0,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_7b11",
    "day": 0,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_8c8",
    "day": 0,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 0,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_8c10",
    "day": 0,
    "period": 2,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d8",
    "day": 0,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_9d9",
    "day": 0,
    "period": 2,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 0,
    "period": 2,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a9",
    "day": 0,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_6a10",
    "day": 0,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_6a11",
    "day": 0,
    "period": 3,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a12",
    "day": 0,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_7b9",
    "day": 0,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b10",
    "day": 0,
    "period": 3,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b11",
    "day": 0,
    "period": 3,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c8",
    "day": 0,
    "period": 3,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c9",
    "day": 0,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c10",
    "day": 0,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_9d8",
    "day": 0,
    "period": 3,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d9",
    "day": 0,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_9d10",
    "day": 0,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 0,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 0,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 1,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 1,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 1,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 2,
    "subjectId": "s_gdcd",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 2,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 2,
    "subjectId": "s_tin",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 2,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 2,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 2,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 2,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 2,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 3,
    "subjectId": "s_gdcd",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 3,
    "subjectId": "s_cn",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 3,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 3,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 3,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 0,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 0,
    "subjectId": "s_gdcd",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 0,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 0,
    "subjectId": "s_gdcd",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 0,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 1,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 1,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 1,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 2,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 2,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 2,
    "subjectId": "s_tin",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 2,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 2,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 3,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 3,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 3,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 3,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 3,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 3,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 3,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 0,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 0,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 0,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 0,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 1,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 1,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 1,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 1,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 1,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 1,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 2,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 2,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 2,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 2,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 3,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 3,
    "subjectId": "s_cn",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 3,
    "subjectId": "s_gdcd",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 3,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 3,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 3,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 0,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 0,
    "subjectId": "s_tin",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 0,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 0,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_7b11",
    "day": 4,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 0,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 0,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_9d8",
    "day": 4,
    "period": 0,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_9d9",
    "day": 4,
    "period": 0,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 4,
    "period": 0,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 1,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 1,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 1,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 1,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b11",
    "day": 4,
    "period": 1,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 1,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_9d8",
    "day": 4,
    "period": 1,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d9",
    "day": 4,
    "period": 1,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d10",
    "day": 4,
    "period": 1,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 2,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 2,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 2,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_7b11",
    "day": 4,
    "period": 2,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 2,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_9d8",
    "day": 4,
    "period": 2,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 4,
    "period": 2,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d10",
    "day": 4,
    "period": 2,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 3,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 3,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 3,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 3,
    "subjectId": "s_tin",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b11",
    "day": 4,
    "period": 3,
    "subjectId": "s_hdtn",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 3,
    "subjectId": "s_gdcd",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 3,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_9d8",
    "day": 4,
    "period": 3,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 4,
    "period": 3,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d10",
    "day": 4,
    "period": 3,
    "subjectId": "s_khtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 4,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 4,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 4,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 4,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 4,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 4,
    "subjectId": "s_gdcd",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 4,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 4,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 4,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 4,
    "subjectId": "s_van",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 5,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 5,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 5,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 5,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 5,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 5,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 5,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 5,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_6a9",
    "day": 1,
    "period": 6,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a10",
    "day": 1,
    "period": 6,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a11",
    "day": 1,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 1,
    "period": 6,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_7b9",
    "day": 1,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngọc"
  },
  {
    "classId": "c_7b10",
    "day": 1,
    "period": 6,
    "subjectId": "s_toan",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_7b11",
    "day": 1,
    "period": 6,
    "subjectId": "s_gdcd",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_8c8",
    "day": 1,
    "period": 6,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c9",
    "day": 1,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_8c10",
    "day": 1,
    "period": 6,
    "subjectId": "s_gdcd",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_9d8",
    "day": 1,
    "period": 6,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_9d9",
    "day": 1,
    "period": 6,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_9d10",
    "day": 1,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 4,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 4,
    "subjectId": "s_van",
    "teacherId": "t_thắm"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 4,
    "subjectId": "s_gdcd",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 4,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 4,
    "subjectId": "s_van",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 4,
    "subjectId": "s_hdtn",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 4,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 4,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 4,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a9",
    "day": 2,
    "period": 5,
    "subjectId": "s_tin",
    "teacherId": "t_hoa"
  },
  {
    "classId": "c_6a10",
    "day": 2,
    "period": 5,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_6a11",
    "day": 2,
    "period": 5,
    "subjectId": "s_dia",
    "teacherId": "t_phương"
  },
  {
    "classId": "c_6a12",
    "day": 2,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_7b9",
    "day": 2,
    "period": 5,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b10",
    "day": 2,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_7b11",
    "day": 2,
    "period": 5,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_8c8",
    "day": 2,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_hưng"
  },
  {
    "classId": "c_8c9",
    "day": 2,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 5,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 5,
    "subjectId": "s_gdcd",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 5,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 5,
    "subjectId": "s_tin",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 2,
    "period": 6,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d8",
    "day": 2,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d9",
    "day": 2,
    "period": 6,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d10",
    "day": 2,
    "period": 6,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 4,
    "subjectId": "s_dia",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 4,
    "subjectId": "s_toan",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 4,
    "subjectId": "s_su",
    "teacherId": "t_thuận"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 4,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 4,
    "subjectId": "s_hdtn",
    "teacherId": "t_hưng"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 4,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 4,
    "subjectId": "s_toan",
    "teacherId": "t_hoàng"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 4,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 4,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_6a9",
    "day": 3,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_hoàn"
  },
  {
    "classId": "c_6a10",
    "day": 3,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 3,
    "period": 5,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a12",
    "day": 3,
    "period": 5,
    "subjectId": "s_gddp",
    "teacherId": "t_an"
  },
  {
    "classId": "c_7b9",
    "day": 3,
    "period": 5,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_7b10",
    "day": 3,
    "period": 5,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 5,
    "subjectId": "s_su",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 5,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 5,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_8c10",
    "day": 3,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_trung"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 5,
    "subjectId": "s_van",
    "teacherId": "t_kiên"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 5,
    "subjectId": "s_khtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 5,
    "subjectId": "s_toan",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_7b11",
    "day": 3,
    "period": 6,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_8c8",
    "day": 3,
    "period": 6,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_8c9",
    "day": 3,
    "period": 6,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d8",
    "day": 3,
    "period": 6,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_9d9",
    "day": 3,
    "period": 6,
    "subjectId": "s_hdtn",
    "teacherId": "t_an"
  },
  {
    "classId": "c_9d10",
    "day": 3,
    "period": 6,
    "subjectId": "s_gdcd",
    "teacherId": "t_thiện"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 4,
    "subjectId": "s_cn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 4,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 4,
    "subjectId": "s_tin",
    "teacherId": "t_hùng"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 4,
    "subjectId": "s_gdcd",
    "teacherId": "t_linh"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 4,
    "subjectId": "s_khtn",
    "teacherId": "t_hoàn"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 4,
    "subjectId": "s_hdtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_7b11",
    "day": 4,
    "period": 4,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 4,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 4,
    "subjectId": "s_toan",
    "teacherId": "t_huấn"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 4,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_9d8",
    "day": 4,
    "period": 4,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d9",
    "day": 4,
    "period": 4,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_9d10",
    "day": 4,
    "period": 4,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_6a9",
    "day": 4,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_hoàn"
  },
  {
    "classId": "c_6a10",
    "day": 4,
    "period": 5,
    "subjectId": "s_cn",
    "teacherId": "t_tú"
  },
  {
    "classId": "c_6a11",
    "day": 4,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_ngoan"
  },
  {
    "classId": "c_6a12",
    "day": 4,
    "period": 5,
    "subjectId": "s_gdtc",
    "teacherId": "t_tiến"
  },
  {
    "classId": "c_7b9",
    "day": 4,
    "period": 5,
    "subjectId": "s_mt",
    "teacherId": "t_lan"
  },
  {
    "classId": "c_7b10",
    "day": 4,
    "period": 5,
    "subjectId": "s_hdtn",
    "teacherId": "t_long"
  },
  {
    "classId": "c_8c8",
    "day": 4,
    "period": 5,
    "subjectId": "s_cn",
    "teacherId": "t_thiết"
  },
  {
    "classId": "c_8c9",
    "day": 4,
    "period": 5,
    "subjectId": "s_anh",
    "teacherId": "t_hương"
  },
  {
    "classId": "c_8c10",
    "day": 4,
    "period": 5,
    "subjectId": "s_nhac",
    "teacherId": "t_hặc"
  }
];

export const initialWeeklyTimetables: Record<number, { timetable: TimetableSlot[], unassigned: any[], weekType: 'all' | 'odd' | 'even' | 'custom' }> = {
  1: {
    timetable: initialSlots,
    unassigned: [],
    weekType: 'all'
  }
};
