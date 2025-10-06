// controllers/gameController.ts
import { Request, Response } from "express";
import { dbcon } from "../database/pool";
import { OkPacket, RowDataPacket } from 'mysql2';
import { Console } from "console";

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

    } catch (error) {
        console.error("Error creating game:", error);
        return res.status(500).json({ message: "Server error while creating game." });
    }
};

/**
 * @route PUT /api/admin/games/:game_id
 * @desc Admin จัดการเกม (CRUD) - Update Game
 */
export const updateGame_api = async (req: Request, res: Response) => {
    const game_id = req.params.game_id;
    // 💡 ปรับปรุง: ไม่รับ release_date จาก req.body เพราะจะไม่อัปเดตฟิลด์นี้
    const { name, price, description, image, type_id } = req.body;

    // ✅ การตรวจสอบความถูกต้องของข้อมูล (Validation)
    if (!name || !price || !type_id) {
        return res.status(400).json({ message: "Missing required fields for update: name, price, and type_id are mandatory." });
    }
    const numPrice = Number(price);
    const numTypeId = Number(type_id);

    if (isNaN(numPrice) || isNaN(numTypeId) || numPrice < 0) {
        return res.status(400).json({ message: "Price and Type ID must be valid non-negative numbers." });
    }

    try {
        const [results] = await dbcon.query<OkPacket>(
            "UPDATE game SET name = ?, price = ?, description = ?, image = ?, type_id = ? WHERE game_id = ?",
            [name, numPrice, description || null, image || null, numTypeId, game_id]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Game not found or no changes made." });
        }

        return res.status(200).json({ message: "Game updated successfully." });

    } catch (error) {
        console.error(`Error updating game ${game_id}:`, error);
        return res.status(500).json({ message: "Server error while updating game." });
    }
};

/**
 * @route DELETE /api/admin/games/:game_id
 * @desc Admin จัดการเกม (CRUD) - Delete Game
 */
export const deleteGame_api = async (req: Request, res: Response) => {
    const game_id = req.params.game_id;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "DELETE FROM game WHERE game_id = ?",
            [game_id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Game not found." });
        }
        return res.status(200).json({ message: "Game deleted successfully." });
    } catch (error) {
        console.error(`Error deleting game ${game_id}:`, error);
        // ในระบบจริง ควรตรวจสอบ Error Code เพื่อจัดการ Foreign Key constraint
        return res.status(500).json({ message: "Server error while deleting game." });
    }
};


// --- Game Type Management (สำหรับ Admin) ---

/**
 * @route POST /api/admin/gametypes
 * @desc Admin จัดการประเภทเกม - Insert Game Type
 */
export const createGameType_api = async (req: Request, res: Response) => {
    const { typename } = req.body;

    if (!typename) {
        return res.status(400).json({ message: "Missing required field: typename is mandatory." });
    }

    try {
        // ตรวจสอบความซ้ำซ้อน
        const [existing] = await dbcon.query<RowDataPacket[]>(
            "SELECT type_id FROM gametype WHERE typename = ?",
            [typename]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: "Game type already exists." });
        }

        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO gametype(typename) VALUES (?)",
            [typename]
        );
        return res.status(201).json({ message: "Game type created successfully.", type_id: results.insertId });

    } catch (error) {
        console.error("Error creating game type:", error);
        return res.status(500).json({ message: "Server error while creating game type." });
    }
};


// --- Discount Management (สำหรับ Admin) ---

/**
 * @route POST /api/admin/discounts
 * @desc Admin จัดการส่วนลด - สร้างโค้ดส่วนลดใหม่
 * @body { code_name: string, discount_value: number, max_user: number }
 */
