/**
 * mockData.js — Static mock data for EduManage Pro
 *
 * All data conforms to the interfaces defined in design.md.
 * Replace with real API calls when backend is available.
 */

// ─── Subjects ────────────────────────────────────────────────────────────────

export const subjects = [
  { id: 'TOAN',   name: 'Toán' },
  { id: 'VAN',    name: 'Ngữ văn' },
  { id: 'ANH',    name: 'Tiếng Anh' },
  { id: 'LY',     name: 'Vật lý' },
  { id: 'HOA',    name: 'Hóa học' },
  { id: 'SINH',   name: 'Sinh học' },
  { id: 'SU',     name: 'Lịch sử' },
  { id: 'DIA',    name: 'Địa lý' },
  { id: 'GDCD',   name: 'GDCD' },
  { id: 'THE',    name: 'Thể dục' },
];

// ─── Classes ─────────────────────────────────────────────────────────────────

export const classes = [
  { id: '10A1', name: '10A1', gradeLevel: 10, gvcnId: 'GV003' },
  { id: '10A2', name: '10A2', gradeLevel: 10, gvcnId: 'GV004' },
  { id: '11B1', name: '11B1', gradeLevel: 11, gvcnId: 'GV005' },
  { id: '11B2', name: '11B2', gradeLevel: 11, gvcnId: null },
  { id: '12C1', name: '12C1', gradeLevel: 12, gvcnId: null },
];

// ─── Teachers ────────────────────────────────────────────────────────────────

export const teachers = [
  { id: 'GV001', name: 'Nguyễn Văn An',    subject: 'Toán',       email: 'an.nv@school.edu.vn',    isGvcn: false, classId: null   },
  { id: 'GV002', name: 'Trần Thị Bình',    subject: 'Ngữ văn',    email: 'binh.tt@school.edu.vn',  isGvcn: false, classId: null   },
  { id: 'GV003', name: 'Lê Minh Châu',     subject: 'Tiếng Anh',  email: 'chau.lm@school.edu.vn',  isGvcn: true,  classId: '10A1' },
  { id: 'GV004', name: 'Phạm Thị Dung',    subject: 'Vật lý',     email: 'dung.pt@school.edu.vn',  isGvcn: true,  classId: '10A2' },
  { id: 'GV005', name: 'Hoàng Văn Em',     subject: 'Hóa học',    email: 'em.hv@school.edu.vn',    isGvcn: true,  classId: '11B1' },
  { id: 'GV006', name: 'Vũ Thị Phương',    subject: 'Sinh học',   email: 'phuong.vt@school.edu.vn', isGvcn: false, classId: null  },
  { id: 'GV007', name: 'Đặng Quốc Hùng',  subject: 'Lịch sử',    email: 'hung.dq@school.edu.vn',  isGvcn: false, classId: null   },
  { id: 'GV008', name: 'Bùi Thị Lan',     subject: 'Địa lý',     email: 'lan.bt@school.edu.vn',   isGvcn: false, classId: null   },
];

// ─── Students ────────────────────────────────────────────────────────────────
// 15 students: 6 in 10A1, 5 in 10A2, 4 in 11B1

export const students = [
  // 10A1 — 6 students
  { id: 'HS001', name: 'Nguyễn Thị Ánh',    classId: '10A1', status: 'active'   },
  { id: 'HS002', name: 'Trần Văn Bảo',      classId: '10A1', status: 'active'   },
  { id: 'HS003', name: 'Lê Thị Cẩm',        classId: '10A1', status: 'active'   },
  { id: 'HS004', name: 'Phạm Hữu Dũng',     classId: '10A1', status: 'active'   },
  { id: 'HS005', name: 'Hoàng Thị Emmi',    classId: '10A1', status: 'inactive' },
  { id: 'HS006', name: 'Vũ Quang Phát',     classId: '10A1', status: 'active'   },

  // 10A2 — 5 students
  { id: 'HS007', name: 'Đặng Thị Giang',    classId: '10A2', status: 'active'   },
  { id: 'HS008', name: 'Bùi Văn Hải',       classId: '10A2', status: 'active'   },
  { id: 'HS009', name: 'Ngô Thị Hoa',       classId: '10A2', status: 'active'   },
  { id: 'HS010', name: 'Đinh Quốc Khải',    classId: '10A2', status: 'reserved' },
  { id: 'HS011', name: 'Lý Thị Lan',        classId: '10A2', status: 'active'   },

  // 11B1 — 4 students
  { id: 'HS012', name: 'Mai Văn Minh',       classId: '11B1', status: 'active'   },
  { id: 'HS013', name: 'Tô Thị Ngọc',       classId: '11B1', status: 'active'   },
  { id: 'HS014', name: 'Phan Văn Phong',    classId: '11B1', status: 'active'   },
  { id: 'HS015', name: 'Cao Thị Quỳnh',     classId: '11B1', status: 'inactive' },
];

