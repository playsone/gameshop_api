SET FOREIGN_KEY_CHECKS = 0;

-- ลบตารางเก่าตามลำดับ (ลูกก่อนแม่)
DROP TABLE IF EXISTS gametransaction;
DROP TABLE IF EXISTS usersgamelibrary;
DROP TABLE IF EXISTS basket;
DROP TABLE IF EXISTS gameranking;
DROP TABLE IF EXISTS wallettransaction;
DROP TABLE IF EXISTS discountcode;
DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS gametype;
DROP TABLE IF EXISTS users;

-- 1) ตารางผู้ใช้
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    image VARCHAR(255),
    wallet DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    role TINYINT(1) NOT NULL DEFAULT 0   -- 0 = USER, 1 = ADMIN
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2) ประเภทเกม
CREATE TABLE gametype (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    typename VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3) เกม (release_date ตั้งเป็น NULL โดยดีฟอลต์ — เติมจากแอพหรือ trigger หากต้องการให้เป็นวันปัจจุบัน)
CREATE TABLE game (
    game_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    release_date DATE DEFAULT NULL,
    description TEXT,
    image VARCHAR(255),
    type_id INT NOT NULL,
    CONSTRAINT fk_game_gametype FOREIGN KEY (type_id) REFERENCES gametype(type_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4) โค้ดส่วนลด
CREATE TABLE discountcode (
    code_id INT AUTO_INCREMENT PRIMARY KEY,
    code_name VARCHAR(50) NOT NULL UNIQUE,
    discount_value DECIMAL(5,2) NOT NULL,
    remaining_user INT NOT NULL DEFAULT 0,
    max_user INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5) ธุรกรรมกระเป๋าเงิน
CREATE TABLE wallettransaction (
    wallettransaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    wallettransaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status int default 0,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6) Ranking เกม
CREATE TABLE gameranking (
    ranking_id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    ranking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ranking_game FOREIGN KEY (game_id) REFERENCES game(game_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7) ตะกร้า
CREATE TABLE basket (
    bid INT AUTO_INCREMENT PRIMARY KEY,
    uid INT NOT NULL,
    game_id INT NOT NULL,
    CONSTRAINT fk_basket_user FOREIGN KEY (uid) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_basket_game FOREIGN KEY (game_id) REFERENCES game(game_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8) คลังเกมผู้ใช้
CREATE TABLE usersgamelibrary (
    usergame_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    purchase_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_library_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_library_game FOREIGN KEY (game_id) REFERENCES game(game_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY ux_user_game (user_id, game_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9) ธุรกรรมเกม (การซื้อ)
CREATE TABLE gametransaction (
    gametrans_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_id INT NOT NULL,
    code_id INT NULL,
    bought_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_gametrans_user FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_gametrans_game FOREIGN KEY (game_id) REFERENCES game(game_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_gametrans_code FOREIGN KEY (code_id) REFERENCES discountcode(code_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;









-- ------------------------------
-- 1) Users
-- ------------------------------
INSERT INTO users (username, email, password, image, wallet, role) VALUES
('admin', 'admin@example.com', '$2a$10$CIQnPSI/lBLxu3BVSeVcduW64mP6l69mBDk9Y9DsEnvoKlkNkYBBu', 'admin.png', 1000.00, 1),
('user1', 'user1@example.com', '$2a$10$CIQnPSI/lBLxu3BVSeVcduW64mP6l69mBDk9Y9DsEnvoKlkNkYBBu', 'user1.png', 500.00, 0),
('user2', 'user2@example.com', '$2a$10$CIQnPSI/lBLxu3BVSeVcduW64mP6l69mBDk9Y9DsEnvoKlkNkYBBu', 'user2.png', 300.00, 0),
('user3', 'user3@example.com', '$2a$10$CIQnPSI/lBLxu3BVSeVcduW64mP6l69mBDk9Y9DsEnvoKlkNkYBBu', 'user3.png', 200.00, 0),
('user4', 'user4@example.com', '$2a$10$CIQnPSI/lBLxu3BVSeVcduW64mP6l69mBDk9Y9DsEnvoKlkNkYBBu', 'user4.png', 150.00, 0);

-- ------------------------------
-- 2) Game types
-- ------------------------------
INSERT INTO gametype (typename) VALUES
('Action'),
('Adventure'),
('RPG'),
('Strategy'),
('Simulation');

-- ------------------------------
-- 3) Games (10 เกมพร้อมรูป)
-- ------------------------------
INSERT INTO game (name, price, release_date, description, image, type_id) VALUES
('Epic Adventure', 29.99, '2025-01-15', 'An epic journey through magical lands.', 'epic_adventure.jpg', 2),
('Battle Hero', 49.99, '2025-02-20', 'Action-packed combat with heroes.', 'battle_hero.jpg', 1),
('Fantasy Quest', 39.99, '2025-03-10', 'RPG with immersive story and quests.', 'fantasy_quest.jpg', 3),
('Strategy Master', 19.99, '2025-01-30', 'Plan and conquer territories in this strategy game.', 'strategy_master.jpg', 4),
('Sim Life', 24.99, '2025-04-05', 'Simulation game to manage your virtual life.', 'sim_life.jpg', 5),
('Dungeon Explorer', 34.99, '2025-02-10', 'Explore dungeons and defeat monsters.', 'dungeon_explorer.jpg', 3),
('Galaxy Fighter', 44.99, '2025-03-22', 'Space action game with epic battles.', 'galaxy_fighter.jpg', 1),
('Kingdom Builder', 29.99, '2025-04-12', 'Build and manage your own kingdom.', 'kingdom_builder.jpg', 4),
('Treasure Hunt', 22.99, '2025-01-25', 'Adventure game searching for treasures.', 'treasure_hunt.jpg', 2),
('City Simulator', 27.99, '2025-03-30', 'Simulate and manage a modern city.', 'city_simulator.jpg', 5);

-- ------------------------------
-- 4) Discount codes
-- ------------------------------
INSERT INTO discountcode (code_name, discount_value, remaining_user, max_user) VALUES
('WELCOME10', 10.00, 10, 100),
('SPRING20', 20.00, 5, 50),
('VIP50', 50.00, 1, 10);

-- ------------------------------
-- 5) Wallet transactions
-- ------------------------------
INSERT INTO wallettransaction (user_id, amount,status) VALUES
(2, 200.00,0),
(3, 150.00,1),
(2, 50.00,0),
(4, 100.00,1),
(5, 80.00,0);

-- ------------------------------
-- 6) Game ranking
-- ------------------------------
INSERT INTO gameranking (game_id) VALUES
(1),(2),(3),(4),(5),
(6),(7),(8),(9),(10),
(1),(2),(3),(2),(5);

-- ------------------------------
-- 7) Basket
-- ------------------------------
INSERT INTO basket (uid, game_id) VALUES
(2, 1),(2, 3),(3, 2),(4, 4),(5, 5);

-- ------------------------------
-- 8) Users game library
-- ------------------------------
INSERT INTO usersgamelibrary (user_id, game_id) VALUES
(2, 1),(2, 3),(3, 2),(4, 4),(5, 5),
(2, 5),(3, 1),(4, 2),(5, 3);

