import { Link } from "react-router-dom"
import "./Login.scss"
import logo from "../../assets/logo.png"
import { AuthContext } from "../../context/authContext";
import { useContext } from 'react';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [inputs, setInputs] = useState({
        username: "",
        password: "",
      });
    
    const [err, setErr] = useState(null);

    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
      };

  const {login} = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try{
        await login(inputs);
        navigate("/");
    }catch(err){
        setErr(err.response.data);
    }
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
                    <input type="text" placeholder="Username" name="username" onChange={handleChange} required/>
                    <input type="password" placeholder="Password" name="password" onChange={handleChange} required/>
                    {err && <span className="error">{err.message}</span>}
                    <button onClick={handleLogin}>Login</button>
                </form> 
            </div>
        </div>
    </div>
  )
}

export default Login