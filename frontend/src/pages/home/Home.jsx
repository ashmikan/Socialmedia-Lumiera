import "./Home.scss"
import Stories from "../../components/stories/Stories"
import Posts from "../../components/posts/Posts"

const Home = () => {
  return (
    <div className="home">
      <div className="homeHeader">
        <h1>Welcome to Lumiera!</h1>
        <p>Share your moments, connect with friends, and glow up your feed!</p>
      </div>
      <div className="homeContent">
        <Stories />
        <Posts />
      </div>
    </div>
  )
}

export default Home