-- ------------------------------
-- 9) Game transactions
-- ------------------------------
INSERT INTO gametransaction (user_id, game_id, code_id, price) VALUES
(2, 1, 1, 26.99),  -- WELCOME10
(2, 3, NULL, 39.99),
(3, 2, 2, 39.99),  -- SPRING20
(4, 4, NULL, 19.99),
(5, 5, NULL, 24.99),
(2, 5, 3, 13.99),  -- VIP50
(3, 1, NULL, 29.99),
(4, 2, NULL, 49.99),
(5, 3, 1, 35.99);










SELECT 
    g.game_id,
    g.name AS game_name,
    g.price AS original_price,
    gt.price AS purchase_price,
    gt.bought_date,
    d.code_name AS discount_code
FROM gametransaction gt
JOIN game g ON gt.game_id = g.game_id
LEFT JOIN discountcode d ON gt.code_id = d.code_id
WHERE gt.user_id = 2
ORDER BY gt.bought_date DESC;


-- 3.1 ดึงเกมทั้งหมด (Store)
SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
ORDER BY g.release_date DESC
LIMIT 10;


-- 3.2 ค้นหาเกม (ชื่อ/ประเภท)
SELECT g.game_id, g.name, g.price, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
WHERE g.name LIKE CONCAT('%', ?, '%')
   OR t.typename LIKE CONCAT('%', ?, '%');


