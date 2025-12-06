import { Link } from "react-router-dom"
import "./Login.scss"
import logo from "../../assets/logo.png"
import { AuthContext } from "../../context/authContext";
import { useContext } from 'react';

const Login = () => {

  const {login} = useContext(AuthContext);

  const handleLogin = () => {
    login();
  }

  return (
    <div className="login">
        <div className="card">
            <div className="left">
                <h1>Welcome to Lumiera!</h1>
                <p>✨ Lumiera is where your vibe shines. Share moments, glow up your feed, and connect warmly with your people.</p>
                <span>Don't you have an account?</span>
                <Link to="/register">
                    <button>Register</button>
                </Link>
            </div>
            <div className="right">
                <div className="logo-container">
                    <img src={logo} alt="Lumiera Logo" className="logo" />
                </div>
                <h1>Login</h1>
                <form>
                    <input type="text" placeholder="Username" required/>
                    <input type="password" placeholder="Password" required/>
                    <button onClick={handleLogin}>Login</button>
                </form> 
            </div>
        </div>
    </div>
  )
}

export default Login