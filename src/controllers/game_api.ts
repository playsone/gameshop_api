// controllers/gameController.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { OkPacket, RowDataPacket } from 'mysql2';

// --- Game CRUD (สำหรับ Admin) ---

/**
 * @route POST /api/admin/games
 * @desc Admin จัดการเกม (CRUD) - Insert Game
 */
export const createGame_api = async (req: Request, res: Response) => {
    const { name, price, release_date, description, image, type_id } = req.body;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO game(name, price, release_date, description, image, type_id) VALUES (?, ?, ?, ?, ?, ?)",
            [name, price, release_date || null, description || null, image || null, type_id]
        );
        
        return res.status(201).json({ message: "Game created successfully.", game_id: results.insertId });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during game creation.", error: err.message });
    }
};

/**
 * @route PUT /api/admin/games/:game_id
 * @desc Admin จัดการเกม (CRUD) - Update Game
 */
export const updateGame_api = async (req: Request, res: Response) => {
    const game_id = Number(req.params.game_id);
    const { name, price, release_date, description, image, type_id } = req.body;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "UPDATE game SET name = ?, price = ?, release_date = ?, description = ?, image = ?, type_id = ? WHERE game_id = ?",
            [name, price, release_date || null, description || null, image || null, type_id, game_id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Game not found or no changes made." });
        }
        
        return res.status(200).json({ message: "Game updated successfully." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during game update.", error: err.message });
    }
};

/**
 * @route DELETE /api/admin/games/:game_id
 * @desc Admin จัดการเกม (CRUD) - Delete Game
 */
export const deleteGame_api = async (req: Request, res: Response) => {
    const game_id = Number(req.params.game_id);
    try {
        const [results] = await dbcon.query<OkPacket>("DELETE FROM game WHERE game_id = ?", [game_id]);
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Game not found." });
        }
        
        return res.status(200).json({ message: "Game deleted successfully." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during game deletion.", error: err.message });
    }
};

// --- GameType CRUD (สำหรับ Admin) ---

/**
 * @route POST /api/admin/gametypes
 * @desc Admin เพิ่มประเภทเกม
 */
export const createGameType_api = async (req: Request, res: Response) => {
    const { typename } = req.body;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO gametype(typename) VALUES (?)",
            [typename]
        );
        return res.status(201).json({ message: "Game type created.", type_id: results.insertId });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during type creation.", error: err.message });
    }
};

// --- Store Views (สำหรับ User) ---

/**
 * @route GET /api/games/latest
 * @desc ดึงเกมทั้งหมด (Store) แสดง 10 เกมล่าสุด
 */
export const getLatestGames_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type
            FROM game g
            JOIN gametype t ON g.type_id = t.type_id
            ORDER BY g.release_date DESC
            LIMIT 10`
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route GET /api/games/search
 * @desc ค้นหาเกม (ชื่อ/ประเภท)
 */
export const searchGames_api = async (req: Request, res: Response) => {
    const search_term = (req.query.q as string)?.trim() || '';
    if (!search_term) {
        return res.status(400).json({ message: "Search query 'q' is required." });
    }
    
    const wildcard_term = `%${search_term}%`;

    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.image, t.typename AS type
            FROM game g
            JOIN gametype t ON g.type_id = t.type_id
            WHERE g.name LIKE ?
            OR t.typename LIKE ?`,
            [wildcard_term, wildcard_term]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route GET /api/games/:game_id
 * @desc ดูรายละเอียดเกม
 */
