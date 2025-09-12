import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { Lottos } from "../models/lottosModel";
import { Prizes } from "../models/prizesModel";
import { allLottos, soldLottos } from "./lotto_api";
import { ResultSetHeader } from "mysql2/promise";

//////////////////////////////////////////////////////////////////////////////////////////////////

// all prize
async function lottosPrizes() {
  try {
    const [rows] = await dbcon.query("SELECT * FROM Prizes");
    return rows as Prizes[];
  } catch (error) {
    throw error;
  }
}

// path of all prize
export const getPrizes = async (req: Request, res: Response) => {
  try {
    const dataP = await lottosPrizes();
    res.status(200).json(dataP);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of get lottos T Took Prize duy pirze tier
export const getLottosOfPrizesByPrizeTier = async (
  req: Request,
  res: Response
) => {
  const prizeT = req.params.prize;

  try {
    const [rows] = await dbcon.query(
      "SELECT * FROM Lottos WHERE pid = ?",
      prizeT
    );
    const dataLottos = rows as Lottos[];
    res.status(200).json(dataLottos);
  } catch (error) {}
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// random prize 5 tier
async function rand5t(pt: number, is_sold: number) {
  const randLast2Num: string = String(Math.floor(Math.random() * 100)).padStart(
    2,
    "0"
  );
  try {
    // 0 = sold
    if (pt == 5 && is_sold == 0) {
      await dbcon.query(
        "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = 5",
        randLast2Num
      );
      await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = 5");
      await dbcon.query(
        "UPDATE Lottos SET pid = 5 WHERE lotto_number like ? AND is_sold = 1 AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${randLast2Num}`]
      );
      const [count]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as c FROM Lottos WHERE pid = 5"
      );
      return {
        msg: "Update Sucess at prize 5",
        randLast2Num,
        numGotPrizes: count[0].c,
      };

      // 1 = all
    } else if (pt == 5 && is_sold == 1) {
      await dbcon.query(
        "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = 5",
        randLast2Num
      );
      await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = 5");
      await dbcon.query(
        "UPDATE Lottos SET pid = 5 WHERE lotto_number like ? AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${randLast2Num}`]
      );
      const [count]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as c FROM Lottos WHERE pid = 5"
      );
      return {
        msg: "Update Sucess at prize 5",
        randLast2Num,
        numGotPrizes: count[0].c,
      };
    } else {
      return { msg: "HAVE NOT LOTTO NUMBER" };
    }
  } catch (error) {
    throw error;
  }
}

async function rand4t(is_sold: number) {
  try {
    if (is_sold == 0) {
      const [rows] = await dbcon.query(
        "SELECT SUBSTRING(lotto_number, 4, 3) as t4 FROM Prizes WHERE prize_tier = 1;"
      );
      const t4: any = rows;
      if (t4.length <= 0) {
        return { msg: "HAVE NOT LOTTO NUMBER" };
      }

      const [t] = await dbcon.query(
        "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = 4",
        t4[0].t4
      );
      await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = 4");
      await dbcon.query(
        "UPDATE Lottos SET pid = 4 WHERE lotto_number like ? AND is_sold = 1 AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${t4[0].t4}`]
      );
      const [numGetT4]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as count FROM Lottos WHERE pid = 4"
      );

      return {
        msg: "Update success at prize 4",
        lottoNum: t4[0].t4,
        t4: numGetT4[0].count,
      };
    } else if (is_sold == 1) {
      const [rows] = await dbcon.query(
        "SELECT SUBSTRING(lotto_number, 4, 3) as t4 FROM Prizes WHERE prize_tier = 1;"
      );
      const t4: any = rows;
      if (t4.length <= 0) {
        return { msg: "HAVE NOT LOTTO NUMBER" };
      }

      const [t] = await dbcon.query(
        "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = 4",
        t4[0].t4
      );
      await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = 4");
      await dbcon.query(
        "UPDATE Lottos SET pid = 4 WHERE lotto_number like ? AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${t4[0].t4}`]
      );
      const [numGetT4]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as count FROM Lottos WHERE pid = 4"
      );
      return {
        msg: "Update success at prize 4",
        lottoNum: t4[0].t4,
        t4: numGetT4[0].count,
      };
    }
  } catch (error) {
    throw error;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////


// update data after random tier
async function updateData(pt: number, dataOfLottos: Lottos[], is_sold: number) {
    const ranNum = Math.floor(Math.random() * dataOfLottos.length);
    const lottoRand = dataOfLottos[ranNum].lotto_number; //rand new lotto
    try {
        await dbcon.query(
            "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = ?",
            [lottoRand, pt]
        );
        await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = ?", pt);
        await dbcon.query("UPDATE Lottos SET pid = ? WHERE lotto_number = ?", [
            pt,
            lottoRand,
        ]);
        
        let msg = {
            msg: "Update success at prize " + pt,
            lottoRand,
            Prize_tier: pt,
            uidGetPrize: dataOfLottos[ranNum].uid,
        };
        
        if (pt == 1) {
            const msg2 = await rand4t(is_sold);
            msg = { ...msg, ...msg2 };
        }
        return msg;
    } catch (error) {
        throw error;
    }
}

// random prize 1 - 3 tier
async function rand1_3t(pt: number, is_sold: number) {
    const allLottosNum = (await allLottos()) as Lottos[];
    const soldLottosNum = (await soldLottos()) as Lottos[];
    
    try {
        // 0 = sold
        if (is_sold == 0 && pt > 0 && pt <= 3) {
            if (soldLottosNum.length <= 0)
                return { message: "HAVE NOT LOTTOS NUMBER" };
            
            const msg = await updateData(pt, soldLottosNum, is_sold);
            return msg;
            
            // 1 = all lotto
        } else if (is_sold == 1 && pt > 0 && pt <= 3) {
            if (allLottosNum.length <= 0)
                return { message: "HAVE NOT LOTTOS NUMBER" };
            
            const msg = await updateData(pt, allLottosNum, is_sold);
            return msg;
        } else {
            return { msg: "request  0 > prize <= 3 and = 5 and is_sold 0, 1" };
        }
    } catch (error) {
        throw error;
    }
}

//path of random lotto prize
export const randPrize = async (req: Request, res: Response) => {
    const prize: number = Number(req.query.prize);
    const is_sold: number = Number(req.query.is_sold);
    
    if (prize > 0 && prize <= 5 && is_sold >= 0 && is_sold <= 1) {
        let msg = {};
        if (prize == 5) {
            msg = await rand5t(prize, is_sold);
        } else {
            msg = await rand1_3t(prize, is_sold);
        }
        res.status(200).json(msg);
    } else {
        res.status(404).json({ msg: "request  0 > prize < 4 and is_sold 0, 1" });
    }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

export const test = async (req: Request, res: Response) => {
  try {
    const [rows]: any = await dbcon.query<ResultSetHeader>(
      `UPDATE Lottos 
        SET pid = 4 
        WHERE lotto_number like ? 
        AND is_sold = 1
        AND lotto_number NOT IN 
          ( SELECT lotto_number FROM(
            SELECT lotto_number 
            FROM Lottos 
            WHERE pid < 5 
            AND pid > 0) as c)`,
      [`%123`]
    );

    res.status(200).json(rows[0].affectedRows);
    // res.status(200).json(.affectedRows);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};