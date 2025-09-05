import { Request, Response } from "express";
import { dbcon } from "../database/pool";

export const getAllUsers = async (req: Request, res: Response) =>{
    const [rows] = await dbcon.query("SELECT * FROM users");
    res.json(rows);
}

export const getUserByEmail = async (req: Request, res: Response) =>{
    const [rows]:any = await dbcon.query("SELECT * FROM users WHERE email = ?", [req.params.email]);
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
}


