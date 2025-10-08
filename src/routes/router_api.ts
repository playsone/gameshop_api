// router.ts (ฉบับสมบูรณ์ พร้อมความคิดเห็นภาษาไทย)
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
    getWalletHistory_api
} from "../controllers/wallet_api";


const router = express.Router();
// เส้นทางหลักของ API
router.get('/', (_req, res) => {
    res.send('Welcome to the Game Shop API');
});

// =======================================================
// 1. เส้นทางเกี่ยวกับผู้ใช้และการยืนยันตัวตน (USER & AUTH ROUTES)
// =======================================================
// (POST) สมัครสมาชิกใหม่
router.post("/auth/register", register_api);
// (POST) เข้าสู่ระบบ
router.post("/auth/login", login_api);

// --- การจัดการผู้ใช้ (Admin/User) ---
// (GET) ดึงข้อมูลผู้ใช้ทั้งหมด
router.get("/users", getAllUsers_api); 
// (GET) ดึงข้อมูลผู้ใช้ด้วย Email
router.get("/users/by-email/:email", getUserByEmail_api);
// (GET) ดึงข้อมูลผู้ใช้ด้วย Username
router.get("/users/by-username/:username", getUserByUsername_api);
// (GET) ดึงข้อมูลผู้ใช้ด้วย ID
router.get("/users/:user_id", getUsersById_api);

// --- โปรไฟล์ผู้ใช้ (USER PROFILE) ---
// (GET) ดูข้อมูลโปรไฟล์ส่วนตัว
router.get("/users/:user_id/profile", getUserProfile_api);
// (PUT) อัปเดตข้อมูลโปรไฟล์ส่วนตัว
router.put("/users/:user_id/profile", updateUser_api);

// --- การจัดการระบบ (สำหรับ Admin) ---
// (POST) ล้างและรีเซ็ตฐานข้อมูลทั้งหมด
router.post("/system/reset", reset_api);
// (POST) ตั้งค่าฐานข้อมูลเริ่มต้นพร้อมข้อมูลตัวอย่าง
router.post("/system/setup-db", setupDB_api);


// =======================================================
// 2. เส้นทางเกี่ยวกับกระเป๋าเงินและการซื้อ (WALLET & PURCHASE)
// =======================================================
// (GET) ดูยอดเงินคงเหลือใน Wallet
router.get("/users/:user_id/wallet", getWalletBalance_api);
// (GET) ดูประวัติ Wallet ทั้งเงินเข้าและเงินออก
router.get("/users/:user_id/wallet/history", getWalletHistory_api);
// (GET) ดูประวัติการทำรายการทั้งหมด (แบบเก่า)
router.get("/users/:user_id/history", getTransactionHistory_api);
// (GET) ดูประวัติการซื้อเกมโดยเฉพาะ
router.get("/users/:user_id/purchases", getGamePurchaseHistory_api);

// (POST) เติมเงินเข้า Wallet
router.post("/users/:user_id/topup", topUpWallet_api); 
// (POST) ซื้อเกม 1 เกม
router.post("/users/:user_id/purchase", purchaseGame_api); 
// (POST) ซื้อเกมทั้งหมดในตะกร้า
router.post("/users/:user_id/purchase-basket", purchaseGame_api2); 
// (POST) ใช้โค้ดส่วนลดกับตะกร้า
router.post("/users/:user_id/basket/apply-discount", applyDiscount_api);


// =======================================================
// 3. เส้นทางเกี่ยวกับร้านค้าและเกม (GAME STORE)
// =======================================================
// (GET) ดึงประเภทเกมทั้งหมด
router.get("/gametypes", getAllGameTypes_api);
// (GET) ดึงรายการเกมล่าสุด
router.get("/games/latest", getLatestGames_api);
// (GET) ดึงรายการเกมขายดี
router.get("/games/top-sellers", getTopSellerGames_api);
// (GET) ค้นหาเกม (ตามชื่อหรือประเภท)
router.get("/games/search", searchGames_api); 
// (GET) ดูรายละเอียดเกมตาม ID
router.get("/games/:game_id", getGameDetails_api);

// --- คลังเกมและตะกร้าของผู้ใช้ (USER LIBRARY & BASKET) ---
// (GET) ดูคลังเกมของตัวเอง
router.get("/users/:user_id/library", getUserGameLibrary_api);
// (GET) ดูรายการเกมในตะกร้า
router.get("/users/:user_id/basket", getBasket_api);
// (POST) เพิ่มเกมลงในตะกร้า
router.post("/users/:user_id/basket/:game_id", addToBasket_api);
// (DELETE) ลบเกมออกจากตะกร้า
router.delete("/users/:user_id/basket/:bid", removeFromBasket_api);


// =======================================================
// 4. เส้นทางสำหรับผู้ดูแลระบบ (ADMIN ROUTES)
// =======================================================

// --- การจัดการธุรกรรม (Admin) ---
// (GET) ดูประวัติธุรกรรมทั้งหมดของทุก User
router.get("/admin/transactions", getAdminTransactionHistory_api);

// --- การจัดการเกม (Admin) ---
// (GET) ดึงรายการเกมทั้งหมดสำหรับ Admin
router.get("/admin/games", getAllGames_api);
// (POST) เพิ่มเกมใหม่เข้าระบบ
router.post("/admin/games", createGame_api); 
// (PUT) อัปเดตข้อมูลเกม
router.put("/admin/games/:game_id", updateGame_api); 
// (DELETE) ลบเกมออกจากระบบ
router.delete("/admin/games/:game_id", deleteGame_api); 

// --- การจัดการประเภทเกม (Admin) ---
// (POST) เพิ่มประเภทเกมใหม่
router.post("/admin/gametypes", createGameType_api); 

// --- การจัดการโค้ดส่วนลด (Admin) ---
// (GET) ดูโค้ดส่วนลดทั้งหมด
router.get("/admin/discounts", getAllDiscountCodes_api);
// (POST) สร้างโค้ดส่วนลดใหม่
router.post("/admin/discounts", createDiscountCode_api);
// (DELETE) ลบโค้ดส่วนลด
router.delete("/admin/discounts/:code_id", deleteDiscountCode_api); 

export default router;