export const createDiscountCode_api = async (req: Request, res: Response) => {
    const { code_name, discount_value, max_user } = req.body;

    // 1. Validation
    if (!code_name || discount_value === undefined || max_user === undefined) {
        return res.status(400).json({ message: "Missing required fields: code_name, discount_value, and max_user are mandatory." });
    }
    const numDiscountValue = Number(discount_value);
    const numMaxUser = Number(max_user);

    // discount_value ต้องมากกว่า 0 (ส่วนลดต้องมีค่า), max_user ต้องมากกว่าหรือเท่ากับ 1
    if (isNaN(numDiscountValue) || isNaN(numMaxUser) || numDiscountValue <= 0 || numMaxUser < 1) {
        return res.status(400).json({ message: "Discount value must be a positive number, and Max User must be a positive integer." });
    }

    try {
        // 2. Check for existing code name
        const [existing] = await dbcon.query<RowDataPacket[]>(
            "SELECT code_id FROM discountcode WHERE code_name = ?",
            [code_name]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: `Discount code '${code_name}' already exists.` });
        }

        // 3. Insert new code
        // remaining_user เริ่มต้นเท่ากับ max_user
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO discountcode(code_name, discount_value, max_user, remaining_user) VALUES (?, ?, ?, ?)",
            [code_name, numDiscountValue, numMaxUser, numMaxUser]
        );

        return res.status(201).json({
            message: "Discount code created successfully.",
            code_id: results.insertId,
            code_name,
            discount_value: numDiscountValue,
            max_user: numMaxUser
        });

    } catch (error) {
        console.error("Error creating discount code:", error);
        return res.status(500).json({ message: "Server error while creating discount code." });
    }
};

/**
 * @route GET /api/admin/discounts
 * @desc Admin จัดการส่วนลด - ดึงโค้ดส่วนลดทั้งหมด
 */
export const getAllDiscountCodes_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            "SELECT code_id, code_name, discount_value, remaining_user, max_user FROM discountcode ORDER BY code_id DESC"
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching all discount codes:", error);
        return res.status(500).json({ message: "Server error while fetching discount codes." });
    }
};

/**
 * @route DELETE /api/admin/discounts/:code_id
 * @desc Admin จัดการส่วนลด - ลบโค้ดส่วนลด
 */
export const deleteDiscountCode_api = async (req: Request, res: Response) => {
    const code_id = req.params.code_id;
    try {
        const [results] = await dbcon.query<OkPacket>(
            "DELETE FROM discountcode WHERE code_id = ?",
            [code_id]
        );
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Discount code not found." });
        }
        return res.status(200).json({ message: "Discount code deleted successfully." });
    } catch (error) {
        console.error(`Error deleting discount code ${code_id}:`, error);
        // ในระบบจริง ควรตรวจสอบ Error Code เพื่อจัดการ Foreign Key constraint
        return res.status(500).json({ message: "Server error while deleting discount code." });
    }
};


// --- Game Type (สำหรับ User) ---


/**
 * @route GET /api/gametypes
 * @desc ดึงรายการประเภทเกมทั้งหมด
 */
export const getAllGameTypes_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            "SELECT type_id, typename FROM gametype ORDER BY typename ASC"
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching game types:", error);
        return res.status(500).json({ message: "Server error while fetching game types." });
    }
};


// --- Game Fetching (สำหรับ User/Guest) ---

/**
 * @route GET /api/games/latest
 * @desc ดึงรายการเกมล่าสุด 10 เกม
 */
