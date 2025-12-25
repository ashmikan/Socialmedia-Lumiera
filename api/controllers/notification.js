import { db } from '../connect.js';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export const getNotifications = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = `
      SELECT 
        'like' AS type,
        l.userId AS fromUserId,
        u.name AS fromUserName,
        u.profilePic AS fromUserProfilePic,
        l.postId,
        l.createdAt,
        NULL AS commentId
      FROM likes AS l
      JOIN users AS u ON l.userId = u.id
      JOIN posts AS p ON l.postId = p.id
      WHERE p.userId = ? AND l.userId != ?
      
      UNION ALL
      
      SELECT 
        'comment' AS type,
        c.userId AS fromUserId,
        u.name AS fromUserName,
        u.profilePic AS fromUserProfilePic,
        c.postId,
        c.createdAt,
        c.id AS commentId
      FROM comments AS c
      JOIN users AS u ON c.userId = u.id
      JOIN posts AS p ON c.postId = p.id
      WHERE p.userId = ? AND c.userId != ?
      
      UNION ALL
      
      SELECT 
        'follow' AS type,
        r.followerUserId AS fromUserId,
        u.name AS fromUserName,
        u.profilePic AS fromUserProfilePic,
        NULL AS postId,
        r.createdAt,
        NULL AS commentId
      FROM relationships AS r
      JOIN users AS u ON r.followerUserId = u.id
      WHERE r.followedUserId = ? AND r.followerUserId != ?
      
      ORDER BY createdAt DESC
      LIMIT 50
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id, userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};

export const getUnreadNotificationCount = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // Count recent notifications from the last 24 hours
    const q = `
      SELECT COUNT(*) as count FROM (
        SELECT l.createdAt
        FROM likes AS l
        JOIN posts AS p ON l.postId = p.id
        WHERE p.userId = ? AND l.createdAt > DATE_SUB(NOW(), INTERVAL 1 DAY)
        
        UNION ALL
        
        SELECT c.createdAt
        FROM comments AS c
        JOIN posts AS p ON c.postId = p.id
        WHERE p.userId = ? AND c.createdAt > DATE_SUB(NOW(), INTERVAL 1 DAY)
        
        UNION ALL
        
        SELECT r.createdAt
        FROM relationships AS r
        WHERE r.followedUserId = ? AND r.createdAt > DATE_SUB(NOW(), INTERVAL 1 DAY)
      ) AS recent_notifications
    `;

    db.query(q, [userInfo.id, userInfo.id, userInfo.id], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json({ count: data[0].count });
    });
  });
};
