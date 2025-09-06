import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import bcrypt from 'bcrypt';

export const getAllUsers = async (req: Request, res: Response) =>{
    const [rows] = await dbcon.query("SELECT * FROM Users");
    res.json(rows);
}

export const getUserByEmail = async (req: Request, res: Response) =>{
    try{
        const [rows]:any = await dbcon.query("SELECT * FROM Users WHERE email = ?", [req.params.email]);
         if (!rows.length) return res.status(404).json({ message: "User not found" });
        res
        .status(200)
        .json(rows[0]);
    }catch(err){
        res.status(204).json({message : "User not found"}) 
    }
}


export const register = async (req: Request, res: Response) => {
  const { email, password, money, fullname } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const uData = { email, password: passwordHash, fullname, money };

    const [results]: any = await dbcon.query("INSERT INTO Users SET ?", uData);

    if (results.affectedRows > 0) {
      return res.status(201).json({ message: "Account Created" });
    }
    res.status(400).json({ message: "Failed to create account" });
  } catch (err) {
    res.status(500).json({ message: "Dueplicate email" });
  }
};



export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body
    try{
        const [results]:any = await dbcon.query("SELECT * FROM Users WHERE email = ?", email);
        const userData = results[0];
        const isMatch = await bcrypt.compare(password, userData.password);
        if(!isMatch){
            res
            .status(401)
            .json({message: "email or password worng!!!"})
            return false;
        }
        return res.status(200).json({message: "Login Success", role: results[0].role});
    }catch(error){
        res
        .status(401)
        .json({message: "email or password worng!!!"})
    }
}


export const reset = async (req: Request, res: Response) => {
  try{
    dbcon.query("DELETE FROM Users WHERE role != 1");
    dbcon.query("DELETE FROM Lottos");
    res.status(200).json({message: "reset success"})
  }catch(err){
    res.status(500).json({message: "error", err})
  }
}

