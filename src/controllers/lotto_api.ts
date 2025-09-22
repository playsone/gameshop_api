import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { Lottos } from "../models/responses/lottosModel";
import { log } from "console";
import { stringify } from "querystring";

//////////////////////////////////////////////////////////////////////////////////////////////////

// get lotto by lotto num
export async function getLottoByLotto_number_fn(lotto_number: string) {
  try {
    const [rows] = await dbcon.query(
      "SELECT * FROM Lottos WHERE lotto_number = ? AND is_sold != 2",
      lotto_number
    );
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// return all lottos
export async function getAllLottos_fn() {
  try {
    const [rows]: any = await dbcon.query(
      "SELECT * FROM Lottos WHERE is_sold != 2"
    );
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of get all lottos
export const getAllLottos_api = async (req: Request, res: Response) => {
  try {
    const result = await getAllLottos_fn();
    if (result.length <= 0) {
      res.status(200).json({ message: "Have not Lotto number" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err });
  }
};
/////////////////////////////////////////////////////////////////////////////////////////

// get lottos number is sold
export async function soldLottos_fn() {
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
export const getSoldLottoNumber_api = async (req: Request, res: Response) => {
  try {
    const result = await soldLottos_fn();
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
export async function unSoldLottos_fn() {
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
export const getUnSoldLottoNumber_api = async (req: Request, res: Response) => {
  try {
    const result = await unSoldLottos_fn();
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
export const searchLottoNumber_api = async (req: Request, res: Response) => {
  const searchTxt: string = req.params.num.trim();
  try {
    if (!(searchTxt.length <= 0)) {
      const [results]: any = await dbcon.query(
        "SELECT * FROM Lottos WHERE lotto_number like ? AND is_sold != 2",
        [`%${searchTxt}%`]
      );
      const lottosData = results as Lottos[];
      if (lottosData.length == 0)
        return res.status(200).json({
          message: "HAVE NOT LOTTOS NUMBER",
          lotto: searchTxt,
        });
      res.status(200).json(lottosData);
    } else {
      const allLotto = await getAllLottos_fn();
      res.status(200).json(allLotto);
    }
  } catch (err) {
    res.status(500).json({ message: err });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////
export async function newLotto_fn(price: number, amount: number) {
  let lotto: string;

  try {
    await dbcon.execute("DELETE FROM Lottos WHERE is_sold = 2");
    for (let i = 1; i <= amount; i++) {
      lotto = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
      await dbcon.execute(
        "INSERT INTO Lottos(lotto_number, price, is_sold) VALUES (?, ?, ?)",
        [lotto, price, 2]
      );
    }
    const [rows] = await dbcon.query("SELECT * FROM Lottos WHERE is_sold = 2");
    const lottoData = rows as Lottos[];
    return { lottoData };
  } catch (error) {
    throw { msg: "Can't insert" };
  }
}

export const newLotto_api = async (req: Request, res: Response) => {
  const price = Number(req.query.price);
  const amount = Number(req.query.amount);
  try {
    const lottoData = await newLotto_fn(price, amount);
    res.status(200).json(lottoData);
  } catch (error) {
    res.status(500).json(error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////

export async function delLotto_fn() {
  try {
    await dbcon.execute("DELETE FROM Lottos WHERE is_sold = 2");
  } catch (error) {
    throw error;
  }
}

export const delLotto_api = async (req: Request, res: Response) => {
  try {
    await delLotto_fn();
    res.status(200).json({ msg: "del success" });
  } catch (error) {
    res.status(500).json(error);
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////////

export async function launch_fn() {
  try {
    await dbcon.execute("UPDATE Lottos SET is_sold = 0 WHERE is_sold = 2");
  } catch (error) {
    throw error;
  }
}

export async function deleteAllLotto_fn() {
  try {
    await dbcon.execute("DELETE FROM Lottos");
  } catch (error) {
    throw error;
  }
}

export const launch_api = async (req: Request, res: Response) => {
  try {
    const rows = await getBetaLotto_fn();
    if (rows.length <= 0) {
      res.status(200).json({ msg: "have not beta lotto" });
    }else{
      await deleteAllLotto_fn();
      await launch_fn();
    }
    
    res.status(200).json({ msg: "launch success" });
  } catch (error) {
    res.status(500).json(error);
  }
};

/////////////////////////////////////////////////////////////////////////////////////////

// get lottos number is sold
export async function getBetaLotto_fn() {
  try {
    const [rows]: any = await dbcon.query(
      "SELECT * FROM Lottos WHERE is_sold = 2"
    );
    return rows as Lottos[];
  } catch (error) {
    throw error;
  }
}

//path of get lotto number is sold
export const getBetaLotto_api = async (req: Request, res: Response) => {
  try {
    const result = await getBetaLotto_fn();
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
