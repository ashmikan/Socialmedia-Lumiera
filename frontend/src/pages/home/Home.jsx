import "./Home.scss"
import logo from "../../assets/logo.png"

const Home = () => {
  return (
    <div className="home">
      <div className="homeHeader">
        <h1>Welcome to Lumiera!</h1>
        <p>Share your moments, connect with friends, and glow up your feed!</p>
      </div>
      <div className="homeContent">
        {/* Feed will go here */}
      </div>
    </div>
  )
}

export default Home