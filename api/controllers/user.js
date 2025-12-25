import { db } from '../connect.js';
import jwt from 'jsonwebtoken';

export const getUser = (req, res) => {
    const userId = req.params.userId;
    const q = "SELECT * FROM users WHERE id = ?";

    db.query(q, [userId], (err, data) => {
        if (err) return res.status(500).json(err);
        if (!data || data.length === 0) return res.status(404).json("User not found");
        const { password, ...info } = data[0];
        return res.json(info);
    });
}

export const searchUsers = (req, res) => {
    const searchQuery = req.query.q || "";
    console.log("Search endpoint hit with query:", searchQuery);
    
    if (!searchQuery.trim()) {
        return res.status(200).json([]);
    }

    const searchTerm = `%${searchQuery}%`;

    // Search by name only to avoid reserved word issues with `desc`
    const q = "SELECT id, name, profilePic FROM users WHERE name LIKE ? LIMIT 20";

    db.query(q, [searchTerm], (err, data) => {
        if (err) {
            console.log("Search query error:", err.code, err.errno, err.sqlMessage);
            return res.status(500).json(err);
        }
        console.log("Search results found:", data?.length || 0);
        return res.status(200).json(data || []);
    });
}

export const updateUser = (req, res) => {
    const token = req.cookies.access_token; 
    if (!token) return res.status(401).json("Not logged in!");

    jwt.verify(token, "secretkey", (err, userInfo) => {
        if (err) return res.status(403).json("Token is not valid!");

        const q = "UPDATE users SET `name` = ?, `city` = ?, `website` = ?, `profilePic` = ?, `coverPic` = ? WHERE id = ?";

        db.query(q, [
            req.body.name,
            req.body.city,
            req.body.website,
            req.body.profilePic,
            req.body.coverPic,
            userInfo.id
        ], (err, data) => {
            if(err) res.status(500).json(err);
            if(data.affectedRows > 0) return res.json("Updated!");
            return res.status(403).json("You can update only your profile!");
        })

    })
}