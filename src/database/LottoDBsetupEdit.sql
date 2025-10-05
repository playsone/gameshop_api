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
    wallet int defeat 0,
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
('admin', 'admin@example.com', 'admin123', 'admin.png', 1000.00, 1),
('user1', 'user1@example.com', 'user123', 'user1.png', 500.00, 0),
('user2', 'user2@example.com', 'user234', 'user2.png', 300.00, 0),
('user3', 'user3@example.com', 'user345', 'user3.png', 200.00, 0),
('user4', 'user4@example.com', 'user456', 'user4.png', 150.00, 0);

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
INSERT INTO wallettransaction (user_id, amount) VALUES
(2, 200.00),
(3, 150.00),
(2, 50.00),
(4, 100.00),
(5, 80.00);

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
(4, 4, NULL, 19.99),usersusersusers
(5, 5, NULL, 24.99),
(2, 5, 3, 13.99),  -- VIP50
(3, 1, NULL, 29.99),
(4, 2, NULL, 49.99),
(5, 3, 1, 35.99);