export const getGameDetails_api = async (req: Request, res: Response) => {
    const game_id = Number(req.params.game_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type
            FROM game g
            JOIN gametype t ON g.type_id = t.type_id
            WHERE g.game_id = ?`,
            [game_id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Game not found." });
        }
        
        res.status(200).json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route GET /api/games/top-sellers
 * @desc เกมขายดี Top 5
 */
export const getTopSellerGames_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, COUNT(*) AS total_sold
            FROM gametransaction gt
            JOIN game g ON gt.game_id = g.game_id
            GROUP BY gt.game_id, g.name
            ORDER BY total_sold DESC
            LIMIT 5`
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Basket Management (สำหรับ User) ---

/**
 * @route POST /api/users/:user_id/basket/:game_id
 * @desc เพิ่มเกมลงตะกร้า (Add to Basket)
 */
export const addToBasket_api = async (req: Request, res: Response) => {
    const uid = Number(req.params.user_id);
    const game_id = Number(req.params.game_id);

    try {
        const [libraryCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT * FROM usersgamelibrary WHERE user_id = ? AND game_id = ?",
            [uid, game_id]
        );
        if (libraryCheck.length > 0) {
            return res.status(409).json({ message: "Game already exists in your library." });
        }

        const [basketCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT * FROM basket WHERE uid = ? AND game_id = ?",
            [uid, game_id]
        );
        if (basketCheck.length > 0) {
            return res.status(409).json({ message: "Game already in basket." });
        }

        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO basket (uid, game_id) VALUES (?, ?)",
            [uid, game_id]
        );

        return res.status(201).json({ message: "Game added to basket successfully.", bid: results.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route GET /api/users/:user_id/basket
 * @desc ดูตะกร้า
 */
export const getBasket_api = async (req: Request, res: Response) => {
    const uid = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT b.bid, g.game_id, g.name, g.price
            FROM basket b
            JOIN game g ON b.game_id = g.game_id
            WHERE b.uid = ?`,
            [uid]
        );
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route DELETE /api/users/:user_id/basket/:bid
 * @desc ลบเกมออกจากตะกร้า
 */
export const removeFromBasket_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    const bid = Number(req.params.bid);
    
    try {
        const [results] = await dbcon.query<OkPacket>(
            "DELETE FROM basket WHERE bid = ? AND uid = ?", 
            [bid, user_id]
        );
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Item not found in basket or access denied." });
        }
        
        return res.status(200).json({ message: "Item removed from basket." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Library (สำหรับ User) ---

/**
 * @route GET /api/users/:user_id/library
 * @desc ดูคลังเกม
 */
export const getUserGameLibrary_api = async (req: Request, res: Response) => {
    const user_id = Number(req.params.user_id);
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.image, g.release_date
            FROM usersgamelibrary u
            JOIN game g ON u.game_id = g.game_id
            WHERE u.user_id = ?
            ORDER BY u.purchase_date DESC`,
            [user_id]
        );
        
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

// --- Discount Code CRUD (สำหรับ Admin) ---

/**
 * @route GET /api/admin/discounts
 * @desc Admin ดูโค้ดส่วนลดทั้งหมด
 */
export const getAllDiscountCodes_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>("SELECT * FROM discountcode");
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};

/**
 * @route POST /api/admin/discounts
 * @desc Admin เพิ่มโค้ดส่วนลด
 */
export const createDiscountCode_api = async (req: Request, res: Response) => {
    const { code_name, discount_value, max_user } = req.body;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO discountcode(code_name, discount_value, remaining_user, max_user) VALUES (?, ?, ?, ?)",
            [code_name, discount_value, max_user, max_user]
        );
        
        if (results.affectedRows > 0) {
            return res.status(201).json({ message: "Discount code created successfully.", code_id: results.insertId });
        }
        res.status(400).json({ message: "Failed to create discount code." });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during code creation.", error: err.message });
    }
};

/**
 * @route DELETE /api/admin/discounts/:code_id
 * @desc Admin ลบโค้ดส่วนลด
 */
export const deleteDiscountCode_api = async (req: Request, res: Response) => {
    const code_id = Number(req.params.code_id);
    try {
        const [results] = await dbcon.query<OkPacket>("DELETE FROM discountcode WHERE code_id = ?", [code_id]);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Discount code not found." });
        }

        return res.status(200).json({ message: "Discount code deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error." });
    }
};