// ─── Grade Entries ────────────────────────────────────────────────────────────
// Grade entries for students in 10A1, semester 1, academic year 2024-2025.
// Includes failing (<5.0) and excellent (>=8.0) grades for UI color-coding tests.

export const grades = [
  // HS001 — Nguyễn Thị Ánh (strong student)
  { studentId: 'HS001', subjectId: 'TOAN', semester: 1, academicYear: '2024-2025',
    scores: { oral: [9, 8],      test15min: [8.5, 9],   test45min: [8],   semester: 8.5, average: 8.6 } },
  { studentId: 'HS001', subjectId: 'VAN',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [8, 7],      test15min: [7.5],       test45min: [8],   semester: 8.0, average: 7.9 } },
  { studentId: 'HS001', subjectId: 'ANH',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [9, 9.5],    test15min: [9],         test45min: [9.5], semester: 9.0, average: 9.2 } },
  { studentId: 'HS001', subjectId: 'LY',   semester: 1, academicYear: '2024-2025',
    scores: { oral: [7],         test15min: [7.5, 8],    test45min: [7],   semester: 7.5, average: 7.5 } },
  { studentId: 'HS001', subjectId: 'HOA',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [8],         test15min: [8, 8.5],    test45min: [8.5], semester: 8.0, average: 8.2 } },

  // HS002 — Trần Văn Bảo (average student)
  { studentId: 'HS002', subjectId: 'TOAN', semester: 1, academicYear: '2024-2025',
    scores: { oral: [6, 5],      test15min: [5.5, 6],   test45min: [6],   semester: 6.0, average: 5.9 } },
  { studentId: 'HS002', subjectId: 'VAN',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [7, 6.5],    test15min: [6],         test45min: [7],   semester: 6.5, average: 6.6 } },
  { studentId: 'HS002', subjectId: 'ANH',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [5, 5.5],    test15min: [5],         test45min: [5.5], semester: 5.5, average: 5.4 } },
  { studentId: 'HS002', subjectId: 'LY',   semester: 1, academicYear: '2024-2025',
    scores: { oral: [6],         test15min: [6, 6.5],    test45min: [6],   semester: 6.0, average: 6.1 } },
  { studentId: 'HS002', subjectId: 'HOA',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [5],         test15min: [5.5, 5],    test45min: [5],   semester: 5.0, average: 5.1 } },

  // HS003 — Lê Thị Cẩm (struggling student — has grades < 5)
  { studentId: 'HS003', subjectId: 'TOAN', semester: 1, academicYear: '2024-2025',
    scores: { oral: [4, 3.5],    test15min: [4, 3],     test45min: [4.5], semester: 4.0, average: 3.9 } },
  { studentId: 'HS003', subjectId: 'VAN',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [5, 4.5],    test15min: [5],         test45min: [5],   semester: 5.0, average: 4.9 } },
  { studentId: 'HS003', subjectId: 'ANH',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [3, 4],      test15min: [3.5],       test45min: [4],   semester: 3.5, average: 3.6 } },
  { studentId: 'HS003', subjectId: 'LY',   semester: 1, academicYear: '2024-2025',
    scores: { oral: [5],         test15min: [4.5, 5],    test45min: [5],   semester: 5.0, average: 4.9 } },
  { studentId: 'HS003', subjectId: 'HOA',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [4],         test15min: [4, 4.5],    test45min: [4],   semester: 4.0, average: 4.1 } },

  // HS004 — Phạm Hữu Dũng (good student)
  { studentId: 'HS004', subjectId: 'TOAN', semester: 1, academicYear: '2024-2025',
    scores: { oral: [8, 8.5],    test15min: [8, 9],     test45min: [8.5], semester: 8.5, average: 8.5 } },
  { studentId: 'HS004', subjectId: 'VAN',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [7, 7.5],    test15min: [7],         test45min: [7.5], semester: 7.0, average: 7.2 } },
  { studentId: 'HS004', subjectId: 'ANH',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [6, 7],      test15min: [7],         test45min: [7],   semester: 7.0, average: 6.9 } },
  { studentId: 'HS004', subjectId: 'LY',   semester: 1, academicYear: '2024-2025',
    scores: { oral: [9],         test15min: [9, 8.5],    test45min: [9],   semester: 9.5, average: 9.2 } },
  { studentId: 'HS004', subjectId: 'HOA',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [7],         test15min: [7.5, 8],    test45min: [7.5], semester: 8.0, average: 7.8 } },

  // HS006 — Vũ Quang Phát (mixed performance)
  { studentId: 'HS006', subjectId: 'TOAN', semester: 1, academicYear: '2024-2025',
    scores: { oral: [5, 6],      test15min: [5.5, 5],   test45min: [5.5], semester: 5.5, average: 5.5 } },
  { studentId: 'HS006', subjectId: 'VAN',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [8, 8.5],    test15min: [8],         test45min: [8.5], semester: 8.5, average: 8.4 } },
  { studentId: 'HS006', subjectId: 'ANH',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [4, 4.5],    test15min: [4],         test45min: [4.5], semester: 4.5, average: 4.4 } },
  { studentId: 'HS006', subjectId: 'LY',   semester: 1, academicYear: '2024-2025',
    scores: { oral: [6],         test15min: [6.5, 6],    test45min: [6.5], semester: 6.5, average: 6.4 } },
  { studentId: 'HS006', subjectId: 'HOA',  semester: 1, academicYear: '2024-2025',
    scores: { oral: [5],         test15min: [5.5, 5],    test45min: [5],   semester: 5.0, average: 5.1 } },
];

