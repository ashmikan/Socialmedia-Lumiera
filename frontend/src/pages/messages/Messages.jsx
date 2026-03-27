import "./Messages.scss";
import { useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { makeRequest } from "../../axios";

const Messages = () => {
  const { currentUser } = useContext(AuthContext);
  const [activeFriendId, setActiveFriendId] = useState(null);

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
              <div className="chatPlaceholder">
                <p>Messaging UI is connected. Select a friend to start a conversation flow.</p>
              </div>
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
