import { Request, Response } from "express";
import { dbcon, runScript } from "../database/pool";
import { buyLotto_fn } from "./user_api";

//////////////////////////////////////////////////////////////////////////////////////////////////

// test api path
export const test_api = async (req: Request, res: Response) => {
  try {
    const a = await buyLotto_fn("388979", 1);
    res.json(a);
  } catch (error) {}
};
