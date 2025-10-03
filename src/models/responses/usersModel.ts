// Users Model
export interface User {
    user_id: number;
    username: string;
    email: string;
    password: string; // ควรระมัดระวังในการส่งรหัสผ่าน อาจใช้ DTOs (Data Transfer Objects) สำหรับการตอบกลับที่ไม่รวมรหัสผ่าน
    image: string | null; // VARCHAR(255) - สามารถเป็น null ได้ถ้าไม่ระบุ
    wallet: number; // DECIMAL(12,2)
    role: 0 | 1; // TINYINT(1) - 0 = USER, 1 = ADMIN
}