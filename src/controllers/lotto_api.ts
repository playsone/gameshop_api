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

