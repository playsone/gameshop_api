// controllers/walletController.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { getGameById_fn } from "./utilityFunctions";
import { OkPacket, RowDataPacket } from 'mysql2';

// --- Wallet Balance ---

/**
 * @route GET /api/users/:user_id/wallet
 * @desc แสดง Wallet Balance
 */
export const getWalletBalance_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>("SELECT wallet FROM users WHERE user_id = ?", [user_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }
        
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

        await dbcon.query<OkPacket>(
            "UPDATE users SET wallet = wallet + ? WHERE user_id = ?",
            [amount, user_id]
        );

        // UPDATED: เพิ่ม status = 0 เพื่อระบุว่าเป็น 'การเติมเงิน'
        await dbcon.query<OkPacket>(
            "INSERT INTO wallettransaction(user_id, amount, status) VALUES (?, ?, 0)",
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

// --- Transaction History (Combined - Original) ---

/**
 * @route GET /api/users/:user_id/history
 * @desc ดูประวัติการทำรายการรวม (Wallet & Purchase) - (ฟังก์ชันเดิม)
 */
export const getTransactionHistory_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
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

        const [libraryCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT * FROM usersgamelibrary WHERE user_id = ? AND game_id = ?",
            [user_id, game_id]
        );
        if (libraryCheck.length > 0) return res.status(409).json({ message: "Game already exists in your library." });

        if (code_name) {
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
        const [userRows] = await dbcon.query<RowDataPacket[]>(
            "SELECT wallet FROM users WHERE user_id = ? FOR UPDATE",
            [user_id]
        );
        const userWallet = userRows[0]?.wallet;

        if (userWallet === undefined) { await dbcon.query("ROLLBACK"); return res.status(404).json({ message: "User not found." }); }
        if (userWallet < finalPrice) { await dbcon.query("ROLLBACK"); return res.status(402).json({ message: "Insufficient funds in wallet." }); }

        await dbcon.query<OkPacket>("UPDATE users SET wallet = wallet - ? WHERE user_id = ?", [finalPrice, user_id]);
        
        // ADDED: บันทึกรายการเงินออก (status = 1)
        await dbcon.query<OkPacket>(
            "INSERT INTO wallettransaction(user_id, amount, status) VALUES (?, ?, 1)",
            [user_id, finalPrice]
        );
        
        await dbcon.query<OkPacket>(
            "INSERT INTO gametransaction(user_id, game_id, code_id, price) VALUES (?, ?, ?, ?)",
            [user_id, game_id, codeId, finalPrice]
        );
        
        await dbcon.query<OkPacket>("INSERT INTO usersgamelibrary(user_id, game_id) VALUES (?, ?)", [user_id, game_id]);
        
        if (codeId !== null) {
            await dbcon.query<OkPacket>("UPDATE discountcode SET remaining_user = remaining_user - 1 WHERE code_id = ?", [codeId]);
        }
        
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


// --- Admin ดูประวัติธุรกรรมรวมของทุก User ---
export const getAdminTransactionHistory_api = async (req: Request, res: Response) => {
    try {
        const [walletRows] = await dbcon.query<RowDataPacket[]>(
            `SELECT 'topup' AS type, user_id, amount, wallettransaction_date AS date FROM wallettransaction`
        );

        const [purchaseRows] = await dbcon.query<RowDataPacket[]>(
            `SELECT 'purchase' AS type, gt.user_id, gt.price * -1 AS amount, gt.bought_date AS date, g.name AS game_name
            FROM gametransaction gt
            JOIN game g ON gt.game_id = g.game_id`
        );
        
        const combinedHistory = [...walletRows, ...purchaseRows].sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        res.status(200).json(combinedHistory);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching admin transaction history." });
    }
};


// --- ซื้อเกมหลายเกมจากตะกร้า ---
export const purchaseGame_api2 = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    const { code_name } = req.body; 

    try {
        await dbcon.query("START TRANSACTION");

        const [basketItems] = await dbcon.query<RowDataPacket[]>(
            `SELECT b.bid, g.game_id, g.name, g.price
            FROM basket b JOIN game g ON b.game_id = g.game_id
            WHERE b.uid = ?`,
            [user_id]
        );
        if (basketItems.length === 0) { await dbcon.query("ROLLBACK"); return res.status(404).json({ message: "Basket is empty." }); }

        let subtotal = basketItems.reduce((sum, item) => sum + item.price, 0);
        let finalPrice = subtotal;
        let discountId: number | null = null;
        let discountAmount = 0;

        for (const item of basketItems) {
            const [libraryCheck] = await dbcon.query<RowDataPacket[]>(
                "SELECT * FROM usersgamelibrary WHERE user_id = ? AND game_id = ?",
                [user_id, item.game_id]
            );
            if (libraryCheck.length > 0) { 
                await dbcon.query("ROLLBACK"); 
                return res.status(409).json({ message: `Game '${item.name}' already exists in your library. Purchase aborted.` }); 
            }
        }

        if (code_name) {
            const [codeRows] = await dbcon.query<RowDataPacket[]>(
                "SELECT code_id, discount_value, remaining_user FROM discountcode WHERE code_name = ?",
                [code_name]
            );
            const discountCode = codeRows[0];
            
            if (discountCode && discountCode.remaining_user > 0) {
                 const [usageCheck] = await dbcon.query<RowDataPacket[]>(
                    "SELECT gametrans_id FROM gametransaction WHERE user_id = ? AND code_id = ?",
                    [user_id, discountCode.code_id]
                );
                if (usageCheck.length > 0) {
                    await dbcon.query("ROLLBACK"); 
                    return res.status(409).json({ message: "Discount code already used by this account." });
                }

                discountId = discountCode.code_id;
                discountAmount = discountCode.discount_value;
                finalPrice = Math.max(0, subtotal - discountAmount);
            } else {
                await dbcon.query("ROLLBACK"); 
                return res.status(400).json({ message: "Invalid or expired discount code." });
            }
        }
        
        const [userRows] = await dbcon.query<RowDataPacket[]>(
            "SELECT wallet FROM users WHERE user_id = ? FOR UPDATE",
            [user_id]
        );
        const userWallet = userRows[0]?.wallet;

        if (userWallet === undefined) { await dbcon.query("ROLLBACK"); return res.status(404).json({ message: "User not found." }); }
        if (userWallet < finalPrice) { await dbcon.query("ROLLBACK"); return res.status(402).json({ message: "Insufficient funds in wallet." }); }

        await dbcon.query<OkPacket>("UPDATE users SET wallet = wallet - ? WHERE user_id = ?", [finalPrice, user_id]);
        
        // ADDED: บันทึกรายการเงินออกทั้งหมด (status = 1)
        await dbcon.query<OkPacket>(
            "INSERT INTO wallettransaction(user_id, amount, status) VALUES (?, ?, 1)",
            [user_id, finalPrice]
        );
        
        for (const item of basketItems) {
            const gamePriceAfterDiscount = (item.price / subtotal) * finalPrice;
            
            await dbcon.query<OkPacket>(
                "INSERT INTO gametransaction(user_id, game_id, code_id, price) VALUES (?, ?, ?, ?)",
                [user_id, item.game_id, discountId, gamePriceAfterDiscount]
            );
            await dbcon.query<OkPacket>("INSERT INTO usersgamelibrary(user_id, game_id) VALUES (?, ?)", [user_id, item.game_id]);
        }
        
        if (discountId !== null) {
            await dbcon.query<OkPacket>("UPDATE discountcode SET remaining_user = remaining_user - 1 WHERE code_id = ?", [discountId]);
        }
        
        await dbcon.query<OkPacket>("DELETE FROM basket WHERE uid = ?", [user_id]);

        await dbcon.query("COMMIT");

        res.status(200).json({ 
            message: "Purchase successful. Games added to your library.", 
            subtotal: subtotal,
            discount_applied: discountAmount,
            final_price: finalPrice, 
            items_purchased: basketItems.length
        });

    } catch (err: any) {
        await dbcon.query("ROLLBACK"); 
        console.error(err);
        res.status(500).json({ message: "Purchase failed due to server error.", error: err.message });
    }
};

// --- NEW FUNCTION ---

/**
 * @route GET /api/users/:user_id/wallet/history
 * @desc แสดงประวัติการทำธุรกรรมของ Wallet (เงินเข้า-ออก)
 */
export const getWalletHistory_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT 
                amount, 
                wallettransaction_date AS date,
                status  -- 0 = top-up (เงินเข้า), 1 = purchase (เงินออก)
            FROM wallettransaction
            WHERE user_id = ?
            ORDER BY wallettransaction_date DESC`,
            [user_id]
        );
        
        if (rows.length === 0) {
            return res.status(200).json([]); // ส่ง Array ว่างถ้าไม่มีประวัติ
        }
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while fetching wallet history." });
    }
};