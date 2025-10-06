// router.ts (ฉบับสมบูรณ์ - ไม่ใช้ Middleware)
import express from "express";

// --- Import Controllers (ปรับปรุงให้ครอบคลุมฟังก์ชันที่จำเป็นทั้งหมด) ---
import {
    register_api, login_api, updateUser_api, getUserProfile_api,
    getAllUsers_api, 
    // 💡 NEW: เพิ่มฟังก์ชันที่ขาดหายไปใน USER/SYSTEM
    getUsersById_api, getUserByEmail_api, 
    // ✅ NEW: เพิ่ม getUserByUsername_api ที่เราสร้างขึ้น
    getUserByUsername_api, 
    reset_api, setupDB_api
} from "../controllers/user_api";

import {
    createGame_api, updateGame_api, deleteGame_api, createGameType_api,
    getLatestGames_api, searchGames_api, getGameDetails_api, getTopSellerGames_api,
    addToBasket_api, getBasket_api, removeFromBasket_api, getUserGameLibrary_api,
    getAllDiscountCodes_api, createDiscountCode_api, deleteDiscountCode_api,
    // 💡 NEW: เพิ่มฟังก์ชันที่ขาดหายไปใน GAME/DISCOUNT
    getAllGameTypes_api, getAllGames_api, applyDiscount_api 
} from "../controllers/game_api";

import {
    getWalletBalance_api, topUpWallet_api, getTransactionHistory_api,
    getGamePurchaseHistory_api, purchaseGame_api,
    // 💡 NEW: เพิ่มฟังก์ชันที่ขาดหายไปใน WALLET/TRANSACTION
    getAdminTransactionHistory_api 
} from "../controllers/wallet_api";


const router = express.Router();


// =======================================================
// 1. USER & AUTH ROUTES
// =======================================================
// POST /api/auth/register
router.post("/auth/register", register_api);
// POST /api/auth/login
router.post("/auth/login", login_api);

// USER MANAGEMENT (Admin/User)
// GET /api/users
router.get("/users", getAllUsers_api); 
// GET /api/users/by-email/:email
router.get("/users/by-email/:email", getUserByEmail_api); // 💡 ดึงข้อมูลผู้ใช้ด้วย Email
// GET /api/users/by-username/:username
router.get("/users/by-username/:username", getUserByUsername_api); // ✅ ดึงข้อมูลผู้ใช้ด้วย Username
// GET /api/users/:user_id
router.get("/users/:user_id", getUsersById_api); // 💡 ดึงข้อมูลผู้ใช้ด้วย ID

// USER PROFILE
// GET /api/users/:user_id/profile
router.get("/users/:user_id/profile", getUserProfile_api);
// PUT /api/users/:user_id/profile
router.put("/users/:user_id/profile", updateUser_api);

// SYSTEM MANAGEMENT (Admin Only)
// POST /api/system/reset
router.post("/system/reset", reset_api); // 💡 ล้างฐานข้อมูล
// POST /api/system/setup-db
router.post("/system/setup-db", setupDB_api); // 💡 ติดตั้งฐานข้อมูลเริ่มต้น


// =======================================================
// 2. WALLET & PURCHASE
// =======================================================
// GET /api/users/:user_id/wallet
router.get("/users/:user_id/wallet", getWalletBalance_api);
// GET /api/users/:user_id/history
router.get("/users/:user_id/history", getTransactionHistory_api);
// GET /api/users/:user_id/purchases
router.get("/users/:user_id/purchases", getGamePurchaseHistory_api);

// POST /api/users/:user_id/topup
router.post("/users/:user_id/topup", topUpWallet_api); 
// POST /api/users/:user_id/purchase
router.post("/users/:user_id/purchase", purchaseGame_api); 

// POST /api/users/:user_id/basket/apply-discount
router.post("/users/:user_id/basket/apply-discount", applyDiscount_api);


// =======================================================
// 3. GAME STORE
// =======================================================
// GET /api/gametypes
router.get("/gametypes", getAllGameTypes_api); // 💡 ดึงรายการประเภทเกมทั้งหมด

// GET /api/games/latest
router.get("/games/latest", getLatestGames_api);
// GET /api/games/top-sellers
router.get("/games/top-sellers", getTopSellerGames_api);
// GET /api/games/search
router.get("/games/search", searchGames_api); 
// GET /api/games/:game_id
router.get("/games/:game_id", getGameDetails_api);

// USER LIBRARY & BASKET
// GET /api/users/:user_id/library
router.get("/users/:user_id/library", getUserGameLibrary_api);
// GET /api/users/:user_id/basket
router.get("/users/:user_id/basket", getBasket_api);
// POST /api/users/:user_id/basket/:game_id
router.post("/users/:user_id/basket/:game_id", addToBasket_api);
// DELETE /api/users/:user_id/basket/:bid
router.delete("/users/:user_id/basket/:bid", removeFromBasket_api);


// =======================================================
// 4. ADMIN ROUTES
// =======================================================

// --- Transaction Admin ---
// GET /api/admin/transactions
router.get("/admin/transactions", getAdminTransactionHistory_api); // 💡 ดูประวัติธุรกรรมรวมของทุก User

// --- Game Management ---
// GET /api/admin/games
router.get("/admin/games", getAllGames_api); // 💡 ดึงรายการเกมทั้งหมด (Admin View)
// POST /api/admin/games
router.post("/admin/games", createGame_api); 
// PUT /api/admin/games/:game_id
router.put("/admin/games/:game_id", updateGame_api); 
// DELETE /api/admin/games/:game_id
router.delete("/admin/games/:game_id", deleteGame_api); 

// --- Game Type Management ---
// POST /api/admin/gametypes
router.post("/admin/gametypes", createGameType_api); 

// --- Discount Management ---
// GET /api/admin/discounts
router.get("/admin/discounts", getAllDiscountCodes_api);
// POST /api/admin/discounts
router.post("/admin/discounts", createDiscountCode_api);
// DELETE /api/admin/discounts/:code_id
router.delete("/admin/discounts/:code_id", deleteDiscountCode_api); 

export default router;
