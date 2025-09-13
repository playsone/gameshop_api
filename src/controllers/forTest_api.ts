import { Request, Response } from "express";
import { dbcon, runScript } from "../database/pool";

//////////////////////////////////////////////////////////////////////////////////////////////////

// test api path
export const test_api = async (req: Request, res: Response) => {
  try {
    const a = await runScript();
    res.json(a);
  } catch (error) {}
};
