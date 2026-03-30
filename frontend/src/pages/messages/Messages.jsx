import "./Messages.scss";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";
import { io } from "socket.io-client";

const Messages = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeFriendId, setActiveFriendId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);
  const socketRef = useRef(null);
  const activeFriendIdRef = useRef(null);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: followerIds = [], isLoading: idsLoading } = useQuery({
    queryKey: ["messages-follower-ids", currentUser?.id],
    queryFn: () =>
      makeRequest.get("/relationships?followedUserId=" + currentUser.id).then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ["messages-friends", followerIds],
    queryFn: async () => {
      if (!followerIds.length) return [];
      const users = await Promise.all(
        followerIds.map((id) => makeRequest.get("/users/find/" + id).then((res) => res.data))
      );
      return users;
    },
    enabled: followerIds.length > 0,
  });

  const activeFriend = useMemo(() => {
    return friends.find((friend) => friend.id === activeFriendId) || null;
  }, [friends, activeFriendId]);

  const { data: conversation = [], isLoading: conversationLoading } = useQuery({
    queryKey: ["conversation", currentUser?.id, activeFriendId],
    queryFn: () => makeRequest.get("/messages/" + activeFriendId).then((res) => res.data),
    enabled: !!currentUser?.id && !!activeFriendId,
  });

  const sendMutation = useMutation({
    mutationFn: ({ receiverId, text }) => {
      return makeRequest.post("/messages", { receiverId, text }).then((res) => res.data);
    },
    onSuccess: (savedMessage) => {
      queryClient.setQueryData(["conversation", currentUser?.id, activeFriendId], (old = []) => {
        if (old.some((msg) => msg.id === savedMessage.id)) return old;
        return [...old, savedMessage];
      });
      setLiveMessages((prev) => prev.filter((msg) => msg.id !== savedMessage.id));
      setMessageText("");
    },
  });

  useEffect(() => {
    activeFriendIdRef.current = activeFriendId;
  }, [activeFriendId]);

  useEffect(() => {
    const socket = io("http://localhost:8800", { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      if (currentUser?.id) {
        socket.emit("register_user", currentUser.id);
      }
    });

    socket.on("receive_message", (message) => {
      if (!message) return;

      const activeId = activeFriendIdRef.current;
      const isCurrentConversation =
        Number(message.senderId) === Number(activeId) || Number(message.receiverId) === Number(activeId);

      if (isCurrentConversation) {
        queryClient.setQueryData(["conversation", currentUser?.id, activeId], (old = []) => {
          if (old.some((msg) => msg.id === message.id)) return old;
          return [...old, message];
        });
      } else {
        setLiveMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser?.id, queryClient]);

  useEffect(() => {
    if (activeFriendId) {
      setLiveMessages([]);
    }
  }, [activeFriendId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, sendMutation.isPending]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = messageText.trim();
    if (!text || !activeFriendId || sendMutation.isPending) return;
    sendMutation.mutate({ receiverId: activeFriendId, text });
  };

  const normalizedConversation = [...(conversation || [])].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    if (aTime !== bTime) return aTime - bTime;
    return a.id - b.id;
  });

  return (
    <div className="messagesPage">
      <div className="messagesShell">
        <aside className="friendsPane">
          <h2>Messages</h2>
          {idsLoading || friendsLoading ? (
            <p className="status">Loading friends...</p>
          ) : friends.length === 0 ? (
            <p className="status">No friends available yet.</p>
          ) : (
            <div className="friendList">
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  className={`friendBtn ${activeFriendId === friend.id ? "active" : ""}`}
                  onClick={() => setActiveFriendId(friend.id)}
                >
                  <img
                    src={
                      friend.profilePic?.startsWith("http") || friend.profilePic?.startsWith("/upload/")
                        ? friend.profilePic
                        : "/upload/" + friend.profilePic
                    }
                    alt={friend.name}
                  />
                  <span>{friend.name}</span>
                  {liveMessages.some((msg) => Number(msg.senderId) === Number(friend.id)) && (
                    <small className="unreadBadge">new</small>
                  )}
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="chatPane">
          {activeFriend ? (
            <>
              <div className="chatHeader">
                <h3>Chat with {activeFriend.name}</h3>
                <Link to={`/profile/${activeFriend.id}`}>View profile</Link>
              </div>
              <div className="chatMessages">
                {conversationLoading ? (
                  <p className="status">Loading conversation...</p>
                ) : normalizedConversation.length === 0 ? (
                  <p className="status">No messages yet. Say hello.</p>
                ) : (
                  normalizedConversation.map((msg) => {
                    const mine = Number(msg.senderId) === Number(currentUser?.id);
                    return (
                      <div key={msg.id} className={`messageBubble ${mine ? "mine" : "theirs"}`}>
                        <p>{msg.text}</p>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              <form className="chatComposer" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sendMutation.isPending}
                />
                <button type="submit" disabled={!messageText.trim() || sendMutation.isPending}>
                  {sendMutation.isPending ? "Sending..." : "Send"}
                </button>
              </form>
              {sendMutation.isError && (
                <p className="sendError">Failed to send message. Try again.</p>
              )}
            </>
          ) : (
            <div className="chatPlaceholder">
              <p>Select a friend from the left to open a chat.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Messages;
