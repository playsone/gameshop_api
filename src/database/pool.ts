import mysql from "mysql2/promise";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
dotenv.config();

export const dbcon = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export async function runScript() {
  try {
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8"); 
    const statements = sql
      .split(/;\s*[\r\n]+/) 
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


