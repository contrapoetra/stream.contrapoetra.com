-- ===========================
--  Database: MiniStream
-- ===========================

CREATE DATABASE MiniStream;
USE MiniStream;

-- ===========================
--  Table: Users
-- ===========================
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    join_date DATE DEFAULT (CURRENT_DATE)
);

-- ===========================
--  Table: Videos
-- ===========================
CREATE TABLE Videos (
    video_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    upload_date DATE DEFAULT (CURRENT_DATE),
    file_path VARCHAR(255),
    views INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- ===========================
--  Table: Comments
-- ===========================
CREATE TABLE Comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    comment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES Videos(video_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE
);

-- ===========================
--  Table: Likes
-- ===========================
CREATE TABLE Likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    video_id INT NOT NULL,
    user_id INT NOT NULL,
    like_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES Videos(video_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    UNIQUE (video_id, user_id) -- Prevent duplicate likes
);

-- ===========================
--  Table: Subscriptions
-- ===========================
CREATE TABLE Subscriptions (
    subscription_id INT AUTO_INCREMENT PRIMARY KEY,
    subscriber_id INT NOT NULL,
    channel_id INT NOT NULL,
    subscribe_date DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (subscriber_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (channel_id) REFERENCES Users(user_id)
        ON DELETE CASCADE,
    UNIQUE (subscriber_id, channel_id) -- Prevent duplicates
);

-- ===========================
-- Sample Data (Optional)
-- ===========================

-- Users
INSERT INTO Users (username, email, password) VALUES
('Alice', 'alice@example.com', 'hashed_pass1'),
('Bob', 'bob@example.com', 'hashed_pass2'),
('Charlie', 'charlie@example.com', 'hashed_pass3');

-- Videos
INSERT INTO Videos (user_id, title, description, file_path) VALUES
(1, 'My First Video', 'Hello World intro video', '/videos/vid1.mp4'),
(2, 'Guitar Tutorial', 'Beginner guitar lesson', '/videos/vid2.mp4');

-- Comments
INSERT INTO Comments (video_id, user_id, comment_text) VALUES
(1, 2, 'Nice video!'),
(1, 3, 'Great intro!'),
(2, 1, 'Loved this tutorial!');

-- Likes
INSERT INTO Likes (video_id, user_id) VALUES
(1, 2),
(1, 3),
(2, 1);

-- Subscriptions
INSERT INTO Subscriptions (subscriber_id, channel_id) VALUES
(2, 1),
(3, 1),
(1, 2);

