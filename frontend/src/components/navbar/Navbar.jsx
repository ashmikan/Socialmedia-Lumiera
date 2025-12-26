import "./Navbar.scss"
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from 'react';
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import logo from "../../assets/logo.png";
import moment from "moment";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState([]);
  const notificationRef = useRef(null);

  // Load read notifications from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`readNotifications_${currentUser.id}`);
    if (stored) {
      setReadNotifications(JSON.parse(stored));
    }
  }, [currentUser.id]);

  const { data: notifications, isLoading: notificationsLoading, isError: notificationsError } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      makeRequest.get("/notifications").then((res) => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 1,
    staleTime: 20000,
  });

  // Calculate unread count from notifications minus read ones
  const unreadCount = notifications
    ? notifications.filter(n => {
        const notifId = `${n.type}_${n.fromUserId}_${n.postId || n.fromUserId}`;
        return !readNotifications.includes(notifId);
      }).length
    : 0;

  // Close notification modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    };

    if (notificationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationOpen]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getNotificationMessage = (notification) => {
    if (notification.type === "like") {
      return `${notification.fromUserName} liked your post`;
    } else if (notification.type === "comment") {
      return `${notification.fromUserName} commented on your post`;
    } else if (notification.type === "follow") {
      return `${notification.fromUserName} started following you`;
    }
    return "New notification";
  };

  const markAsRead = (notification) => {
    const notifId = `${notification.type}_${notification.fromUserId}_${notification.postId || notification.fromUserId}`;
    if (!readNotifications.includes(notifId)) {
      const updated = [...readNotifications, notifId];
      setReadNotifications(updated);
      localStorage.setItem(`readNotifications_${currentUser.id}`, JSON.stringify(updated));
    }
  };

  const isRead = (notification) => {
    const notifId = `${notification.type}_${notification.fromUserId}_${notification.postId || notification.fromUserId}`;
    return readNotifications.includes(notifId);
  };

  const markAllAsRead = () => {
    if (notifications && notifications.length > 0) {
      const allIds = notifications.map(n => `${n.type}_${n.fromUserId}_${n.postId || n.fromUserId}`);
      setReadNotifications(allIds);
      localStorage.setItem(`readNotifications_${currentUser.id}`, JSON.stringify(allIds));
    }
  };

  return (
    <div className="navbar">
      <div className="left">
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <img src={logo} alt="Lumiera Logo" className="logoImage" />
        </Link>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <HomeOutlinedIcon className="icon" />
        </Link>
        {darkMode ? <WbSunnyOutlinedIcon className="icon" onClick={toggle} style={{ cursor: "pointer" }} /> : <DarkModeOutlinedIcon className="icon" onClick={toggle} style={{ cursor: "pointer" }} />}
        <GridViewOutlinedIcon className="icon" onClick={() => navigate("/explore")} style={{ cursor: "pointer" }} />
        <div className="search">
          <SearchOutlinedIcon onClick={handleSearch} style={{ cursor: "pointer" }} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <div className="right">
        <PersonOutlinedIcon className="icon" onClick={() => navigate("/profile/me")} style={{ cursor: "pointer" }} />
        <EmailOutlinedIcon className="icon" onClick={() => navigate("/messages")} style={{ cursor: "pointer" }} />
        <div className="notification-container" style={{ position: "relative" }} ref={notificationRef}>
          <NotificationsOutlinedIcon 
            className="icon" 
            onClick={() => setNotificationOpen(!notificationOpen)} 
            style={{ cursor: "pointer" }} 
          />
          {(unreadCount && unreadCount > 0) && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
          
          {notificationOpen && (
            <div className="notification-modal">
              <div className="notification-header">
                <h3>Notifications</h3>
                <div className="header-actions">
                  {unreadCount > 0 && (
                    <button 
                      className="mark-all-read" 
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotificationOpen(false)}>×</button>
                </div>
              </div>
              <div className="notification-list">
                {notificationsLoading ? (
                  <div className="no-notifications">
                    <p>Loading notifications...</p>
                  </div>
                ) : notificationsError ? (
                  <div className="no-notifications">
                    <p>Failed to load notifications</p>
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((notification, idx) => (
                    <div 
                      key={idx} 
                      className={`notification-item ${isRead(notification) ? 'read' : 'unread'}`}
                      onClick={() => {
                        markAsRead(notification);
                        if (notification.postId) {
                          navigate(`/post/${notification.postId}`);
                        } else if (notification.fromUserId) {
                          navigate(`/profile/${notification.fromUserId}`);
                        }
                        setNotificationOpen(false);
                      }}
                    >
                      <img 
                        src={notification.fromUserProfilePic || currentUser.profilePic} 
                        alt={notification.fromUserName}
                        className="notification-avatar"
                      />
                      <div className="notification-content">
                        <p>{getNotificationMessage(notification)}</p>
                        <span className="notification-time">
                          {moment(notification.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="user" onClick={() => navigate("/profile/me")} style={{ cursor: "pointer" }}>
          <img
            src={currentUser.profilePic}
            alt=""
          />
          <span>{currentUser.name}</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar