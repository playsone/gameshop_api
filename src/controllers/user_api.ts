import { Request, Response } from "express";
import { dbcon } from "../database/pool";

export const getAllUsers = async (req: Request, res: Response) =>{
    const [rows] = await dbcon.query("SELECT * FROM users");
    res.json(rows);
}


