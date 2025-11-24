// users.js
const pool = require('../db');

class UserService {
    // CREATE - Add new user
    static async createUser(userData) {
        const sql = `INSERT INTO users (username, email, password_hash, channel_name, profile_picture_url)
                     VALUES (?, ?, ?, ?, ?)`;
        const [result] = await pool.execute(sql, [
            userData.username,
            userData.email,
            userData.password_hash,
            userData.channel_name || null,
            userData.profile_picture_url || null
        ]);
        return result.insertId;
    }

    // READ - Get user by ID
    static async getUserById(userId) {
        const sql = 'SELECT user_id, username, email, created_at, channel_name, profile_picture_url FROM users WHERE user_id = ?';
        const [rows] = await pool.execute(sql, [userId]);
        return rows[0];
    }

    // READ - Get all users
    static async getAllUsers() {
        const sql = 'SELECT user_id, username, email, created_at, channel_name, profile_picture_url FROM users';
        const [rows] = await pool.execute(sql);
        return rows;
    }

    // UPDATE - Update user
    static async updateUser(userId, updateData) {
        const sql = `UPDATE users
                     SET username = ?, email = ?, channel_name = ?, profile_picture_url = ?
                     WHERE user_id = ?`;
        const [result] = await pool.execute(sql, [
            updateData.username,
            updateData.email,
            updateData.channel_name,
            updateData.profile_picture_url,
            userId
        ]);
        return result.affectedRows;
    }

    // DELETE - Delete user
    static async deleteUser(userId) {
        const sql = 'DELETE FROM users WHERE user_id = ?';
        const [result] = await pool.execute(sql, [userId]);
        return result.affectedRows;
    }
}

module.exports = UserService;
