import { Request, Response } from "express";
import { dbcon } from "../database/pool";

export const getAllLottos = async (req: Request, res: Response) => {
    const [rows] = await dbcon.query("SELECT * FROM lottos");
    res.json(rows)
}