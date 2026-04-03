import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

const getUserFromToken = (req, res, onSuccess) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    onSuccess(userInfo);
  });
};

export const getStatuses = (req, res) => {
  getUserFromToken(req, res, (userInfo) => {
    const q = `
      SELECT
        s.id,
        s.img,
        s.createdAt,
        s.expiresAt,
        u.id AS userId,
        u.name,
        u.profilePic
      FROM statuses s
      JOIN users u ON u.id = s.userId
      WHERE s.expiresAt > NOW()
        AND (
          s.userId = ?
          OR EXISTS (
            SELECT 1
            FROM relationships r
            WHERE r.followedUserId = s.userId
              AND r.followerUserId = ?
          )
        )
      ORDER BY (s.userId = ?) DESC, s.createdAt DESC
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data || []);
    });
  });
};

export const addStatus = (req, res) => {
  getUserFromToken(req, res, (userInfo) => {
    const img = (req.body.img || "").trim();
    if (!img) return res.status(400).json("Status image is required");

    const createdAt = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const expiresAt = moment(Date.now()).add(24, "hours").format("YYYY-MM-DD HH:mm:ss");

    const q = "INSERT INTO statuses (`userId`, `img`, `createdAt`, `expiresAt`) VALUES (?)";
    const values = [userInfo.id, img, createdAt, expiresAt];

    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({
        id: data.insertId,
        userId: userInfo.id,
        img,
        createdAt,
        expiresAt,
      });
    });
  });
};
