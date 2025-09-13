
-- ✅ Fix: ปิดวงเล็บให้ครบ
INSERT INTO Users (email, password, fullname, wallet, role) VALUES
('m1@e.com', '$2b$10$TEmLT595zmRNSdXAxRwcQOlQATLtF2j7q5w5Pegzbd0jTCp6r1GBG', 'J-J-Jongkok mai', 1500, 0),
('m2@e.com', '$2b$10$TEmLT595zmRNSdXAxRwcQOlQATLtF2j7q5w5Pegzbd0jTCp6r1GBG', '1 tap', 1200, 0),
('m3@e.com', '$2b$10$TEmLT595zmRNSdXAxRwcQOlQATLtF2j7q5w5Pegzbd0jTCp6r1GBG', 'Jordy libertan', 1200, 0),
('m4@e.com', '$2b$10$TEmLT595zmRNSdXAxRwcQOlQATLtF2j7q5w5Pegzbd0jTCp6r1GBG', 'Bananak tak', 1500, 0);


INSERT INTO Users (email, password, fullname, wallet, role) 
SELECT 'o1@e.com', '$2b$10$TEmLT595zmRNSdXAxRwcQOlQATLtF2j7q5w5Pegzbd0jTCp6r1GBG', 'Sofear the FIRST', 1000, 1
WHERE NOT EXISTS (
	SELECT role FROM Users WHERE role = 1
);

-- ✅ Fix: ปิดวงเล็บให้ครบ
INSERT INTO Prizes (prize_tier, claim_amount) VALUES
(0, 0),
(1, 1000),
(2, 500),
(3, 350),
(4, 200),
(5, 100);

-- ✅ สร้างเลขล็อตโต้ 500 ใบ
INSERT INTO Lottos (lotto_number, price, is_sold, uid)
SELECT 
    LPAD(FLOOR(RAND()*999999), 6, '0') AS lotto_number,
    80 AS price,
    t.is_sold,
    CASE t.is_sold
        WHEN 1 THEN FLOOR(RAND()*4) + 1
        ELSE NULL
    END AS uid
FROM (
    SELECT 0 AS is_sold UNION ALL SELECT 1
) t
JOIN (
    SELECT a.n + (b.n * 10) + (c.n * 100) AS num
    FROM (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL 
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) a
    CROSS JOIN (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
        SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL 
        SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9
    ) b
    CROSS JOIN (
        SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL 
        SELECT 3 UNION ALL SELECT 4
    ) c
) nums
LIMIT 500;

-- ✅ บังคับให้ uid กระจายไปที่ user 1-4
UPDATE Lottos SET uid = 1 WHERE uid IS NULL AND is_sold = 1 LIMIT 20;
UPDATE Lottos SET uid = 2 WHERE uid IS NULL AND is_sold = 1 LIMIT 20;
UPDATE Lottos SET uid = 3 WHERE uid IS NULL AND is_sold = 1 LIMIT 20;
UPDATE Lottos SET uid = 4 WHERE uid IS NULL AND is_sold = 1 LIMIT 20;
