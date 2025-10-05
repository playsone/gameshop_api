// router.ts (ฉบับสมบูรณ์และแก้ไข)
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
router.post("/auth/register", register_api);
router.post("/auth/login", login_api);

// USER MANAGEMENT (Admin/User)
router.get("/users", getAllUsers_api); 
router.get("/users/by-email/:email", getUserByEmail_api); // 💡 NEW: ดึงข้อมูลผู้ใช้ด้วย Email
router.get("/users/by-username/:username", getUserByUsername_api); // ✅ NEW: ดึงข้อมูลผู้ใช้ด้วย Username (ตามที่ร้องขอ)
router.get("/users/:user_id", getUsersById_api); // 💡 NEW: ดึงข้อมูลผู้ใช้ด้วย ID

// USER PROFILE
router.get("/users/:user_id/profile", getUserProfile_api);
router.put("/users/:user_id/profile", updateUser_api);

// SYSTEM MANAGEMENT (Admin Only)
router.post("/system/reset", reset_api); // 💡 NEW: ล้างฐานข้อมูล
router.post("/system/setup-db", setupDB_api); // 💡 NEW: ติดตั้งฐานข้อมูลเริ่มต้น


// =======================================================
// 2. WALLET & PURCHASE
// =======================================================
router.get("/users/:user_id/wallet", getWalletBalance_api);
router.get("/users/:user_id/history", getTransactionHistory_api);
router.get("/users/:user_id/purchases", getGamePurchaseHistory_api);

router.post("/users/:user_id/topup", topUpWallet_api); 
router.post("/users/:user_id/purchase", purchaseGame_api); 

// 💡 NEW: การใช้โค้ดส่วนลดในตะกร้า (User Action)
router.post("/users/:user_id/basket/apply-discount", applyDiscount_api);


// =======================================================
// 3. GAME STORE
// =======================================================
router.get("/gametypes", getAllGameTypes_api); // 💡 NEW: ดึงรายการประเภทเกมทั้งหมด

router.get("/games/latest", getLatestGames_api);
router.get("/games/top-sellers", getTopSellerGames_api);
router.get("/games/search", searchGames_api); // ✅ EDITED: รองรับการค้นหาด้วยชื่อ (%a%) และกรองด้วย type_id
router.get("/games/:game_id", getGameDetails_api);

// USER LIBRARY & BASKET
router.get("/users/:user_id/library", getUserGameLibrary_api);
router.get("/users/:user_id/basket", getBasket_api);
router.post("/users/:user_id/basket/:game_id", addToBasket_api);
router.delete("/users/:user_id/basket/:bid", removeFromBasket_api);


// =======================================================
// 4. ADMIN ROUTES
// =======================================================

// --- Transaction Admin ---
router.get("/admin/transactions", getAdminTransactionHistory_api); // 💡 NEW: ดูประวัติธุรกรรมรวมของทุก User

// --- Game Management ---
router.get("/admin/games", getAllGames_api); // 💡 NEW: ดึงรายการเกมทั้งหมด (Admin View)
router.post("/admin/games", createGame_api); 
router.put("/admin/games/:game_id", updateGame_api); 
router.delete("/admin/games/:game_id", deleteGame_api); 

// --- Game Type Management ---
router.post("/admin/gametypes", createGameType_api); 

// --- Discount Management ---
router.get("/admin/discounts", getAllDiscountCodes_api);
router.post("/admin/discounts", createDiscountCode_api);
router.delete("/admin/discounts/:code_id", deleteDiscountCode_api); 

export default router;