import { Link } from "react-router-dom";
import "./Register.scss";
import logo from "../../assets/logo.png"

const Register = () => {
  return (
    <div className="register">
      <div className="card">
        <div className="left">
          <div className="logo-container">
             <img src={logo} alt="Lumiera Logo" className="logo" />
          </div>
          <h1>Register</h1>
          <form>
            <input type="text" placeholder="Username" required/>
            <input type="email" placeholder="Email" required/>
            <input type="password" placeholder="Password" required/>
            <input type="password" placeholder="Confirm Password" required/>
            <button>Register</button>
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