-- 3.3 ดูรายละเอียดเกม
SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
WHERE g.game_id = ?;


-- 3.4 ดู Wallet
SELECT wallet FROM users WHERE user_id = ?;


-- 3.5 ดูประวัติการซื้อเกม
SELECT g.name AS game_name, gt.price, gt.bought_date, d.code_name AS discount_code
FROM gametransaction gt
JOIN game g ON gt.game_id = g.game_id
LEFT JOIN discountcode d ON gt.code_id = d.code_id
WHERE gt.user_id = ?
ORDER BY gt.bought_date DESC;


-- 3.6 ดูคลังเกม
SELECT g.game_id, g.name, g.price, g.image, g.release_date
FROM usersgamelibrary u
JOIN game g ON u.game_id = g.game_id
WHERE u.user_id = ?
ORDER BY u.purchase_date DESC;


-- 3.7 เกมขายดี Top 5
SELECT g.game_id, g.name, COUNT(*) AS total_sold
FROM gametransaction gt
JOIN game g ON gt.game_id = g.game_id
GROUP BY gt.game_id
ORDER BY total_sold DESC
LIMIT 5;


-- 1.1 สมัครสมาชิก (User)
INSERT INTO users(username, email, password, image)
VALUES (?, ?, ?, ?);


-- 1.2 แก้ไขข้อมูลผู้ใช้ / รูปโปรไฟล์
UPDATE users
SET username = ?, email = ?, image = ?
WHERE user_id = ?;


-- 1.3 Login (แยกสิทธิ์ User/Admin)
SELECT user_id, username, role
FROM users
WHERE (username = ? OR email = ?) AND password = ?;

-- ดูข้อมูลผู้ใช้

SELECT user_id, username, email, image, wallet, role
FROM users
WHERE user_id = ?;

-- 1.4 ดู session / สิทธิ์
-- -- สมมติมีตาราง session หรือ token
SELECT user_id, role
FROM users
WHERE user_id = ?;

-- 1.5 ข้อมูล Admin
SELECT user_id, username, email
FROM users
WHERE role = 1;

-- 2.1 Admin จัดการเกม (CRUD) Insert
INSERT INTO game(name, price, release_date, description, image, type_id)
VALUES (?, ?, ?, ?, ?, ?);

-- Update
UPDATE game
SET name = ?, price = ?, release_date = ?, description = ?, image = ?, type_id = ?
WHERE game_id = ?;

-- Delete
DELETE FROM game
WHERE game_id = ?;

-- 2.3 กำหนดประเภทเกม
INSERT INTO gametype(typename) VALUES (?);
UPDATE gametype SET typename = ? WHERE type_id = ?;
DELETE FROM gametype WHERE type_id = ?;


-- 2.5 ค้นหาเกม (ชื่อ / ประเภท)
SELECT g.game_id, g.name, g.price, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
WHERE g.name LIKE CONCAT('%', ?, '%')
	OR t.typename LIKE CONCAT('%', ?, '%');
-- 2.6 แสดงเกม ≥10 เกม
SELECT g.game_id, g.name, g.price, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
ORDER BY g.release_date DESC
LIMIT 10;

