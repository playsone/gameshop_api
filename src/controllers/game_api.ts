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
    // 💡 ปรับปรุง: ไม่รับ release_date จาก req.body เพราะจะใช้ NOW() แทน
    const { name, price, description, image, type_id } = req.body; 

    // ✅ การตรวจสอบความถูกต้องของข้อมูล (Validation) เพื่อป้องกัน 500
    if (!name || !price || !type_id) {
        return res.status(400).json({ message: "Missing required fields: name, price, and type_id are mandatory." });
    }
    const numPrice = Number(price);
    const numTypeId = Number(type_id);
    if (isNaN(numPrice) || isNaN(numTypeId) || numPrice < 0) {
        return res.status(400).json({ message: "Price and Type ID must be valid non-negative numbers." });
    }

    try {
        const [results] = await dbcon.query<OkPacket>(
            // ✅ ใช้ NOW() ใน SQL แทนค่าที่ส่งมา
            "INSERT INTO game(name, price, release_date, description, image, type_id) VALUES (?, ?, NOW(), ?, ?, ?)",
            [name, numPrice, description || null, image || null, numTypeId]
        );
        
        return res.status(201).json({ message: "Game created successfully.", game_id: results.insertId });
    } catch (err: any) {
        console.error(err);
        // ข้อผิดพลาดที่เกิดจากการเชื่อมโยงคีย์ (Foreign Key) จะมาที่นี่
        res.status(500).json({ message: "Server error during game creation.", error: err.message });
    }
};

/**
 * @route PUT /api/admin/games/:game_id
 * @desc Admin จัดการเกม (CRUD) - Update Game
 */
export const updateGame_api = async (req: Request, res: Response) => {
    const game_id = Number(req.params.game_id);
    // 💡 ปรับปรุง: ไม่รับ release_date จาก req.body เพราะจะใช้ NOW() แทน
    const { name, price, description, image, type_id } = req.body; 

    // ✅ การตรวจสอบ game_id
    if (isNaN(game_id) || game_id <= 0) {
        return res.status(400).json({ message: "Invalid Game ID in request parameters." });
    }
    // (ควรมีการตรวจสอบ name, price, type_id เพิ่มเติมที่นี่ด้วย)

    try {
        const [results] = await dbcon.query<OkPacket>(
            // ✅ กำหนด release_date = NOW() เพื่ออัปเดตเวลาปัจจุบัน
            "UPDATE game SET name = ?, price = ?, release_date = NOW(), description = ?, image = ?, type_id = ? WHERE game_id = ?",
            [name, price, description || null, image || null, Number(type_id), game_id]
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
    if (isNaN(game_id) || game_id <= 0) {
        return res.status(400).json({ message: "Invalid Game ID." });
    }
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
    
    // ✅ การตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (!typename || typeof typename !== 'string' || typename.trim() === '') {
        return res.status(400).json({ message: "Game type name (typename) is required." });
    }
    
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

// --- NEW: API ค้นหาเกมตามชื่อและชนิดที่ปรับปรุงแล้ว ---
/**
 * @route GET /api/games/search
 * @desc ค้นหาเกม (ชื่อ) และ/หรือ กรองตามประเภท
 * @queryParam q (string, optional): ชื่อเกมที่ต้องการค้นหา (LIKE %a%)
 * @queryParam type_id (number, optional): ID ของประเภทเกมที่ต้องการกรอง
 */
export const searchGames_api = async (req: Request, res: Response) => {
    // ดึงค่าจาก query parameters
    const search_term = (req.query.q as string)?.trim() || '';
    const type_id = (req.query.type_id as string)?.trim();

    let sql = `
        SELECT g.game_id, g.name, g.price, g.image, t.typename AS type
        FROM game g
        JOIN gametype t ON g.type_id = t.type_id
    `;
    const params: (string | number)[] = [];
    const whereConditions: string[] = [];

    // 1. เงื่อนไขค้นหาชื่อเกม (LIKE %q%)
    if (search_term) {
        const wildcard_term = `%${search_term}%`;
        whereConditions.push(`g.name LIKE ?`);
        params.push(wildcard_term);
    }
    
    // 2. เงื่อนไขกรองตามชนิดเกม (g.type_id = ?)
    if (type_id && !isNaN(Number(type_id))) {
        whereConditions.push(`g.type_id = ?`);
        params.push(Number(type_id));
    }
    
    // สร้าง WHERE clause (ถ้ามีเงื่อนไข)
    if (whereConditions.length > 0) {
        sql += ` WHERE ` + whereConditions.join(' AND ');
    }
    
    // จัดเรียงผลลัพธ์
    sql += ` ORDER BY g.name ASC`;
    
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(sql, params);
        
        // ถ้าไม่มีการค้นหาและไม่มีการกรอง และไม่พบอะไรเลย ให้ส่ง 404
        if (rows.length === 0 && (search_term || type_id)) {
            return res.status(404).json({ message: "No games found matching the criteria." });
        }
        
        res.status(200).json(rows);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ message: "Server error during game search.", error: err.message });
    }
};

