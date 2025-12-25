import express from 'express';
import { getNotifications, getUnreadNotificationCount } from '../controllers/notification.js';

const router = express.Router();

router.get('/', getNotifications);
router.get('/unread-count', getUnreadNotificationCount);

export default router;
