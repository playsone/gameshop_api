
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

INSERT INTO Prizes (prize_tier, claim_amount) VALUES
(0, 0),
(1, 1000),
(2, 500),
(3, 350),
(4, 200),
(5, 100);
