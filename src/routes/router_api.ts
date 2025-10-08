// router.ts (ฉบับสมบูรณ์)
import express from "express";

// --- Import Controllers ---
import {
    register_api, login_api, updateUser_api, getUserProfile_api,
    getAllUsers_api, 
    getUsersById_api, getUserByEmail_api, 
    getUserByUsername_api, 
    reset_api, setupDB_api
} from "../controllers/user_api";

import {
    createGame_api, updateGame_api, deleteGame_api, createGameType_api,
    getLatestGames_api, searchGames_api, getGameDetails_api, getTopSellerGames_api,
    addToBasket_api, getBasket_api, removeFromBasket_api, getUserGameLibrary_api,
    getAllDiscountCodes_api, createDiscountCode_api, deleteDiscountCode_api,
    getAllGameTypes_api, getAllGames_api, applyDiscount_api 
} from "../controllers/game_api";

import {
    getWalletBalance_api, topUpWallet_api, getTransactionHistory_api,
    getGamePurchaseHistory_api, purchaseGame_api,
    getAdminTransactionHistory_api,
    purchaseGame_api2,
    getWalletHistory_api // ✅ เพิ่ม import ฟังก์ชันใหม่
} from "../controllers/wallet_api";


const router = express.Router();
router.get('/', (_req, res) => {
    res.send('Welcome to the Game Shop API');
});

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
router.get("/users/by-email/:email", getUserByEmail_api);
// GET /api/users/by-username/:username
router.get("/users/by-username/:username", getUserByUsername_api);
// GET /api/users/:user_id
router.get("/users/:user_id", getUsersById_api);

// USER PROFILE
// GET /api/users/:user_id/profile
router.get("/users/:user_id/profile", getUserProfile_api);
// PUT /api/users/:user_id/profile
router.put("/users/:user_id/profile", updateUser_api);

// SYSTEM MANAGEMENT (Admin Only)
// POST /api/system/reset
router.post("/system/reset", reset_api);
// POST /api/system/setup-db
router.post("/system/setup-db", setupDB_api);


// =======================================================
// 2. WALLET & PURCHASE
// =======================================================
// GET /api/users/:user_id/wallet
router.get("/users/:user_id/wallet", getWalletBalance_api);

// ✅ NEW ROUTE: เพิ่มเส้นทางสำหรับดูประวัติเงินเข้า-ออกโดยเฉพาะ
router.get("/users/:user_id/wallet/history", getWalletHistory_api);

// GET /api/users/:user_id/history
router.get("/users/:user_id/history", getTransactionHistory_api);
// GET /api/users/:user_id/purchases
router.get("/users/:user_id/purchases", getGamePurchaseHistory_api);

// POST /api/users/:user_id/topup
router.post("/users/:user_id/topup", topUpWallet_api); 
// POST /api/users/:user_id/purchase (ซื้อเกมเดียว)
router.post("/users/:user_id/purchase", purchaseGame_api); 
// POST /api/users/:user_id/purchase-basket (ซื้อจากตะกร้า)
// 💡 แก้ไข: ควรแยก path เพื่อความชัดเจน
router.post("/users/:user_id/purchase-basket", purchaseGame_api2); 


// POST /api/users/:user_id/basket/apply-discount
router.post("/users/:user_id/basket/apply-discount", applyDiscount_api);


// =======================================================
// 3. GAME STORE
// =======================================================
// GET /api/gametypes
router.get("/gametypes", getAllGameTypes_api);

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
router.get("/admin/transactions", getAdminTransactionHistory_api);

// --- Game Management ---
// GET /api/admin/games
router.get("/admin/games", getAllGames_api);
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