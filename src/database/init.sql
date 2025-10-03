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

