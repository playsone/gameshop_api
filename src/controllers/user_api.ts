// controllers/user_api.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import bcrypt from "bcrypt";
import { RowDataPacket, OkPacket } from 'mysql2';
// 💡 ต้อง Import Utility Functions
import { getUsersByEmail_fn, getUsersByUsername_fn, getUsersById_fn } from "./utilityFunctions";
import { User } from "../models/responses/usersModel";


// --- 1.1 สมัครสมาชิก ---
export const register_api = async (req: Request, res: Response) => {
    const { username, email, password, image } = req.body;
    try {
        const { isDuplicate: isEmailDuplicate } = await getUsersByEmail_fn(email);
        if (isEmailDuplicate) return res.status(409).json({ message: "Email is already registered." });
        
        const { isDuplicate: isUsernameDuplicate } = await getUsersByUsername_fn(username);
        if (isUsernameDuplicate) return res.status(409).json({ message: "Username is already taken." });

        const passwordHash = await bcrypt.hash(password, 10);
        
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO users(username, email, password, image) VALUES (?, ?, ?, ?)", // 💡 กำหนด role default เป็น 'user'
            [username, email, passwordHash, image || null]
        );

        if (results.affectedRows > 0) {
            return res.status(201).json({ message: "Account created successfully.", user_id: results.insertId });
        }
        res.status(400).json({ message: "Failed to create account." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during registration.", error: err.message });
    }
};

// --- 1.3 Login แยกสิทธิ์ ---
export const login_api = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const { user: userData } = await getUsersByUsername_fn(username);
        
        if (!userData) return res.status(401).json({ message: "Invalid credentials (Username not found)." });

        const isMatch = await bcrypt.compare(password, userData.password);
        
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials (Password mismatch)." });

        // 💡 (1.4) ในระบบจริงจะสร้าง JWT/Session ที่นี่
        return res.status(200).json({
            message: "Login Success",
            user_id: userData.user_id,
            username: userData.username,
            role: userData.role,
            // token: 'YourGeneratedJWT', // ตัวอย่างสำหรับ Session/Authorization
            is_login: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login." });
    }
};

// --- 1.2 แก้ไขข้อมูลผู้ใช้ / รูปโปรไฟล์ (User/Admin) ---
// 💡 Note: สำหรับการอัปโหลดไฟล์จริง ต้องใช้ middleware เช่น multer
export const updateUser_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    // 💡 สมมติว่าไฟล์ถูกจัดการและส่ง path/URL ของ image มาใน req.body
    const { username, email, image } = req.body; 
    
    try {
        const [results] = await dbcon.query<OkPacket>(
            "UPDATE users SET username = ?, email = ?, image = ? WHERE user_id = ?",
            [username, email, image || null, user_id]
        );

        if (results.affectedRows === 0) return res.status(404).json({ message: "User not found or no changes made." });
        
        return res.status(200).json({ message: "User information updated successfully." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during update (e.g., username/email duplicate).", error: err.message });
    }
};

// --- 1.2, 1.3 ดูข้อมูลผู้ใช้ ---
export const getUserProfile_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            "SELECT user_id, username, email, image, wallet, role FROM users WHERE user_id = ?",
            [user_id]
        );

        if (rows.length === 0) return res.status(404).json({ message: "User not found." });
        
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Admin: ดึงข้อมูลผู้ใช้ทั้งหมด ---
export const getAllUsers_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            "SELECT user_id, username, email, image, wallet, role FROM users"
        );
        
        if (rows.length === 0) return res.status(404).json({ message: "No users found." });
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during fetching all users." });
    }
};

// --- ดึงข้อมูลผู้ใช้ด้วย ID (ใช้ Utility) ---
export const getUsersById_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const userData = await getUsersById_fn(user_id);
        if (!userData) return res.status(404).json({ message: "User not found." });
        
        const { password, ...safeData } = userData; 
        res.status(200).json(safeData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- ดึงข้อมูลผู้ใช้ด้วย Email (ใช้ Utility) ---
export const getUserByEmail_api = async (req: Request, res: Response) => {
    const email = req.params.email;
    try {
        const { user: userData } = await getUsersByEmail_fn(email);
        if (!userData) return res.status(404).json({ message: "User not found." });
        
        const { password, ...safeData } = userData; 
        res.status(200).json(safeData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- System Management (สำหรับ Admin) ---

// 💡 NEW: ฟังก์ชัน Reset Database
export const reset_api = async (req: Request, res: Response) => {
    try {
        // ⚠️ คำเตือน: โค้ดนี้จะล้างข้อมูลทั้งหมด!
        await dbcon.query("SET FOREIGN_KEY_CHECKS = 0;");
        await dbcon.query("TRUNCATE TABLE usersgamelibrary;");
        await dbcon.query("TRUNCATE TABLE gametransaction;");
        await dbcon.query("TRUNCATE TABLE wallettransaction;");
        await dbcon.query("TRUNCATE TABLE basket;");
        await dbcon.query("TRUNCATE TABLE discountcode;");
        await dbcon.query("TRUNCATE TABLE game;");
        await dbcon.query("TRUNCATE TABLE gametype;");
        await dbcon.query("TRUNCATE TABLE users;");
        await dbcon.query("SET FOREIGN_KEY_CHECKS = 1;");

        return res.status(200).json({ message: "✅ All tables truncated and system reset successfully." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "❌ Error during database reset.", error: err.message });
    }
};

// 💡 NEW: ฟังก์ชัน Setup Database (ต้องมีการรัน init.sql ใน backend)
export const setupDB_api = async (req: Request, res: Response) => {
     // 💡 ในระบบจริง ควรจะโหลดและรันไฟล์ SQL ที่สร้างตาราง (ตามที่เคยเห็นใน init.sql)
    return res.status(501).json({ 
        message: "⚠️ This function requires running SQL script. Implement the logic to execute init.sql here." 
    });
};