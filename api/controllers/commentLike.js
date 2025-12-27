import { db } from '../connect.js';
import jwt from 'jsonwebtoken';

export const getCommentLikes = (req, res) => {
  // If commentId provided, return userIds who liked that comment
  if (req.query.commentId) {
    const q = 'SELECT userId FROM commentlikes WHERE commentId = ?';
    db.query(q, [req.query.commentId], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data.map((row) => row.userId));
    });
    return;
  }

  // If postId provided, return mapping of commentId -> array of userIds
  if (req.query.postId) {
    const q = `SELECT cl.commentId, cl.userId
               FROM commentlikes cl
               JOIN comments c ON c.id = cl.commentId
               WHERE c.postId = ?`;
    db.query(q, [req.query.postId], (err, rows) => {
      if (err) return res.status(500).json(err);
      const map = {};
      rows.forEach((r) => {
        if (!map[r.commentId]) map[r.commentId] = [];
        map[r.commentId].push(r.userId);
      });
      return res.status(200).json(map);
    });
    return;
  }

  return res.status(400).json('Provide commentId or postId');
};

export const addCommentLike = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json('Not logged in!');

  jwt.verify(token, 'secretkey', (err, userInfo) => {
    if (err) return res.status(403).json('Token is not valid!');
    const q = 'INSERT INTO commentlikes (`userId`, `commentId`) VALUES (?)';
    const values = [userInfo.id, req.body.commentId];
    db.query(q, [values], (err2) => {
      if (err2) return res.status(500).json(err2);
      return res.status(200).json('Comment has been liked.');
    });
  });
};

export const deleteCommentLike = (req, res) => {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json('Not logged in!');

  jwt.verify(token, 'secretkey', (err, userInfo) => {
    if (err) return res.status(403).json('Token is not valid!');
    const q = 'DELETE FROM commentlikes WHERE `userId` = ? AND `commentId` = ?';
    db.query(q, [userInfo.id, req.query.commentId], (err2) => {
      if (err2) return res.status(500).json(err2);
      return res.status(200).json('Comment has been unliked.');
    });
  });
};