export const getLatestGames_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.image, gt.typename
             FROM game g
             JOIN gametype gt ON g.type_id = gt.type_id
             ORDER BY g.release_date DESC
             LIMIT 10`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching latest games:", error);
        return res.status(500).json({ message: "Server error while fetching latest games." });
    }
};

/**
 * @route GET /api/games/top-sellers
 * @desc ดึงรายการ 5 อันดับเกมขายดี
 * @requires การเชื่อมโยงตาราง game, gametransactionitem และการนับยอดขาย
 */
export const getTopSellerGames_api = async (req: Request, res: Response) => {
    try {
        // 1. Query เพื่อหา 5 อันดับเกมที่มีการซื้อมากที่สุด (นับจากจำนวนรายการใน Transaction)
        const sql = `
            SELECT 
                g.game_id, 
                g.name, 
                g.price, 
                g.description, 
                g.image, 
                g.release_date, 
                gt.type_name, 
                COUNT(gi.game_id) AS total_sales
            FROM game g
            JOIN gametype gt ON g.type_id = gt.type_id
            JOIN gametransactionitem gi ON g.game_id = gi.game_id 
            GROUP BY g.game_id, g.name, g.price, g.description, g.image, g.release_date, gt.type_name
            ORDER BY total_sales DESC
            LIMIT 5;
        `;
        
        const [games] = await dbcon.query<RowDataPacket[]>(sql);

        // 2. คืนค่ารายการเกมที่พบ
        return res.status(200).json(games);

    } catch (error) {
        console.error("Database error in getTopSellerGames_api:", error);
        // ❌ หากเกิดข้อผิดพลาดในการ Query ให้คืนค่า 500
        return res.status(500).json({ message: "Failed to fetch top seller games due to a server error." });
    }
};

/**
 * @route GET /api/games/search
 * @desc ค้นหาเกมด้วย keyword ในชื่อ และกรองด้วย type_id
 * @query keyword (optional)
 * @query type_id (optional)
 */
export const searchGames_api = async (req: Request, res: Response) => {
    const { keyword, type_id } = req.query;

    let query = `
        SELECT g.game_id, g.name, g.price, g.release_date, g.image, gt.typename
        FROM game g
        JOIN gametype gt ON g.type_id = gt.type_id
        WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (keyword) {
        query += ` AND g.name LIKE ?`;
        params.push(`%${keyword}%`);
    }

    if (type_id) {
        const numTypeId = Number(type_id);
        if (!isNaN(numTypeId) && numTypeId > 0) {
            query += ` AND g.type_id = ?`;
            params.push(numTypeId);
        }
    }

    query += ` ORDER BY g.name ASC`;

    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(query, params);
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error searching games:", error);
        return res.status(500).json({ message: "Server error while searching games." });
    }
};

/**
 * @route GET /api/games/:game_id
 * @desc ดึงรายละเอียดเกมเดียว
 */
export const getGameDetails_api = async (req: Request, res: Response) => {
    const game_id = req.params.game_id;
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, g.type_id, gt.typename
             FROM game g
             JOIN gametype gt ON g.type_id = gt.type_id
             WHERE g.game_id = ?`,
            [game_id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Game not found." });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error(`Error fetching game ${game_id} details:`, error);
        return res.status(500).json({ message: "Server error while fetching game details." });
    }
};

/**
 * @route GET /api/admin/games
 * @desc ดึงรายการเกมทั้งหมด (Admin View)
 */
export const getAllGames_api = async (req: Request, res: Response) => {
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT g.game_id, g.name, g.price, g.release_date, g.image, g.description, gt.typename
             FROM game g
             JOIN gametype gt ON g.type_id = gt.type_id
             ORDER BY g.game_id DESC`
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Error fetching all games for admin:", error);
        return res.status(500).json({ message: "Server error while fetching all games." });
    }
};


// --- Basket Management (สำหรับ User) ---

/**
 * @route GET /api/users/:user_id/basket
 * @desc ดึงรายการเกมในตะกร้าของ User
 */
export const getBasket_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;

    try {
        // ดึงรายการในตะกร้าและ join กับข้อมูลเกม
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT b.bid, b.uid, b.game_id, b.added_at, g.name AS game_name, g.price, g.image
             FROM basket b
             JOIN game g ON b.game_id = g.game_id
             WHERE b.uid = ?
             ORDER BY b.added_at DESC`,
            [uid]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching basket for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while fetching basket." });
    }
};

/**
 * @route POST /api/users/:user_id/basket/:game_id
 * @desc เพิ่มเกมเข้าตะกร้า
 */
export const addToBasket_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;
    const game_id = req.params.game_id;

    try {
        // 1. ตรวจสอบว่าเกมอยู่ในคลังแล้วหรือไม่
        const [libraryCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT purchase_id FROM gamelibrary WHERE user_id = ? AND game_id = ?",
            [uid, game_id]
        );
        if (libraryCheck.length > 0) {
            return res.status(409).json({ message: "Game is already in your library." });
        }

        // 2. ตรวจสอบว่าเกมอยู่ในตะกร้าแล้วหรือไม่
        const [basketCheck] = await dbcon.query<RowDataPacket[]>(
            "SELECT bid FROM basket WHERE uid = ? AND game_id = ?",
            [uid, game_id]
        );
        if (basketCheck.length > 0) {
            return res.status(409).json({ message: "Game is already in your basket." });
        }

        // 3. เพิ่มเกมเข้าตะกร้า
        const [results] = await dbcon.query<OkPacket>(
            "INSERT INTO basket(uid, game_id, added_at) VALUES (?, ?, NOW())",
            [uid, game_id]
        );

        return res.status(201).json({ message: "Game added to basket successfully.", bid: results.insertId });

    } catch (error) {
        console.error(`Error adding game ${game_id} to basket for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while adding to basket." });
    }
};

