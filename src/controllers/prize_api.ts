import { Request, Response } from "express";
import { dbcon, runScript } from "../database/pool";
import { Lottos } from "../models/responses/lottosModel";
import { Prizes } from "../models/responses/prizesModel";
import {
  getAllLottos_fn,
  getLottoByLotto_number_fn,
  soldLottos_fn,
} from "./lotto_api";
import { buyLotto_fn, getUsersById_fn } from "./user_api";
import { PrizeOfLottos } from "../models/responses/prize_of_lotto_res";

//////////////////////////////////////////////////////////////////////////////////////////////////

// all prize
async function lottosPrizes_fn() {
  try {
    const [rows] = await dbcon.query("SELECT * FROM Prizes");
    return rows as Prizes[];
  } catch (error) {
    throw error;
  }
}

// path of all prize
export const getPrizes_api = async (req: Request, res: Response) => {
  try {
    const dataP = await lottosPrizes_fn();
    res.status(200).json(dataP);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of get lottos T Took Prize duy pirze tier
export const getLottosOfPrizesByPrizeTier_api = async (
  req: Request,
  res: Response
) => {
  const prizeT = req.params.prize;

  try {
    const [rows] = await dbcon.query(
      "SELECT * FROM Lottos WHERE pid = ? AND is_sold != 2",
      prizeT
    );
    const dataLottos = rows as Lottos[];
    res.status(200).json(dataLottos);
  } catch (error) {}
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// random prize 5 tier
async function rand5t_fn(pt: number, is_sold: number) {
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
      await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = 5 AND is_sold != 2");
      await dbcon.query(
        "UPDATE Lottos SET pid = 5 WHERE lotto_number like ? AND is_sold = 1 AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${randLast2Num}`]
      );
      const [count]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as c FROM Lottos WHERE pid = 5"
      );
      return {
        msg: "Update Sucess at prize 5",
        lottoRand : randLast2Num,
        prizeTier : 5,
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
        "UPDATE Lottos SET pid = 5 WHERE lotto_number like ? AND is_sold != 2 AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
        [`%${randLast2Num}`]
      );
      const [count]: any = await dbcon.query(
        "SELECT COUNT(lotto_number) as c FROM Lottos WHERE pid = 5 AND is_sold != 2"
      );
      return {
        msg: "Update Sucess at prize 5",
        lottoRand : randLast2Num,
        prizeTier : 5,
        numGotPrizes: count[0].c,
      };
    } else {
      return { msg: "HAVE NOT LOTTO NUMBER" };
    }
  } catch (error) {
    throw error;
  }
}