// ─── Attendance Records ───────────────────────────────────────────────────────
// 2 recent dates for classes 10A1 and 10A2.
// Includes absences so BGH attendance monitor can show < 80% rows.

export const attendanceRecords = [
  // 10A1 — 2024-11-13 (Wednesday): 4 present, 1 late, 1 absent → 83% chuyên cần
  {
    classId: '10A1',
    date: '2024-11-13',
    teacherId: 'GV003',
    entries: [
      { studentId: 'HS001', status: 'present' },
      { studentId: 'HS002', status: 'present' },
      { studentId: 'HS003', status: 'absent'  },
      { studentId: 'HS004', status: 'present' },
      { studentId: 'HS005', status: 'late'    },
      { studentId: 'HS006', status: 'present' },
    ],
  },

  // 10A1 — 2024-11-14 (Thursday): 3 present, 1 late, 2 absent → 67% chuyên cần (dưới 80%)
  {
    classId: '10A1',
    date: '2024-11-14',
    teacherId: 'GV001',
    entries: [
      { studentId: 'HS001', status: 'present' },
      { studentId: 'HS002', status: 'absent'  },
      { studentId: 'HS003', status: 'absent'  },
      { studentId: 'HS004', status: 'present' },
      { studentId: 'HS005', status: 'late'    },
      { studentId: 'HS006', status: 'present' },
    ],
  },

  // 10A2 — 2024-11-13: 5 present → 100%
  {
    classId: '10A2',
    date: '2024-11-13',
    teacherId: 'GV004',
    entries: [
      { studentId: 'HS007', status: 'present' },
      { studentId: 'HS008', status: 'present' },
      { studentId: 'HS009', status: 'present' },
      { studentId: 'HS010', status: 'present' },
      { studentId: 'HS011', status: 'present' },
    ],
  },

  // 10A2 — 2024-11-14: 2 present, 1 late, 2 absent → 60% chuyên cần (dưới 80%)
  {
    classId: '10A2',
    date: '2024-11-14',
    teacherId: 'GV004',
    entries: [
      { studentId: 'HS007', status: 'present' },
      { studentId: 'HS008', status: 'absent'  },
      { studentId: 'HS009', status: 'late'    },
      { studentId: 'HS010', status: 'absent'  },
      { studentId: 'HS011', status: 'present' },
    ],
  },

  // 11B1 — 2024-11-13: 3 present, 1 absent → 75% (dưới 80%)
  {
    classId: '11B1',
    date: '2024-11-13',
    teacherId: 'GV005',
    entries: [
      { studentId: 'HS012', status: 'present' },
      { studentId: 'HS013', status: 'absent'  },
      { studentId: 'HS014', status: 'present' },
      { studentId: 'HS015', status: 'present' },
    ],
  },
];

