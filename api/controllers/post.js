import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

export const getPosts = (req, res) => {

  const userId = req.query.userId;
  const token = req.cookies.access_token; 
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    console.log(userId)

    // If a specific userId is requested, return that user's posts.
    // Otherwise return posts by the current user or posts from users the current user follows.
    const q = userId !== "undefined"
      ? `SELECT p.*, u.id AS userId, u.name, u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId) WHERE p.userId = ? ORDER BY p.createdAt DESC`
      : `SELECT p.*, u.id AS userId, u.name, u.profilePic FROM posts AS p JOIN users AS u ON (u.id = p.userId)
         WHERE p.userId = ?
         OR EXISTS (
           SELECT 1 FROM relationships r WHERE r.followedUserId = p.userId AND r.followerUserId = ?
         )
         ORDER BY p.createdAt DESC`;

    const values = userId !== "undefined" ? [userId] : [userInfo.id, userInfo.id];

    db.query(q, values, (err, data) => {
            if (err) return res.status(500).json(err);
            if (!data || data.length === 0) return res.status(200).json([]);
            const postIds = data.map((p) => p.id);
            const tagsQ = `SELECT pt.postId, u.id, u.name, u.profilePic FROM posttags pt JOIN users u ON u.id = pt.userId WHERE pt.postId IN (?)`;
            db.query(tagsQ, [postIds], (err2, tagsData) => {
              if (err2) return res.status(500).json(err2);
              const tagsMap = {};
              tagsData.forEach((t) => {
                if (!tagsMap[t.postId]) tagsMap[t.postId] = [];
                tagsMap[t.postId].push({ id: t.id, name: t.name, profilePic: t.profilePic });
              });
              const postsWithTags = data.map((post) => ({ ...post, taggedUsers: tagsMap[post.id] || [] }));
              return res.status(200).json(postsWithTags);
            });
    })
  })    
};

export const addPost = (req, res) => {
  const token = req.cookies.access_token; 
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");
    console.log('addPost body (raw):', req.body);
    // Normalize taggedUsers: accept array or JSON string, coerce to numbers and filter invalid
    let tagged = [];
    if (req.body.taggedUsers) {
      if (typeof req.body.taggedUsers === "string") {
        try {
          tagged = JSON.parse(req.body.taggedUsers);
        } catch (e) {
          // maybe comma separated
          tagged = req.body.taggedUsers.split(",").map((s) => s.trim());
        }
      } else if (Array.isArray(req.body.taggedUsers)) {
        tagged = req.body.taggedUsers;
      }
      tagged = tagged.map((id) => Number(id)).filter((id) => !Number.isNaN(id));
    }
    console.log('addPost body (normalized tagged):', tagged);

    const q = "INSERT INTO posts (`desc`, `img`, `createdAt`, `userId`) VALUES (?)";

    const values = [
      req.body.desc,
      req.body.img,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ]

    db.query(q, [values], (err, data) => {
            if (err) return res.status(500).json(err);
            const postId = data.insertId;
            if (tagged && Array.isArray(tagged) && tagged.length > 0) {
              const tagsValues = tagged.map((uid) => [postId, uid]);
              const qt = "INSERT INTO posttags (`postId`, `userId`) VALUES ?";
              db.query(qt, [tagsValues], (err2) => {
                if (err2) return res.status(500).json(err2);
                return res.status(200).json({ message: "Post has been created.", postId });
              });
            } else {
              return res.status(200).json({ message: "Post has been created.", postId });
            }
    })
  })    
};

export const deletePost = (req, res) => {
  const token = req.cookies.access_token; 
  if (!token) return res.status(401).json("Not logged in!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "DELETE FROM posts WHERE `id` = ? AND `userId` = ?";

    db.query(q, [req.params.id, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err);
            if (data.affectedRows > 0) return res.status(200).json("Post has been deleted.");
            return res.status(403).json("You can delete only your post!");
    })
  })    
};