-- 2.7 ดูรายละเอียดเกม
SELECT g.game_id, g.name, g.price, g.release_date, g.description, g.image, t.typename AS type
FROM game g
JOIN gametype t ON g.type_id = t.type_id
WHERE g.game_id = ?;


-- 3.1 แสดง Wallet Balance
SELECT wallet
FROM users
WHERE user_id = 1;

-- 3.2 เติมเงิน
START TRANSACTION;

UPDATE users
SET wallet = wallet + 500
WHERE user_id = 1;

INSERT INTO wallettransaction(user_id, amount,status)
VALUES (1, 500,1);

COMMIT;

-- 3.3 ดูประวัติการทำรายการ
SELECT 'wallet' AS type, amount, wallettransaction_date AS date,status 
FROM wallettransaction
WHERE user_id = 1
UNION
SELECT 'purchase' AS type, price AS amount, bought_date AS date
FROM gametransaction
WHERE user_id = ?
ORDER BY date DESC;

-- 3.4 Admin ดูประวัติผู้ใช้
SELECT u.username, gt.price, gt.bought_date, g.name AS game_name
FROM gametransaction gt
JOIN users u ON gt.user_id = u.user_id
JOIN game g ON gt.game_id = g.game_id
WHERE u.user_id = ?;


-- 3.5 ตัดเงินจาก Wallet (ซื้อเกม)
START TRANSACTION;

UPDATE users SET wallet = wallet - ? WHERE user_id = ?;
INSERT INTO gametransaction(user_id, game_id, price) VALUES (?, ?, ?);
INSERT INTO usersgamelibrary(user_id, game_id) VALUES (?, ?);

COMMIT;

-- 3.6 ป้องกัน Race Condition

-- ใช้ Transaction + SELECT FOR UPDATE ใน SQL

START TRANSACTION;
SELECT wallet FROM users WHERE user_id = ? FOR UPDATE;
-- เช็ค wallet >= price
UPDATE users SET wallet = wallet - ? WHERE user_id = ?;
COMMIT;

-- 4️⃣ Shop & Purchase Logic
-- 4.1 ดูตะกร้า
SELECT b.bid, g.game_id, g.name, g.price
FROM basket b
JOIN game g ON b.game_id = g.game_id
WHERE b.uid = ?;

-- 4.2 ใส่โค้ดส่วนลด
SELECT code_id, discount_value, remaining_user
FROM discountcode
WHERE code_name = ?;


-- 4.4 ป้องกันซื้อซ้ำ
SELECT *
FROM usersgamelibrary
WHERE user_id = ? AND game_id = ?;

-- 4.5 ดูคลังเกม
SELECT g.game_id, g.name, g.price, g.image, g.release_date
FROM usersgamelibrary u
JOIN game g ON u.game_id = g.game_id
WHERE u.user_id = ?;


-- 4.7 เกมขายดี (Top 5)
SELECT g.game_id, g.name, COUNT(*) AS total_sold
FROM gametransaction gt
JOIN game g ON gt.game_id = g.game_id
GROUP BY gt.game_id
ORDER BY total_sold DESC
LIMIT 5;


-- 5️⃣ Discount Code Management
-- 5.1 Admin เพิ่ม/แก้ไข/ลบโค้ด
INSERT INTO discountcode(code_name, discount_value, remaining_user, max_user)
VALUES (?, ?, ?, ?);

UPDATE discountcode
SET discount_value = ?, remaining_user = ?, max_user = ?
WHERE code_id = ?;

DELETE FROM discountcode WHERE code_id = ?;

-- 5.3 User ใช้โค้ดในตะกร้า
UPDATE gametransaction
SET code_id = ?, price = price - ?
WHERE gametrans_id = ?;

UPDATE discountcode
SET remaining_user = remaining_user - 1
WHERE code_id = ?;

-- 5.4 โค้ดใช้ครบทำลาย/ซ่อน
DELETE FROM discountcode
WHERE remaining_user <= 0;