// ─── Timetable Slots ─────────────────────────────────────────────────────────
// Week of 2024-11-11 (Mon–Fri) for classes 10A1 and 10A2.
// timeRange format: 'HH:MM – HH:MM' (each period = 45 min, break between)

const PERIOD_TIMES = {
  1:  '07:00 – 07:45',
  2:  '07:50 – 08:35',
  3:  '08:40 – 09:25',
  4:  '09:35 – 10:20',
  5:  '10:25 – 11:10',
  6:  '13:00 – 13:45',
  7:  '13:50 – 14:35',
  8:  '14:40 – 15:25',
  9:  '15:30 – 16:15',
  10: '16:20 – 17:05',
};

export const timetableSlots = [
  // ── 10A1 — Week 2024-11-11 ──────────────────────────────────────────────

  // Monday (dayOfWeek: 1)
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 1, period: 1,  subjectName: 'Toán',        teacherName: 'Nguyễn Văn An',   room: 'P201', timeRange: PERIOD_TIMES[1]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 1, period: 2,  subjectName: 'Ngữ văn',     teacherName: 'Trần Thị Bình',   room: 'P201', timeRange: PERIOD_TIMES[2]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 1, period: 3,  subjectName: 'Tiếng Anh',   teacherName: 'Lê Minh Châu',    room: 'P201', timeRange: PERIOD_TIMES[3]  },

  // Tuesday (dayOfWeek: 2)
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 2, period: 1,  subjectName: 'Vật lý',      teacherName: 'Phạm Thị Dung',   room: 'P301', timeRange: PERIOD_TIMES[1]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 2, period: 2,  subjectName: 'Hóa học',     teacherName: 'Hoàng Văn Em',    room: 'PTN1', timeRange: PERIOD_TIMES[2]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 2, period: 3,  subjectName: 'Sinh học',    teacherName: 'Vũ Thị Phương',   room: 'PTN2', timeRange: PERIOD_TIMES[3]  },

  // Wednesday (dayOfWeek: 3)
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 3, period: 1,  subjectName: 'Toán',        teacherName: 'Nguyễn Văn An',   room: 'P201', timeRange: PERIOD_TIMES[1]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 3, period: 2,  subjectName: 'Lịch sử',     teacherName: 'Đặng Quốc Hùng', room: 'P201', timeRange: PERIOD_TIMES[2]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 3, period: 4,  subjectName: 'Địa lý',      teacherName: 'Bùi Thị Lan',     room: 'P201', timeRange: PERIOD_TIMES[4]  },

  // Thursday (dayOfWeek: 4)
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 4, period: 1,  subjectName: 'Tiếng Anh',   teacherName: 'Lê Minh Châu',    room: 'P201', timeRange: PERIOD_TIMES[1]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 4, period: 2,  subjectName: 'Hóa học',     teacherName: 'Hoàng Văn Em',    room: 'PTN1', timeRange: PERIOD_TIMES[2]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 4, period: 3,  subjectName: 'Vật lý',      teacherName: 'Phạm Thị Dung',   room: 'P301', timeRange: PERIOD_TIMES[3]  },

  // Friday (dayOfWeek: 5)
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 5, period: 1,  subjectName: 'Ngữ văn',     teacherName: 'Trần Thị Bình',   room: 'P201', timeRange: PERIOD_TIMES[1]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 5, period: 2,  subjectName: 'Sinh học',    teacherName: 'Vũ Thị Phương',   room: 'PTN2', timeRange: PERIOD_TIMES[2]  },
  { classId: '10A1', weekStart: '2024-11-11', dayOfWeek: 5, period: 6,  subjectName: 'Thể dục',     teacherName: 'Nguyễn Văn An',   room: 'SG',   timeRange: PERIOD_TIMES[6]  },

  // ── 10A2 — Week 2024-11-11 ──────────────────────────────────────────────

  // Monday (dayOfWeek: 1) — same teachers, different rooms/times
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 1, period: 4,  subjectName: 'Toán',        teacherName: 'Nguyễn Văn An',   room: 'P202', timeRange: PERIOD_TIMES[4]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 1, period: 5,  subjectName: 'Ngữ văn',     teacherName: 'Trần Thị Bình',   room: 'P202', timeRange: PERIOD_TIMES[5]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 1, period: 6,  subjectName: 'Tiếng Anh',   teacherName: 'Lê Minh Châu',    room: 'P202', timeRange: PERIOD_TIMES[6]  },

  // Tuesday (dayOfWeek: 2)
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 2, period: 4,  subjectName: 'Hóa học',     teacherName: 'Hoàng Văn Em',    room: 'PTN2', timeRange: PERIOD_TIMES[4]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 2, period: 5,  subjectName: 'Sinh học',    teacherName: 'Vũ Thị Phương',   room: 'P202', timeRange: PERIOD_TIMES[5]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 2, period: 6,  subjectName: 'Vật lý',      teacherName: 'Phạm Thị Dung',   room: 'P302', timeRange: PERIOD_TIMES[6]  },

  // Wednesday (dayOfWeek: 3)
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 3, period: 4,  subjectName: 'Lịch sử',     teacherName: 'Đặng Quốc Hùng', room: 'P202', timeRange: PERIOD_TIMES[4]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 3, period: 5,  subjectName: 'Địa lý',      teacherName: 'Bùi Thị Lan',     room: 'P202', timeRange: PERIOD_TIMES[5]  },

  // Thursday (dayOfWeek: 4)
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 4, period: 4,  subjectName: 'Toán',        teacherName: 'Nguyễn Văn An',   room: 'P202', timeRange: PERIOD_TIMES[4]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 4, period: 5,  subjectName: 'Tiếng Anh',   teacherName: 'Lê Minh Châu',    room: 'P202', timeRange: PERIOD_TIMES[5]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 4, period: 6,  subjectName: 'Vật lý',      teacherName: 'Phạm Thị Dung',   room: 'P302', timeRange: PERIOD_TIMES[6]  },

  // Friday (dayOfWeek: 5)
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 5, period: 4,  subjectName: 'Ngữ văn',     teacherName: 'Trần Thị Bình',   room: 'P202', timeRange: PERIOD_TIMES[4]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 5, period: 5,  subjectName: 'Hóa học',     teacherName: 'Hoàng Văn Em',    room: 'PTN2', timeRange: PERIOD_TIMES[5]  },
  { classId: '10A2', weekStart: '2024-11-11', dayOfWeek: 5, period: 7,  subjectName: 'Thể dục',     teacherName: 'Đặng Quốc Hùng', room: 'SG',   timeRange: PERIOD_TIMES[7]  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const notifications = [
  {
    id: 'NTF001',
    title: 'Thông báo lịch thi học kỳ 1 năm học 2024-2025',
    content: 'Ban giám hiệu thông báo lịch thi học kỳ 1 như sau: từ ngày 16/12/2024 đến 25/12/2024. Đề nghị các lớp chuẩn bị đầy đủ.',
    type: 'academic',
    senderId: 'GV_BGH01',
    recipients: ['10A1', '10A2', '11B1'],
    sentAt: '2024-11-10T08:00:00.000Z',
    status: 'read',
  },
  {
    id: 'NTF002',
    title: 'Thông báo học sinh vắng mặt không phép',
    content: 'Học sinh Lê Thị Cẩm (HS003 - Lớp 10A1) đã vắng mặt không phép ngày 14/11/2024. Đề nghị phụ huynh liên hệ GVCN để xác nhận.',
    type: 'absence',
    senderId: 'GV003',
    recipients: ['HS003_PH'],
    sentAt: '2024-11-14T09:30:00.000Z',
    status: 'sent',
  },
  {
    id: 'NTF003',
    title: 'Họp phụ huynh học sinh cuối học kỳ 1',
    content: 'Trường tổ chức họp phụ huynh toàn trường vào ngày 28/12/2024 lúc 8h00 sáng tại hội trường lớn. Kính mời quý phụ huynh tham dự đầy đủ.',
    type: 'event',
    senderId: 'GV_BGH01',
    recipients: ['10A1', '10A2', '11B1', '11B2', '12C1'],
    sentAt: '2024-11-12T07:00:00.000Z',
    status: 'pending',
  },
  {
    id: 'NTF004',
    title: 'Thông báo điểm kiểm tra 1 tiết Toán - Lớp 10A1',
    content: 'Điểm kiểm tra 1 tiết môn Toán ngày 08/11/2024 đã được cập nhật vào hệ thống. Phụ huynh và học sinh có thể xem điểm trực tiếp trên phần mềm.',
    type: 'academic',
    senderId: 'GV001',
    recipients: ['10A1'],
    sentAt: '2024-11-13T14:00:00.000Z',
    status: 'read',
  },
  {
    id: 'NTF005',
    title: 'Thông báo chung: Ngày nghỉ lễ 20/11',
    content: 'Nhân ngày Nhà giáo Việt Nam 20/11/2024, trường sẽ tổ chức lễ kỷ niệm vào buổi sáng. Học sinh đến trường theo lịch bình thường, không có tiết học buổi sáng.',
    type: 'general',
    senderId: 'GV_BGH01',
    recipients: ['10A1', '10A2', '11B1', '11B2', '12C1'],
    sentAt: '2024-11-15T16:00:00.000Z',
    status: 'sent',
  },
];

// ─── User Accounts ────────────────────────────────────────────────────────────

export const userAccounts = [
  {
    id: 'USR001',
    name: 'Nguyễn Văn An',
    username: 'an.nv',
    email: 'an.nv@school.edu.vn',
    role: 'GV',
    isActive: true,
    createdAt: '2023-08-01T00:00:00.000Z',
  },
  {
    id: 'USR002',
    name: 'Trần Thị Bình',
    username: 'binh.tt',
    email: 'binh.tt@school.edu.vn',
    role: 'GV',
    isActive: true,
    createdAt: '2023-08-01T00:00:00.000Z',
  },
  {
    id: 'USR003',
    name: 'Lê Minh Châu',
    username: 'chau.lm',
    email: 'chau.lm@school.edu.vn',
    role: 'GVCN',
    isActive: true,
    createdAt: '2022-08-15T00:00:00.000Z',
  },
  {
    id: 'USR004',
    name: 'Hiệu trưởng Trần Quốc Bảo',
    username: 'bao.tq.bgh',
    email: 'bao.tq@school.edu.vn',
    role: 'BGH',
    isActive: true,
    createdAt: '2020-01-10T00:00:00.000Z',
  },
  {
    id: 'USR005',
    name: 'Nguyễn Thị Hương (PH HS001)',
    username: 'huong.nt.ph',
    email: 'huong.nt.ph@gmail.com',
    role: 'PH',
    isActive: true,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
  {
    id: 'USR006',
    name: 'Nguyễn Thị Ánh',
    username: 'anh.nt.hs',
    email: 'anh.nt.hs@student.school.edu.vn',
    role: 'HS',
    isActive: true,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
];

// ─── BGH Attendance Summary (derived data for BGH monitor) ──────────────────
// Pre-computed summary rows for BGHAttendanceMonitorPage.
// Rows with tileChuyenCan < 80 will trigger warning highlight.

export const bghAttendanceSummary = [
  { classId: '10A1', className: '10A1', gvcnName: 'Lê Minh Châu',    totalStudents: 6, tileChuyenCan: 67, soHSduoiNguong: 2 },
  { classId: '10A2', className: '10A2', gvcnName: 'Phạm Thị Dung',   totalStudents: 5, tileChuyenCan: 60, soHSduoiNguong: 2 },
  { classId: '11B1', className: '11B1', gvcnName: 'Hoàng Văn Em',    totalStudents: 4, tileChuyenCan: 75, soHSduoiNguong: 1 },
  { classId: '11B2', className: '11B2', gvcnName: 'N/A',              totalStudents: 5, tileChuyenCan: 90, soHSduoiNguong: 0 },
  { classId: '12C1', className: '12C1', gvcnName: 'N/A',              totalStudents: 4, tileChuyenCan: 85, soHSduoiNguong: 0 },
];

// --- Grade Book Closure Status ---
// status: 'pending' | 'submitted' | 'approved' | 'locked'

export const gradeBookStatus = [
  { classId: '10A1', className: '10A1', gvcnName: 'Lê Minh Châu',    submittedAt: '2024-11-14T10:30:00Z', approvedAt: '2024-11-15T08:00:00Z', status: 'approved'  },
  { classId: '10A2', className: '10A2', gvcnName: 'Phạm Thị Dung',   submittedAt: '2024-11-14T11:00:00Z', approvedAt: null,                   status: 'submitted' },
  { classId: '11B1', className: '11B1', gvcnName: 'Hoàng Văn Em',    submittedAt: '2024-11-13T16:45:00Z', approvedAt: '2024-11-15T08:30:00Z', status: 'approved'  },
  { classId: '11B2', className: '11B2', gvcnName: 'N/A',                        submittedAt: null,                   approvedAt: null,                   status: 'pending'   },
  { classId: '12C1', className: '12C1', gvcnName: 'N/A',                        submittedAt: null,                   approvedAt: null,                   status: 'pending'   },
];
