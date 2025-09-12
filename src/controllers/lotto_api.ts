import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { Lottos } from "../models/lottosModel";

// return all lottos
export async function allLottos() {
  try {
    const [rows]: any = await dbcon.query("SELECT * FROM Lottos");
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}
// path of get all lottos
export const getAllLottos = async (req: Request, res: Response) => {
  try {
    const result = await allLottos();
    if (result.length <= 0) {
      res.status(200).json({ message: "Have not Lotto number" });
      return;
    }
    res.status(200).json(result as Lottos[]);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
/////////////////////////////////////////////////////////////////////////////////////////

// get lottos number is sold
export async function soldLottos() {
  try {
    const [rows]: any = await dbcon.query(
      "SELECT * FROM Lottos WHERE is_sold = 1"
    );
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}

//path of get lotto number is sold
export const getSoldLottoNumber = async (req: Request, res: Response) => {
  try {
    const result = await soldLottos();
    if (result.length <= 0) {
      res.status(200).json({ message: "HAVE NOT LOTTOS NUMBER" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////

// get lottos number is unsold
export async function unSoldLottos() {
  try {
    const [rows]: any = await dbcon.query(
      "SELECT * FROM Lottos WHERE is_sold = 0"
    );
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}

// path of get lottos number is unsold
export const getUnSoldLottoNumber = async (req: Request, res: Response) => {
  try {
    const result = await unSoldLottos();
    if (result.length <= 0) {
      res.status(200).json({ message: "HAVE NOT LOTTOS NUMBER" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of search lottos by number
export const searchLottoNumber = async (req: Request, res: Response) => {
  const searchTxt: string = req.params.num.trim();
  try {
    const [results]: any = await dbcon.query(
      "SELECT * FROM Lottos WHERE lotto_number like ?",
      [`%${searchTxt}%`]
    );
    const lottosData = results as Lottos[];
    if (lottosData.length == 0)
      return res
        .status(200)
        .json({ message: "HAVE NOT LOTTOS NUMBER", length: lottosData.length });
    res.status(200).json(lottosData);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};



