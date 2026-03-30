let ioInstance = null;
const onlineUsers = new Map();

export const setIO = (io) => {
  ioInstance = io;
};

export const getIO = () => ioInstance;

export const registerUserSocket = (userId, socketId) => {
  if (!userId) return;
  onlineUsers.set(Number(userId), socketId);
};

export const removeSocket = (socketId) => {
  for (const [userId, savedSocketId] of onlineUsers.entries()) {
    if (savedSocketId === socketId) {
      onlineUsers.delete(userId);
      break;
    }
  }
};

export const getSocketId = (userId) => {
  return onlineUsers.get(Number(userId));
};
