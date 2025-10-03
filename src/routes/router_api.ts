// router.ts
import express from "express";

// --- Import Controllers ---
// User & Auth
import {
    register_api,
    login_api,
    updateUser_api,
    getUserProfile_api,
    getAllUsers_api 
} from "../controllers/user_api";

// Game Store, Admin & Basket
import {
    createGame_api, updateGame_api, deleteGame_api, createGameType_api,
    getLatestGames_api, searchGames_api, getGameDetails_api, getTopSellerGames_api,
    addToBasket_api, getBasket_api, removeFromBasket_api, getUserGameLibrary_api,
    getAllDiscountCodes_api, createDiscountCode_api, deleteDiscountCode_api
} from "../controllers/game_api";

// Wallet & Transaction
import {
    getWalletBalance_api, topUpWallet_api, getTransactionHistory_api,
    getGamePurchaseHistory_api, purchaseGame_api
} from "../controllers/wallet_api";


const router = express.Router();


// =======================================================
//                   USER & AUTH ROUTES
// =======================================================
router.get("/users", getAllUsers_api); // ⬅️ Route ที่ถูกเพิ่มเข้ามา

router.post("/auth/register", register_api);
router.post("/auth/login", login_api);

// USER PROFILE
// 💡 Note: :user_id should typically be used after authentication/middleware check.
router.get("/users/:user_id/profile", getUserProfile_api);
router.put("/users/:user_id/profile", updateUser_api);


// =======================================================
//                     WALLET & PURCHASE
// =======================================================
router.get("/users/:user_id/wallet", getWalletBalance_api);
router.get("/users/:user_id/history", getTransactionHistory_api);
router.get("/users/:user_id/purchases", getGamePurchaseHistory_api);

router.post("/users/:user_id/topup", topUpWallet_api); // 💳 เติมเงิน
router.post("/users/:user_id/purchase", purchaseGame_api); // 🛒 ทำรายการซื้อ


// =======================================================
//                       GAME STORE
// =======================================================
router.get("/games/latest", getLatestGames_api);
router.get("/games/top-sellers", getTopSellerGames_api);
router.get("/games/search", searchGames_api); // ใช้ Query String: /games/search?q=keyword
router.get("/games/:game_id", getGameDetails_api);

// USER LIBRARY & BASKET
router.get("/users/:user_id/library", getUserGameLibrary_api);
router.get("/users/:user_id/basket", getBasket_api);
router.post("/users/:user_id/basket/:game_id", addToBasket_api);
router.delete("/users/:user_id/basket/:bid", removeFromBasket_api);


// =======================================================
//                      ADMIN ROUTES
// =======================================================
// --- Game Management ---
router.post("/admin/games", createGame_api); // ➕ สร้างเกมใหม่
router.put("/admin/games/:game_id", updateGame_api); // ✏️ อัปเดตเกม
router.delete("/admin/games/:game_id", deleteGame_api); // 🗑️ ลบเกม

// --- Game Type Management ---
router.post("/admin/gametypes", createGameType_api); // ➕ เพิ่มประเภทเกม

// --- Discount Management ---
router.get("/admin/discounts", getAllDiscountCodes_api); // ดึงโค้ดทั้งหมด
router.post("/admin/discounts", createDiscountCode_api); // ➕ สร้างโค้ดใหม่
router.delete("/admin/discounts/:code_id", deleteDiscountCode_api); // 🗑️ ลบโค้ด

export default router;