/**
 * @route DELETE /api/users/:user_id/basket/:bid
 * @desc ลบเกมออกจากตะกร้า
 */
export const removeFromBasket_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;
    const bid = req.params.bid; // Basket ID

    try {
        const [results] = await dbcon.query<OkPacket>(
            "DELETE FROM basket WHERE bid = ? AND uid = ?",
            [bid, uid]
        );

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Basket item not found or does not belong to user." });
        }

        return res.status(200).json({ message: "Game removed from basket successfully." });
    } catch (error) {
        console.error(`Error removing basket item ${bid} for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while removing from basket." });
    }
};


// --- Game Purchase and Library (สำหรับ User) ---

/**
 * @route GET /api/users/:user_id/library
 * @desc ดึงรายการเกมในคลัง (Library) ของ User
 */
export const getUserGameLibrary_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;
    try {
        const [rows] = await dbcon.query<RowDataPacket[]>(
            `SELECT gl.purchase_id, gl.game_id, gl.purchase_date, g.name AS game_name, g.image, g.description, gt.typename
             FROM gamelibrary gl
             JOIN game g ON gl.game_id = g.game_id
             JOIN gametype gt ON g.type_id = gt.type_id
             WHERE gl.user_id = ?
             ORDER BY gl.purchase_date DESC`,
            [uid]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error(`Error fetching library for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while fetching game library." });
    }
};

/**
 * @route POST /api/users/:user_id/purchase
 * @desc ดำเนินการซื้อเกมในตะกร้าทั้งหมด
 * @body { code_name: string | null }
 */