/**
 * @route GET /api/games/:game_id
 * @desc ดูรายละเอียดเกม
 */
export const getGameDetails_api = async (req: Request, res: Response) => {
    const game_id = Number(req.params.game_id);
    if (isNaN(game_id) || game_id <= 0) {
        return res.status(400).json({ message: "Invalid Game ID." });
    }
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
            `SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type,
                    COUNT(gt.game_id) AS total_sold
             FROM gametransaction gt
             JOIN game g ON gt.game_id = g.game_id
             JOIN gametype t ON g.type_id = t.type_id
             GROUP BY g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename
             HAVING COUNT(gt.game_id) > 0
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
    
    if (isNaN(uid) || uid <= 0 || isNaN(game_id) || game_id <= 0) {
        return res.status(400).json({ message: "Invalid User ID or Game ID." });
    }

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
    if (isNaN(uid) || uid <= 0) {
        return res.status(400).json({ message: "Invalid User ID." });
    }
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
    
    if (isNaN(user_id) || user_id <= 0 || isNaN(bid) || bid <= 0) {
        return res.status(400).json({ message: "Invalid User ID or Basket ID." });
    }
    
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
    if (isNaN(user_id) || user_id <= 0) {
        return res.status(400).json({ message: "Invalid User ID." });
    }
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
    
    // ✅ การตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (!code_name || isNaN(Number(discount_value)) || isNaN(Number(max_user)) || Number(discount_value) <= 0 || Number(max_user) <= 0) {
         return res.status(400).json({ message: "Missing required fields or invalid number values (must be positive)." });
    }
    
    const value = Number(discount_value);
    const remaining_user = Number(max_user);
    
    try {
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO discountcode(code_name, discount_value, remaining_user, max_user) VALUES (?, ?, ?, ?)",
            [code_name, value, remaining_user, max_user]
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
    if (isNaN(code_id) || code_id <= 0) {
        return res.status(400).json({ message: "Invalid Code ID." });
    }
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

// --- 2.3 ดึงประเภทเกมทั้งหมด (NEW) ---
export const getAllGameTypes_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>("SELECT type_id, typename FROM gametype ORDER BY typename ASC");
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching game types." });
    }
};

// --- 2.1 ดึงรายการเกมทั้งหมด (Admin View) (NEW) ---
export const getAllGames_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.image, t.typename AS type
             FROM game g
             JOIN gametype t ON g.type_id = t.type_id
             ORDER BY g.game_id DESC`
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error fetching all games." });
    }
};

// --- 4.2, 5.3 User ใช้โค้ดส่วนลดในตะกร้า (NEW) ---
export const applyDiscount_api = async (req: Request, res: Response) => {
    const uid = Number(req.params.user_id);
    const { code_name } = req.body;
    
    if (isNaN(uid) || uid <= 0) return res.status(400).json({ message: "Invalid User ID." });
    if (!code_name) return res.status(400).json({ message: "Discount code is required." });

    try {
        // 1. คำนวณราคารวมในตะกร้า
        const [basketItems] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.price FROM basket b JOIN game g ON b.game_id = g.game_id WHERE b.uid = ?`,
            [uid]
        );
        if (basketItems.length === 0) return res.status(404).json({ message: "Basket is empty." });
        const subtotal = basketItems.reduce((sum, item) => sum + item.price, 0);

        // 2. ตรวจสอบโค้ดส่วนลด (5.2: จำกัดจำนวนครั้ง)
        const [codeRows] = await dbcon.query<RowDataPacket[]>(
            "SELECT code_id, discount_value, remaining_user FROM discountcode WHERE code_name = ?",
            [code_name]
        );
        const discountCode = codeRows[0];
        if (!discountCode || discountCode.remaining_user <= 0) {
             return res.status(400).json({ message: "Invalid or expired discount code." });
        }

        // 3. ตรวจสอบการใช้ซ้ำ (5.3: 1 ครั้ง/บัญชี)
        const [usageCheck] = await dbcon.query<RowDataPacket[]>(
            // 💡 แก้ไข: ควรตรวจสอบจากตาราง Transaction ว่ามีการใช้ code_id นี้แล้วหรือไม่
            "SELECT transaction_id FROM gametransaction WHERE user_id = ? AND code_id = ?",
            [uid, discountCode.code_id]
        );
        if (usageCheck.length > 0) {
            return res.status(409).json({ message: "You have already used this discount code." });
        }
        
        // 4. คำนวณราคาสุทธิ
        const discountAmount = discountCode.discount_value;
        const finalTotal = Math.max(0, subtotal - discountAmount);

        return res.status(200).json({
            message: "Discount applied.",
            code_name: code_name,
            subtotal_price: subtotal,
            discount_value: discountAmount,
            final_price: finalTotal
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error during discount application." });
    }
};