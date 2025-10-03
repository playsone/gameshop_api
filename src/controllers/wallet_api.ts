// controllers/walletController.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { getGameById_fn } from "./utilityFunctions";
import { OkPacket, RowDataPacket } from 'mysql2'; // ต้อง Import Types เหล่านี้

// --- Wallet Balance ---

/**
 * @route GET /api/users/:user_id/wallet
 * @desc แสดง Wallet Balance
 */
export const getWalletBalance_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        // 📌 แก้ไข: ระบุ Generic Type <RowDataPacket[]> เพื่อให้ TypeScript รู้ว่า 'rows' เป็น Array
        const [rows] = await dbcon.query<RowDataPacket[]>("SELECT wallet FROM users WHERE user_id = ?", [user_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        
        // rows[0] จะถูกยอมรับ
        res.status(200).json({ wallet: rows[0].wallet });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Top Up (Transaction) ---

/**
 * @route POST /api/users/:user_id/topup
 * @desc เติมเงิน (ใช้ Transaction)
 */
export const topUpWallet_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    const { amount } = req.body;

    if (amount <= 0 || isNaN(amount)) {
        return res.status(400).json({ message: "Invalid amount." });
    }

    try {
        await dbcon.query("START TRANSACTION");

        // 📌 แก้ไข: ใช้ <OkPacket> สำหรับ UPDATE
        await dbcon.query<OkPacket>(
            "UPDATE users SET wallet = wallet + ? WHERE user_id = ?",
            [amount, user_id]
        );

        // 📌 แก้ไข: ใช้ <OkPacket> สำหรับ INSERT
        await dbcon.query<OkPacket>(
            "INSERT INTO wallettransaction(user_id, amount) VALUES (?, ?)",
            [user_id, amount]
        );

        await dbcon.query("COMMIT");

        res.status(200).json({ message: `Top up ${amount} successful.`, user_id });
    } catch (err) {
        await dbcon.query("ROLLBACK"); 
        console.error(err);
        res.status(500).json({ message: "Top up failed." });
    }
};

// --- Transaction History (Combined) ---

/**
 * @route GET /api/users/:user_id/history
 * @desc ดูประวัติการทำรายการรวม (Wallet & Purchase)
 */
export const getTransactionHistory_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        // 📌 แก้ไข: ใช้ <RowDataPacket[]>
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT 'wallet' AS type, amount, wallettransaction_date AS date
            FROM wallettransaction
            WHERE user_id = ?
            UNION
            SELECT 'purchase' AS type, price AS amount, bought_date AS date
            FROM gametransaction
            WHERE user_id = ?
            ORDER BY date DESC`,
            [user_id, user_id]
        );
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Purchase History ---

/**
 * @route GET /api/users/:user_id/purchases
 * @desc ดูประวัติการซื้อเกม
 */
export const getGamePurchaseHistory_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        // 📌 แก้ไข: ใช้ <RowDataPacket[]>
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.name AS game_name, gt.price, gt.bought_date, d.code_name AS discount_code
            FROM gametransaction gt
            JOIN game g ON gt.game_id = g.game_id
            LEFT JOIN discountcode d ON gt.code_id = d.code_id
            WHERE gt.user_id = ?
            ORDER BY gt.bought_date DESC`,
            [user_id]
        );
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Game Purchase (Transaction) ---

/**
 * @route POST /api/users/:user_id/purchase
 * @desc ตัดเงินจาก Wallet (ซื้อเกม) - ใช้ Transaction
 */
export const purchaseGame_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    const { game_id, code_name } = req.body;

    let finalPrice = 0;
    let codeId: number | null = null;
    let discountValue = 0;

    try {
        const game = await getGameById_fn(game_id);
        if (!game) return res.status(404).json({ message: "Game not found." });
        finalPrice = game.price;

        // 📌 แก้ไข: ใช้ <RowDataPacket[]>
        const [libraryCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT * FROM usersgamelibrary WHERE user_id = ? AND game_id = ?",
            [user_id, game_id]
        );
        if (libraryCheck.length > 0) return res.status(409).json({ message: "Game already exists in your library." });

        if (code_name) {
            // 📌 แก้ไข: ใช้ <RowDataPacket[]>
            const [codeRows] = await dbcon.query<RowDataPacket[]>(
                "SELECT code_id, discount_value, remaining_user FROM discountcode WHERE code_name = ?",
                [code_name]
            );
            const discountCode = codeRows[0];
            
            if (discountCode && discountCode.remaining_user > 0) {
                codeId = discountCode.code_id;
                discountValue = discountCode.discount_value;
                finalPrice = Math.max(0, game.price - discountValue);
            } else if (code_name) {
                return res.status(400).json({ message: "Invalid or expired discount code." });
            }
        }

        await dbcon.query("START TRANSACTION");
        // 📌 แก้ไข: ใช้ <RowDataPacket[]> สำหรับ FOR UPDATE
        const [userRows] = await dbcon.query<RowDataPacket[]>(
            "SELECT wallet FROM users WHERE user_id = ? FOR UPDATE",
            [user_id]
        );
        const userWallet = userRows[0]?.wallet;

        if (userWallet === undefined) { await dbcon.query("ROLLBACK"); return res.status(404).json({ message: "User not found." }); }
        if (userWallet < finalPrice) { await dbcon.query("ROLLBACK"); return res.status(402).json({ message: "Insufficient funds in wallet." }); }

        // 📌 แก้ไข: ใช้ <OkPacket>
        await dbcon.query<OkPacket>("UPDATE users SET wallet = wallet - ? WHERE user_id = ?", [finalPrice, user_id]);
        
        // 📌 แก้ไข: ใช้ <OkPacket>
        await dbcon.query<OkPacket>(
            "INSERT INTO gametransaction(user_id, game_id, code_id, price) VALUES (?, ?, ?, ?)",
            [user_id, game_id, codeId, finalPrice]
        );
        
        // 📌 แก้ไข: ใช้ <OkPacket>
        await dbcon.query<OkPacket>("INSERT INTO usersgamelibrary(user_id, game_id) VALUES (?, ?)", [user_id, game_id]);
        
        if (codeId !== null) {
            // 📌 แก้ไข: ใช้ <OkPacket>
            await dbcon.query<OkPacket>("UPDATE discountcode SET remaining_user = remaining_user - 1 WHERE code_id = ?", [codeId]);
        }
        
        // 📌 แก้ไข: ใช้ <OkPacket>
        await dbcon.query<OkPacket>("DELETE FROM basket WHERE uid = ? AND game_id = ?", [user_id, game_id]);

        await dbcon.query("COMMIT");

        res.status(200).json({ 
            message: "Purchase successful.", 
            final_price: finalPrice, 
            discount_applied: discountValue 
        });

    } catch (err: any) {
        await dbcon.query("ROLLBACK"); 
        console.error(err);
        res.status(500).json({ message: "Purchase failed due to server error.", error: err.message });
    }
};