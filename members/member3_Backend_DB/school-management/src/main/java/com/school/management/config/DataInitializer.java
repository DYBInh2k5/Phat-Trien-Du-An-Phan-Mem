package com.school.management.config;

import com.school.management.entity.*;
import com.school.management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final GradeBookRepository gradeBookRepository;
    private final AttendanceRepository attendanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final TuitionRepository tuitionRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;

    public DataInitializer(UserRepository userRepository,
                           StudentRepository studentRepository,
                           GradeBookRepository gradeBookRepository,
                           AttendanceRepository attendanceRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           TuitionRepository tuitionRepository,
                           SchoolClassRepository schoolClassRepository,
                           SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.gradeBookRepository = gradeBookRepository;
        this.attendanceRepository = attendanceRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.tuitionRepository = tuitionRepository;
        this.schoolClassRepository = schoolClassRepository;
        this.subjectRepository = subjectRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Khoi tao Tai khoan Demo 5 Vai tro (neu chua co)
        if (userRepository.count() == 0) {
            userRepository.saveAll(Arrays.asList(
                new User("bgh.admin", "123", "Thầy Nguyễn Văn Ban (BGH)", "BGH", "bgh@hsu.edu.vn", "0901234567"),
                new User("gvcn.10a1", "123", "Cô Lê Minh Châu (GVCN 10A1)", "GVCN", "gvcn10a1@hsu.edu.vn", "0902345678"),
                new User("gv.toan", "123", "Thầy Trần Hoàng Nam (GV Toán)", "GV", "toan.nam@hsu.edu.vn", "0903456789"),
                new User("hs0001", "123", "Nguyễn Văn An (Học sinh)", "HS", "an.hs0001@student.hsu.edu.vn", "0904567890"),
                new User("ph.hs0001", "123", "Ông Nguyễn Văn Bình (Phụ huynh)", "PH", "binh.ph0001@gmail.com", "0905678901")
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao 5 tai khoan demo thanh cong.");
        }

        // 2. Khoi tao Lop hoc (neu chua co)
        if (schoolClassRepository.count() == 0) {
            schoolClassRepository.saveAll(Arrays.asList(
                new SchoolClass("10A1", 10, "Cô Lê Minh Châu", 40),
                new SchoolClass("10A2", 10, "Thầy Trần Hoàng Nam", 42),
                new SchoolClass("11A1", 11, "Thầy Nguyễn Văn Ban", 45)
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao danh muc lop hoc.");
        }

        // 3. Khoi tao Mon hoc (neu chua co)
        if (subjectRepository.count() == 0) {
            subjectRepository.saveAll(Arrays.asList(
                new Subject("MATH", "Toán Học", 1.0),
                new Subject("LIT", "Ngữ Văn", 1.0),
                new Subject("ENG", "Tiếng Anh", 1.0),
                new Subject("PHYS", "Vật Lý", 1.0),
                new Subject("CHEM", "Hóa Học", 1.0)
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao danh muc mon hoc.");
        }

        // 4. Khoi tao Danh sach Học sinh mẫu (neu chua co)
        if (studentRepository.count() == 0) {
            studentRepository.saveAll(Arrays.asList(
                new Student("HS-2024-001", "Nguyễn Văn An", "Nam", "15/04/2008", "10A1", "Nguyễn Văn Bình", "0905678901"),
                new Student("HS-2024-002", "Trần Thị Mai", "Nữ", "20/08/2008", "10A1", "Trần Văn Hùng", "0906789012"),
                new Student("HS-2024-003", "Lê Hoàng Bảo", "Nam", "10/11/2008", "10A1", "Lê Văn Đức", "0907890123"),
                new Student("HS-2024-004", "Phạm Minh Dung", "Nữ", "05/02/2008", "10A1", "Phạm Văn Quang", "0908901234")
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao 4 hoc sinh lop 10A1 thanh cong.");
        }

        // 5. Khoi tao So diem mẫu TT22 (neu chua co)
        if (gradeBookRepository.count() == 0) {
            gradeBookRepository.saveAll(Arrays.asList(
                new GradeBook("HS-2024-001", "Nguyễn Văn An", "10A1", "Toán", "HK1", "2024-2025", 9.0, 8.5, 9.0, 8.5, 9.0),
                new GradeBook("HS-2024-001", "Nguyễn Văn An", "10A1", "Văn", "HK1", "2024-2025", 8.0, 7.5, 8.0, 8.0, 8.5),
                new GradeBook("HS-2024-001", "Nguyễn Văn An", "10A1", "Tiếng Anh", "HK1", "2024-2025", 9.5, 9.0, 9.5, 9.0, 9.5),
                new GradeBook("HS-2024-002", "Trần Thị Mai", "10A1", "Toán", "HK1", "2024-2025", 8.5, 9.0, 8.5, 9.0, 8.5)
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao so diem mau thanh cong.");
        }

        // 6. Khoi tao Diem danh mẫu (neu chua co)
        if (attendanceRepository.count() == 0) {
            attendanceRepository.saveAll(Arrays.asList(
                new Attendance("HS-2024-001", "Nguyễn Văn An", "10A1", "2026-09-29", "PRESENT", "Đi học đúng giờ"),
                new Attendance("HS-2024-002", "Trần Thị Mai", "10A1", "2026-09-29", "PRESENT", "Đi học đúng giờ"),
                new Attendance("HS-2024-003", "Lê Hoàng Bảo", "10A1", "2026-09-29", "ABSENT_PERMIT", "Đã nộp đơn xin nghỉ có phép"),
                new Attendance("HS-2024-004", "Phạm Minh Dung", "10A1", "2026-09-29", "PRESENT", "Đi học đúng giờ")
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao du lieu diem danh mau thanh cong.");
        }

        // 7. Khoi tao Don xin nghi hoc mau (neu chua co)
        if (leaveRequestRepository.count() == 0) {
            leaveRequestRepository.saveAll(Arrays.asList(
                new LeaveRequest("HS-2024-003", "Lê Hoàng Bảo", "10A1", "Em bị sốt cao cần đi khám bệnh", "2026-09-29", "2026-09-29", "APPROVED", "2026-09-28 20:15:00")
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao don xin nghi hoc mau.");
        }

        // 8. Khoi tao Hoc phi mau (neu chua co)
        if (tuitionRepository.count() == 0) {
            tuitionRepository.saveAll(Arrays.asList(
                new Tuition("HS-2024-001", "Nguyễn Văn An", "10A1", "HK1", "2024-2025", 2500000.0, 2500000.0, "PAID", "BL-2024-8891")
            ));
            System.out.println("[PostgreSQL DataInitializer] Da khoi tao du lieu hoc phi mau.");
        }
    }
}
