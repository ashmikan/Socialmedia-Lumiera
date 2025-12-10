import { Link } from "react-router-dom";
import "./Register.scss";
import logo from "../../assets/logo.png"
import { useState } from "react";
import axios from "axios";

const Register = () => {

  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [err, setErr] = useState(null);

  const handleChange = (e) => {
    setInputs(...prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    // TO DO: Handle registration logic

    try{
      await axios.post("http://localhost:8800/api/auth/register", inputs);
    }catch(err){
      setErr(err);
    }
  }


  console.log(err)

  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <div className="logo-container">
             <img src={logo} alt="Lumiera Logo" className="logo" />
          </div>
          <h1>Register</h1>
          <form>
            <input type="text" placeholder="Username" name="username" onChange={handleChange} required/>
            <input type="email" placeholder="Email" name="email" onChange={handleChange} required/>
            <input type="password" placeholder="Password" name="password" onChange={handleChange} required/>
            <input type="password" placeholder="Confirm Password" name="confirmPassword" onChange={handleChange} required/>
            {err && err}
            <button onClick={handleClick}>Register</button>
          </form>
          
        </div>
        <div className="right">
          <h1>Lumiera</h1>
          <p>
            ✨ Share your moods, your moments, and your magic with Lumiera
          </p>
          <span>Do you have an account?</span>
          <Link to="/login">
            <button>Login</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;