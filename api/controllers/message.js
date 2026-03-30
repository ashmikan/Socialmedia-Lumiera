import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";
import { getIO, getSocketId } from "../socket.js";

const getUserFromToken = (req, res, onSuccess) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    onSuccess(userInfo);
  });
};

export const getConversation = (req, res) => {
  getUserFromToken(req, res, (userInfo) => {
    const otherUserId = Number(req.params.userId);
    if (Number.isNaN(otherUserId)) return res.status(400).json("Invalid user id");

    const q = `
      SELECT
        m.id,
        m.senderId,
        m.receiverId,
        m.text,
        m.createdAt,
        sender.name AS senderName,
        sender.profilePic AS senderProfilePic,
        receiver.name AS receiverName,
        receiver.profilePic AS receiverProfilePic
      FROM messages m
      JOIN users sender ON sender.id = m.senderId
      JOIN users receiver ON receiver.id = m.receiverId
      WHERE (m.senderId = ? AND m.receiverId = ?)
         OR (m.senderId = ? AND m.receiverId = ?)
      ORDER BY m.createdAt ASC, m.id ASC
    `;

    db.query(q, [userInfo.id, otherUserId, otherUserId, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data || []);
    });
  });
};

export const addMessage = (req, res) => {
  getUserFromToken(req, res, (userInfo) => {
    const receiverId = Number(req.body.receiverId);
    const text = (req.body.text || "").trim();

    if (Number.isNaN(receiverId)) return res.status(400).json("Invalid receiver id");
    if (!text) return res.status(400).json("Message text is required");

    const createdAt = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const insertQ = "INSERT INTO messages (`senderId`, `receiverId`, `text`, `createdAt`) VALUES (?)";
    const values = [userInfo.id, receiverId, text, createdAt];

    db.query(insertQ, [values], (err, result) => {
      if (err) return res.status(500).json(err);

      const selectQ = `
        SELECT
          m.id,
          m.senderId,
          m.receiverId,
          m.text,
          m.createdAt,
          sender.name AS senderName,
          sender.profilePic AS senderProfilePic,
          receiver.name AS receiverName,
          receiver.profilePic AS receiverProfilePic
        FROM messages m
        JOIN users sender ON sender.id = m.senderId
        JOIN users receiver ON receiver.id = m.receiverId
        WHERE m.id = ?
      `;

      db.query(selectQ, [result.insertId], (selectErr, rows) => {
        if (selectErr) return res.status(500).json(selectErr);

        const savedMessage = rows?.[0];
        const io = getIO();
        const receiverSocketId = getSocketId(receiverId);

        if (io && receiverSocketId && savedMessage) {
          io.to(receiverSocketId).emit("receive_message", savedMessage);
        }

        return res.status(200).json(savedMessage);
      });
    });
  });
};
