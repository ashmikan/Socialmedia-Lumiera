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
import { useContext, useState, useEffect } from 'react';
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

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () =>
      makeRequest.get("/notifications").then((res) => res.data),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["notificationsCount"],
    queryFn: () =>
      makeRequest.get("/notifications/unread-count").then((res) => res.data.count),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

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
        <div className="notification-container" style={{ position: "relative" }}>
          <NotificationsOutlinedIcon 
            className="icon" 
            onClick={() => setNotificationOpen(!notificationOpen)} 
            style={{ cursor: "pointer" }} 
          />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
          
          {notificationOpen && (
            <div className="notification-modal">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button onClick={() => setNotificationOpen(false)}>×</button>
              </div>
              <div className="notification-list">
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification, idx) => (
                    <div 
                      key={idx} 
                      className="notification-item"
                      onClick={() => {
                        if (notification.postId) {
                          navigate(`/post/${notification.postId}`);
                        } else if (notification.fromUserId) {
                          navigate(`/profile/${notification.fromUserId}`);
                        }
                        setNotificationOpen(false);
                      }}
                    >
                      <img 
                        src={notification.fromUserProfilePic} 
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