export const purchaseGame_api = async (req: Request, res: Response) => {
    const uid = Number(req.params.user_id);
    const { code_name } = req.body;
    let dbcon_transaction; // ใช้สำหรับ transaction

    try {
        dbcon_transaction = await dbcon.getConnection();
        await dbcon_transaction.beginTransaction();

        // 1. ดึงรายการเกมในตะกร้า
        const [basketRows] = await dbcon_transaction.query<RowDataPacket[]>(
            `SELECT b.bid, b.game_id, g.price
             FROM basket b
             JOIN game g ON b.game_id = g.game_id
             WHERE b.uid = ?`,
            [uid]
        );

        if (basketRows.length === 0) {
            await dbcon_transaction.commit(); // ไม่มีเกมในตะกร้า ถือว่าสำเร็จ (ไม่ซื้ออะไรเลย)
            return res.status(200).json({ message: "Basket is empty. No purchase made." });
        }

        const subtotal = basketRows.reduce((sum, item) => sum + item.price, 0);
        let finalTotal = subtotal;
        let discountCode = null;
        let discountAmount = 0;
        let codeId = null;

        // 2. การประยุกต์ใช้ส่วนลด (ถ้ามี)
        if (code_name) {
            const [codeRows] = await dbcon_transaction.query<RowDataPacket[]>(
                "SELECT code_id, discount_value, remaining_user FROM discountcode WHERE code_name = ? FOR UPDATE",
                [code_name] // FOR UPDATE เพื่อป้องกันการใช้พร้อมกัน
            );
            discountCode = codeRows[0];

            if (!discountCode || discountCode.remaining_user <= 0) {
                await dbcon_transaction.rollback();
                return res.status(400).json({ message: "Invalid or expired discount code." });
            }

            // ตรวจสอบการใช้ซ้ำ (1 ครั้ง/บัญชี)
            const [usageCheck] = await dbcon_transaction.query<RowDataPacket[]>(
                "SELECT transaction_id FROM gametransaction WHERE user_id = ? AND code_id = ?",
                [uid, discountCode.code_id]
            );
            if (usageCheck.length > 0) {
                await dbcon_transaction.rollback();
                return res.status(409).json({ message: "You have already used this discount code." });
            }

            discountAmount = discountCode.discount_value;
            finalTotal = Math.max(0, subtotal - discountAmount);
            codeId = discountCode.code_id;

            // 3. หักจำนวนการใช้ส่วนลด
            await dbcon_transaction.query(
                "UPDATE discountcode SET remaining_user = remaining_user - 1 WHERE code_id = ?",
                [discountCode.code_id]
            );
        }

        // 4. ตรวจสอบยอดเงินคงเหลือใน Wallet
        const [walletRows] = await dbcon_transaction.query<RowDataPacket[]>(
            "SELECT balance FROM wallet WHERE user_id = ? FOR UPDATE",
            [uid] // FOR UPDATE เพื่อป้องกันการใช้จ่ายพร้อมกัน
        );
        const currentBalance = walletRows[0]?.balance || 0;

        if (currentBalance < finalTotal) {
            await dbcon_transaction.rollback();
            return res.status(402).json({
                message: "Insufficient wallet balance.",
                required_amount: finalTotal,
                current_balance: currentBalance
            });
        }

        // 5. ดำเนินการซื้อ (Purchase)
        // 5.1 สร้าง Transaction
        const [purchaseResult] = await dbcon_transaction.query<OkPacket>(
            "INSERT INTO gametransaction(user_id, total_amount, discount_used, final_amount, code_id, transaction_date) VALUES (?, ?, ?, ?, ?, NOW())",
            [uid, subtotal, discountAmount, finalTotal, codeId]
        );
        const transactionId = purchaseResult.insertId;

        // 5.2 หักยอดเงินจาก Wallet
        await dbcon_transaction.query(
            "UPDATE wallet SET balance = balance - ? WHERE user_id = ?",
            [finalTotal, uid]
        );

        // 5.3 เพิ่มรายการเกมเข้าคลัง และบันทึก Transaction Items
        for (const item of basketRows) {
            // เพิ่มเข้าคลัง
            await dbcon_transaction.query(
                "INSERT INTO gamelibrary(user_id, game_id, purchase_date) VALUES (?, ?, NOW())",
                [uid, item.game_id]
            );
            // บันทึกรายการใน Transaction
            await dbcon_transaction.query(
                "INSERT INTO gametransactionitem(transaction_id, game_id, price_paid) VALUES (?, ?, ?)",
                [transactionId, item.game_id, item.price] // ใช้ราคาเต็มของแต่ละเกม
            );
        }

        // 5.4 ล้างตะกร้าสินค้า
        await dbcon_transaction.query(
            "DELETE FROM basket WHERE uid = ?",
            [uid]
        );

        // 6. Commit Transaction
        await dbcon_transaction.commit();

        return res.status(200).json({
            message: "Purchase successful.",
            transaction_id: transactionId,
            final_amount: finalTotal,
            purchased_items: basketRows.length
        });

    } catch (error) {
        if (dbcon_transaction) {
            await dbcon_transaction.rollback();
        }
        console.error("Error during purchase transaction:", error);
        return res.status(500).json({ message: "Server error during purchase process." });
    } finally {
        if (dbcon_transaction) {
            dbcon_transaction.release();
        }
    }
};

/**
 * @route POST /api/discounts/apply
 * @desc ตรวจสอบและคำนวณส่วนลดสำหรับตะกร้า
 * @body { code_name: string, user_id: number }
 * @response { message: string, code_name: string, subtotal_price: number, discount_value: number, final_price: number }
 * @deprecated เนื่องจากรวมฟังก์ชันการตรวจสอบส่วนลดไว้ใน purchaseGame_api แล้ว
 */