async function rand4t_fn(is_sold: number) {
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
        "UPDATE Lottos SET pid = 4 WHERE lotto_number like ? AND is_sold != 2 AND lotto_number NOT IN ( SELECT lotto_number FROM(SELECT lotto_number FROM Lottos WHERE pid < 5 AND pid > 0 ) as c)",
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

// update data after random tier
async function updateData_fn(
  pt: number,
  dataOfLottos: Lottos[],
  is_sold: number
) {
  const ranNum = Math.floor(Math.random() * dataOfLottos.length);
  const lottoRand = dataOfLottos[ranNum].lotto_number; //rand new lotto
  try {
    await dbcon.query(
      "UPDATE Prizes SET lotto_number = ? WHERE prize_tier = ?",
      [lottoRand, pt]
    );
    await dbcon.query("UPDATE Lottos SET pid = 0 WHERE pid = ? AND is_sold != 2", pt);
    await dbcon.query("UPDATE Lottos SET pid = ? WHERE lotto_number = ?", [
      pt,
      lottoRand,
    ]);

    let msg = {
      msg: "Update success at prize " + pt,
      lottoRand,
      prizeTier: pt,
      uidGetPrize: dataOfLottos[ranNum].uid,
    };

    if (pt == 1) {
      const msg2 = await rand4t_fn(is_sold);
      msg = { ...msg, ...msg2 };
    }
    return msg;
  } catch (error) {
    throw error;
  }
}

// random prize 1 - 3 tier
async function rand1_3t_fn(pt: number, is_sold: number) {
  const allLottosNum = (await getAllLottos_fn()) as Lottos[];
  const soldLottosNum = (await soldLottos_fn()) as Lottos[];

  try {
    // 0 = sold
    if (is_sold == 0 && pt > 0 && pt <= 3) {
      if (soldLottosNum.length <= 0)
        return { message: "HAVE NOT LOTTOS NUMBER" };

      const msg = await updateData_fn(pt, soldLottosNum, is_sold);
      return msg;

      // 1 = all lotto
    } else if (is_sold == 1 && pt > 0 && pt <= 3) {
      if (allLottosNum.length <= 0)
        return { message: "HAVE NOT LOTTOS NUMBER" };

      const msg = await updateData_fn(pt, allLottosNum, is_sold);
      return msg;
    } else {
      return { msg: "request  0 > prize <= 3 and = 5 and is_sold 0, 1" };
    }
  } catch (error) {
    throw error;
  }
}

//path of random lotto prize
export const randPrize_api = async (req: Request, res: Response) => {
  const prize: number = Number(req.query.prize);
  const is_sold: number = Number(req.query.is_sold);

  if (prize > 0 && prize <= 5 && is_sold >= 0 && is_sold <= 1) {
    let msg = {};
    if (prize == 5) {
      msg = await rand5t_fn(prize, is_sold);
    } else {
      msg = await rand1_3t_fn(prize, is_sold);
    }
    res.status(200).json(msg);
  } else {
    res.status(404).json({ msg: "request  0 > prize < 4 and is_sold 0, 1" });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// fn check prizes
export async function checkTierPrizeLottos_fn(lotNum: string) {
  try {
    const [rows] = await dbcon.query(
      "SELECT l.lotto_number, p.prize_tier, p.claim_amount, l.uid, l.is_claim FROM Prizes AS p, Lottos AS l WHERE p.prize_tier = l.pid AND l.lotto_number = ?",
      [lotNum]
    );
    return rows as PrizeOfLottos[];
  } catch (error) {
    throw error;
  }
}

// path of check prizes
export const checkTierPrizeLottos_api = async (req: Request, res: Response) => {
  const uid = Number(req.query.uid);
  const lotNum = String(req.query.lotto_number).trim();
  console.log(uid+" "+lotNum);
  
  let can_claim: number = 0;

  try {
    const rows = await checkTierPrizeLottos_fn(lotNum);
    const pData = rows[0] as PrizeOfLottos;

    if (pData.is_claim == 1) {
      can_claim = 0;
    } else if (
      pData.prize_tier > 0 &&
      pData.prize_tier <= 5 &&
      pData.uid == uid &&
      pData.is_claim == 0
    ) {
      can_claim = 1;
    } else {
      can_claim = 0;
    }

    res.status(200).json({can_claim });
  } catch (error) {
    res.status(500).json({
      can_claim,
    });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////

// fn claim prizes
export async function claim_prize_fn(
  can_claim: number,
  uid: number,
  lotNum: string
) {
  try {
    const lottoData = await getLottoByLotto_number_fn(lotNum);
    const check = await checkTierPrizeLottos_fn(lotNum);

    if (can_claim == 1) {
      if (lottoData[0].is_claim == 0 && check[0].uid == uid) {
        await dbcon.query(
          "UPDATE Lottos SET is_claim = 1 WHERE lotto_number = ?",
          lotNum
        );
        await dbcon.query(
          "UPDATE Users SET wallet = (wallet + ?) WHERE uid = ?",
          [check[0].claim_amount, uid]
        );
        return {
          msg: "Claim lotto success get " + check[0].claim_amount + "Bath",
        };
      }else if(check[0].uid != uid){
        return {msg: "user not owner of lotto R U Prechar Teacher?"}
      }else{
        return {msg: "This lotto is claim"}
      }
    } else {
      return { msg: "Can't claim lotto", can_claim };
    }
  } catch (error) {
    throw error;
  }
}

// path of claim money yes yes yes rich rich rich
export const claim_prize_api = async (req: Request, res: Response) => {
  const can_claim = Number(req.query.can_claim);
  const uid = Number(req.query.uid);
  const lotNum = String(req.query.lotto_number).trim();

  try {
    const msg = await claim_prize_fn(can_claim, uid, lotNum);
    res.status(200).json(msg);
  } catch (error) {
    res.status(500).json(error);
  }
};
