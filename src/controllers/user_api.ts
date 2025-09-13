import { Request, Response } from "express";
import { dbcon, runScript } from "../database/pool";
import bcrypt from 'bcrypt';
import { Users } from "../models/responses/usersModel";

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of get all user
export const getAllUsers_api = async (req: Request, res: Response) =>{
    const [rows] = await dbcon.query("SELECT * FROM Users");
    res.json(rows);
}

//////////////////////////////////////////////////////////////////////////////////////////////////

// path of get user by email
export const getUserByEmail_api = async (req: Request, res: Response) =>{
    try{
        const [rows] = await dbcon.query("SELECT * FROM Users WHERE email = ?", [req.params.email]);
        const usersData = rows as Users[];
         if (usersData.length) return res.status(404).json({ message: "User not found" });
        res
        .status(200)
        .json(usersData[0]);
    }catch(err){
        res.status(204).json({message : "User not found"}) 
    }
}
//////////////////////////////////////////////////////////////////////////////////////////////////

export async function getUsersById_fn(id: number){
  try{
        const [rows] = await dbcon.query("SELECT * FROM Users WHERE uid = ?", [id]);
        const usersData = rows as Users[];
         if (usersData.length) return { message: "USER NOT FOUND" };
        return usersData;

    }catch(err){
        throw err;
    }
}

export async function getUsersByEmail_fn(email: string){
  let duep: boolean = false;
  try{
        const [rows] = await dbcon.query("SELECT * FROM Users WHERE email = ?", [email]);
        const usersData = rows as Users[];
         if (usersData.length <= 0){
          duep = false;
          return { message: "USER NOT FOUND", duep };
         } 
         duep = true;
        return {usersData, duep};

    }catch(err){
        throw err;
    }
}


// pat of get user by id
export const getUsersById_api = async (req: Request, res: Response) =>{
  const uid = Number(req.params.uid.trim());
    try{
        const usersData = await getUsersById_fn(uid) as Users[];
         if (usersData.length) return res.status(404).json({ message: "User not found" });
        res
        .status(200)
        .json(usersData[0]);
    }catch(err){
        res.status(204).json({message : "User not found"}) 
    }
}


export const register_api = async (req: Request, res: Response) => {
  const { email, password, wallet, fullname } = req.body;
  try {
    const {usersData, duep} = await getUsersByEmail_fn(email);
    if(duep){
      res.status(401).json({msg: "Email is Dueplicate"});
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const uData = {email: email,password:passwordHash,fullname:fullname,wallet:wallet};

    const [results]: any = await dbcon.query("INSERT INTO Users SET ?", uData);

    if (results.affectedRows > 0) {
      return res.status(201).json({ message: "Account Created" });
    }
    res.status(400).json({ message: "Failed to create account" });
  } catch (err) {
    res.status(500).json({ message: "Dueplicate email" , err});
  }
};



export const login_api = async (req: Request, res: Response) => {
    const {email, password} = req.body
    try{
        const [results]:any = await dbcon.query("SELECT * FROM Users WHERE email = ?", email);
        const userData = results[0] as Users;
        const isMatch = await bcrypt.compare(password, userData.password);
        if(!isMatch){
            res
            .status(401)
            .json({message: "email or password worng!!!"})
            return false;
        }
        return res.status(200).json({message: "Login Success", role: userData.role, is_login: true, id: userData.uid});
    }catch(error){
        res
        .status(401)
        .json({message: "email or password worng!!!"})
    }
}


export const reset_api = async (req: Request, res: Response) => {
  try{
    await dbcon.query("DELETE FROM Lottos");
    await dbcon.query("DELETE FROM Prizes");
    await dbcon.query("DELETE FROM Users WHERE role != 1");
    res.status(200).json({message: "reset success"})

    // or this
    // const a = await runScript();
    // res.json(a)
  }catch(err){
    res.status(500).json({message: "error", err})
  }
}

