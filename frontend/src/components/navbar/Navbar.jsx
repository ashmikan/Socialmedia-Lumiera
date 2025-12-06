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
import { useContext } from 'react';
import { DarkModeContext } from "../../context/darkModeContext";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const navigate = useNavigate();

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
          <SearchOutlinedIcon />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="right">
        <PersonOutlinedIcon className="icon" onClick={() => navigate("/profile/me")} style={{ cursor: "pointer" }} />
        <EmailOutlinedIcon className="icon" onClick={() => navigate("/messages")} style={{ cursor: "pointer" }} />
        <NotificationsOutlinedIcon className="icon" onClick={() => navigate("/notifications")} style={{ cursor: "pointer" }} />
        <div className="user" onClick={() => navigate("/profile/me")} style={{ cursor: "pointer" }}>
          <img
            src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt=""
          />
          <span>Windy</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar