import "./Login.scss"

const Login = () => {
  return (
    <div className="login">
        <div className="card">
            <div className="left">
                <h1>Welcome to Lumiera!</h1>
                <p>✨ Lumiera is where your vibe shines. Share moments, glow up your feed, and connect warmly with your people.</p>
                <span>Don't you have an account?</span>
                <button>Register</button>
            </div>
            <div className="right">
                <h1>Login</h1>
                <form>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <button>Login</button>
                </form> 
            </div>
        </div>
    </div>
  )
}

export default Login