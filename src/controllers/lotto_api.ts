import { Request, Response } from "express";
import { dbcon } from "../database/pool";

export const getAllLottos = async (req: Request, res: Response) => {
    try{
        const [rows] = await dbcon.query("SELECT * FROM Lottos");
        res
        .status(200)
        .json(rows)
    }catch(err){
        res
        .status(500)
        .json({message: "Have not data"})
    }
    
}

export const getSoldLottoNumber = async (req: Request, res: Response) => {
    try{
        const [results]: any = await dbcon.query("SELECT * FROM Lottos WHERE is_sold = 1");
        res
        .status(200)
        .json(results)
    }catch(err){
        res
        .status(500)
        .json({message: "Have not data"})
    }
}

export const getUnSoldLottoNumber = async (req: Request, res: Response) => {
    try{
        const [results]: any = await dbcon.query("SELECT * FROM Lottos WHERE is_sold = 0");
        res
        .status(200)
        .json(results)
    }catch(err){
        res
        .status(500)
        .json({message: "Have not data"})
    }
}

export const searchLottoNumber = async (req: Request, res: Response) => {
    const searchTxt: string = req.params.num.trim();
    try{
        const [results]: any = await dbcon.query("SELECT * FROM Lottos WHERE lotto_number like ?", [`%${searchTxt}%`]);
        
        if(results.length == 0) return res.status(200).json({message: "Have not data", length: results.length});
        res
        .status(200)
        .json(results)
    }catch(err){
        res
        .status(500)
        .json({message: "error"})
    }
}

export const ranTier1Sold = async (req: Request, res: Response) => {
    try{
        // lotto is sold
        const [rows]:any = await dbcon.query("SELECT lotto_number from Lottos WHERE is_sold = 1");
        //ran new num
        const t1num = rows[Math.floor(Math.random() * rows.length)];
        
        const [t1]:any = await dbcon.query("SELECT lotto_number FROM Lottos WHERE pid = 1 and is_sold = 1");
        if(t1[0]){
            await dbcon.query("UPDATE Lottos set pid = 0 where pid = 1");
            await dbcon.query("UPDATE Lottos set pid = 1 where lotto_number = ?", t1num["lotto_number"]);
        }else{
            await dbcon.query("UPDATE Lottos set pid = 1 where lotto_number = ?", t1num["lotto_number"]);
        }

        res 
        .status(201)
        .json({
            message: "Random success"
        })
    }catch(err){
        res.json({message: err})
    }
}

