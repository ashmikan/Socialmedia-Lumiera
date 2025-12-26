import express from 'express';
import { getPosts, addPost, deletePost, getPost } from '../controllers/post.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPost);
router.post('/', addPost);
router.delete('/:id', deletePost);

export default router;