export const applyDiscount_api = async (req: Request, res: Response) => {
    const { code_name, user_id } = req.body;
    const uid = Number(user_id);

    if (!code_name || !uid) {
        return res.status(400).json({ message: "Missing required fields: code_name and user_id." });
    }

    try {
        // 1. ดึงราคารวมในตะกร้า (Subtotal)
        const [basketRows] = await dbcon.query<RowDataPacket[]>(
            `SELECT SUM(g.price) AS subtotal
             FROM basket b
             JOIN game g ON b.game_id = g.game_id
             WHERE b.uid = ?`,
            [uid]
        );
        const subtotal = basketRows[0]?.subtotal || 0;

        if (subtotal === 0) {
             return res.status(400).json({ message: "Basket is empty." });
        }

        // 2. ดึงข้อมูลโค้ดส่วนลดและสถานะการใช้งาน (ไม่ต้องใช้ FOR UPDATE เพราะแค่คำนวณ ไม่ได้หักลบ)
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

    } catch (error) {
        console.error("Error applying discount:", error);
        return res.status(500).json({ message: "Server error while applying discount." });
    }
};

// --- Transaction History (สำหรับ User) ---

/**
 * @route GET /api/users/:user_id/history/transactions
 * @desc ดึงประวัติการทำรายการ (เติมเงิน/ซื้อเกม)
 */
export const getTransactionHistory_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;
    try {
        // ดึงประวัติการเติมเงิน
        const [topupRows] = await dbcon.query<RowDataPacket[]>(
            `SELECT topup_id, amount, transaction_date, 'TOPUP' as type
             FROM topup
             WHERE user_id = ?`,
            [uid]
        );

        // ดึงประวัติการซื้อเกม
        const [purchaseRows] = await dbcon.query<RowDataPacket[]>(
            `SELECT transaction_id, final_amount as amount, transaction_date, 'PURCHASE' as type
             FROM gametransaction
             WHERE user_id = ?`,
            [uid]
        );

        // รวมและเรียงลำดับรายการทั้งหมดตามวันที่
        const combinedHistory = [...topupRows, ...purchaseRows]
            .map(row => ({
                id: row.topup_id || row.transaction_id,
                amount: row.amount,
                type: row.type,
                date: row.transaction_date,
            }))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return res.status(200).json(combinedHistory);
    } catch (error) {
        console.error(`Error fetching transaction history for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while fetching transaction history." });
    }
};

/**
 * @route GET /api/users/:user_id/history/purchases
 * @desc ดึงประวัติการซื้อเกมโดยละเอียด
 */
export const getGamePurchaseHistory_api = async (req: Request, res: Response) => {
    const uid = req.params.user_id;

    try {
        // ดึงรายการ Transaction หลัก
        const [transactions] = await dbcon.query<RowDataPacket[]>(
            `SELECT transaction_id, total_amount, discount_used, final_amount, code_id, transaction_date
             FROM gametransaction
             WHERE user_id = ?
             ORDER BY transaction_date DESC`,
            [uid]
        );

        // ดึงรายการเกมที่ซื้อในแต่ละ Transaction
        const history = await Promise.all(transactions.map(async (tx) => {
            const [items] = await dbcon.query<RowDataPacket[]>(
                `SELECT gtx.item_id, gtx.game_id, gtx.price_paid, g.name AS game_name
                 FROM gametransactionitem gtx
                 JOIN game g ON gtx.game_id = g.game_id
                 WHERE gtx.transaction_id = ?`,
                [tx.transaction_id]
            );

            // ดึงชื่อโค้ดส่วนลด (ถ้ามี)
            let code_name = null;
            if (tx.code_id) {
                const [codeRow] = await dbcon.query<RowDataPacket[]>(
                    "SELECT code_name FROM discountcode WHERE code_id = ?",
                    [tx.code_id]
                );
                code_name = codeRow[0]?.code_name || null;
            }


            return {
                ...tx,
                code_name,
                items: items
            };
        }));

        return res.status(200).json(history);
    } catch (error) {
        console.error(`Error fetching game purchase history for user ${uid}:`, error);
        return res.status(500).json({ message: "Server error while fetching game purchase history." });
    }
};
