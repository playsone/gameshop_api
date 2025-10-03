// controllers/utilityFunctions.ts
import { dbcon } from "../database/pool";
import { User } from "../models/responses/usersModel";
import { Game } from "../models/responses/gameModel";


// ดูข้อมูลผู้ใช้โดย user_id
export async function getUsersById_fn(user_id: number): Promise<User | undefined> {
    try {
        const [rows] = await dbcon.query("SELECT * FROM users WHERE user_id = ?", [user_id]);
        const usersData = rows as User[];
        return usersData.length > 0 ? usersData[0] : undefined;
    } catch (err) {
        throw err;
    }
}

// ตรวจสอบ User โดย Email (สำหรับ Register)
export async function getUsersByEmail_fn(email: string): Promise<{ user?: User, isDuplicate: boolean }> {
    try {
        const [rows] = await dbcon.query("SELECT * FROM users WHERE email = ?", [email]);
        const userData = rows as User[];
        return {
            user: userData.length > 0 ? userData[0] : undefined,
            isDuplicate: userData.length > 0,
        };
    } catch (err) {
        throw err;
    }
}

// ตรวจสอบ User โดย Username (สำหรับ Register และ Login)
export async function getUsersByUsername_fn(username: string): Promise<{ user?: User, isDuplicate: boolean }> {
    try {
        const [rows] = await dbcon.query("SELECT * FROM users WHERE username = ?", [username]);
        const userData = rows as User[];
        return {
            user: userData.length > 0 ? userData[0] : undefined,
            isDuplicate: userData.length > 0,
        };
    } catch (err) {
        throw err;
    }
}

// ดูข้อมูลเกมโดย game_id
export async function getGameById_fn(game_id: number): Promise<Game | undefined> {
    try {
        const [rows] = await dbcon.query("SELECT * FROM game WHERE game_id = ?", [game_id]);
        const gameData = rows as Game[];
        return gameData.length > 0 ? gameData[0] : undefined;
    } catch (err) {
        throw err;
    }
}