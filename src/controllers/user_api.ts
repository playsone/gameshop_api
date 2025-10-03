// controllers/userController.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import bcrypt from "bcrypt";
import { User } from "../models/responses/usersModel";
import { getUsersByEmail_fn, getUsersByUsername_fn } from "./utilityFunctions";

/**
 * @route POST /api/register
 * @desc สมัครสมาชิก
 */
export const register_api = async (req: Request, res: Response) => {
    const { username, email, password, image } = req.body;
    try {
        const { isDuplicate: isEmailDuplicate } = await getUsersByEmail_fn(email);
        if (isEmailDuplicate) {
            return res.status(409).json({ message: "Email is already registered." });
        }
        const { isDuplicate: isUsernameDuplicate } = await getUsersByUsername_fn(username);
        if (isUsernameDuplicate) {
            return res.status(409).json({ message: "Username is already taken." });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        const [results]: any = await dbcon.query(
            "INSERT INTO users(username, email, password, image) VALUES (?, ?, ?, ?)",
            [username, email, passwordHash, image || null]
        );

        if (results.affectedRows > 0) {
            return res.status(201).json({ message: "Account created successfully.", user_id: results.insertId });
        }
        res.status(400).json({ message: "Failed to create account." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during registration.", error: onmessage });
    }
};

/**
 * @route POST /api/login
 * @desc Login (ค้นหาด้วย username)
 */
export const login_api = async (req: Request, res: Response) => {
    const { username, password } = req.body; // รับ username และ password
    try {
        const [results]: any = await dbcon.query(
            "SELECT user_id, password, role, username FROM users WHERE username = ?",
            [username] 
        );
        
        const userData = results[0] as (User | undefined);
        
        if (!userData) {
            return res.status(401).json({ message: "Invalid credentials (Username not found)." });
        }

        const isMatch = await bcrypt.compare(password, userData.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials (Password mismatch)." });
        }

        return res.status(200).json({
            message: "Login Success",
            user_id: userData.user_id,
            username: userData.username,
            role: userData.role,
            is_login: true,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error during login." });
    }
};

/**
 * @route PUT /api/users/:user_id
 * @desc แก้ไขข้อมูลผู้ใช้ / รูปโปรไฟล์
 */
export const updateUser_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    const { username, email, image } = req.body;
    
    try {
        const [results]: any = await dbcon.query(
            "UPDATE users SET username = ?, email = ?, image = ? WHERE user_id = ?",
            [username, email, image || null, user_id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "User not found or no changes made." });
        }
        
        return res.status(200).json({ message: "User information updated successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during update (e.g., username/email duplicate).", error: onmessage });
    }
};

/**
 * @route GET /api/users/:user_id/profile
 * @desc ดูข้อมูลผู้ใช้
 */
export const getUserProfile_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query(
            "SELECT user_id, username, email, image, wallet, role FROM users WHERE user_id = ?",
            [user_id]
        );
        const userData = rows as Omit<User, 'password'>[];

        if (userData.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        
        res.status(200).json(userData[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};
import { OkPacket, RowDataPacket } from 'mysql2'; // ต้องเพิ่ม Type นี้หากยังไม่มี

/**
 * @route GET /api/users
 * @desc ดึงข้อมูลผู้ใช้ทั้งหมด (เหมาะสำหรับ Admin/ทดสอบ)
 */
export const getAllUsers_api = async (req: Request, res: Response) => {
    try {
        // 📌 ใช้ RowDataPacket[] เพื่อให้ TypeScript รู้ว่า 'rows' เป็น Array ของข้อมูล
        const [rows] = await dbcon.query<RowDataPacket[]>(
            "SELECT user_id, username, email, image, wallet, role FROM users"
        );
        
        // rows.length จะถูกยอมรับ
        if (rows.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during fetching all users." });
    }
};