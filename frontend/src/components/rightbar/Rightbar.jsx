import "./Rightbar.scss"

const Rightbar = () => {
  return (
    <div className="rightbar">
        <div className="container">
            <div className="item">
                <span>Suggestions For You</span>
                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <span>Jane</span>
                    </div>
                    <div className="buttons">
                        <button>Follow</button>
                        <button>Dismiss</button> 
                    </div>   
                </div>

                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <span>John</span>
                    </div>
                    <div className="buttons">
                        <button>Follow</button>
                        <button>Dismiss</button> 
                    </div>   
                </div>
            </div>

            <div className="item">
                <span>Latest Activities</span>
                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <p>
                            <span>Jane</span> changed cover picture
                        </p>
                    </div>
                    <span>1 min ago</span>   
                </div>

                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <p>
                            <span>John</span> liked a post
                        </p>
                    </div>
                    <span>2 min ago</span>      
                </div>

                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <p>
                            <span>Leo</span> liked a comment
                        </p>
                    </div>
                    <span>5 min ago</span>      
                </div>

                <div className="user">
                    <div className="userInfo">
                        <img src="https://images.pexels.com/photos/4881619/pexels-photo-4881619.jpeg?auto=compress&cs=tinysrgb&w=1600" alt="" />
                        <p>
                            <span>Peter</span> shared a post
                        </p>
                    </div>
                    <span>5 min ago</span>      
                </div>
            </div>
        </div>
    </div>
  )
}

export default Rightbar