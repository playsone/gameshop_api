import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const dbcon = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});


export async function runScript() {
  try {
    const sqlPath = path.join(__dirname, "LottoDBsetupEdit.sql");
    const sql = fs.readFileSync("G:/Flutter_Project/JackpotHub888_API/src/database/LottoDBsetupEdit.sql", "utf-8"); 
    const statements = sql
      .split(/;\s*$/m) 
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const stmt of statements) {
      await dbcon.query(stmt);
    }

    return {msg: "✅ Database initialized"}
  } catch (err) {
    return {msg: "❌ Error running script:", err}
  }
}


