import "./Leftbar.scss"
import Friends from "../../assets/1.png";
import Groups from "../../assets/2.png";
import Market from "../../assets/3.png";
import Watch from "../../assets/4.png";
import Memories from "../../assets/5.png";
import Events from "../../assets/6.png";
import Gaming from "../../assets/7.png";
import Gallery from "../../assets/8.png";
import Videos from "../../assets/9.png";
import Messages from "../../assets/10.png";
import Tutorials from "../../assets/11.png";
import Courses from "../../assets/12.png";
import Fund from "../../assets/13.png";
import { useContext, useState } from 'react';
import { AuthContext } from "../../context/authContext";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import { Link } from "react-router-dom";

const Leftbar = () => {
    
  const { currentUser } = useContext(AuthContext);
    const [showGallery, setShowGallery] = useState(false);

    const { isLoading: isGalleryLoading, data: myPosts = [] } = useQuery({
        queryKey: ["shortcuts-gallery", currentUser?.id],
        queryFn: () =>
            makeRequest.get("/posts?userId=" + currentUser.id).then((res) => {
                return res.data;
            }),
        enabled: !!currentUser?.id && showGallery,
    });

    const galleryPosts = (myPosts || [])
        .filter((post) => !!post?.img)
        .slice(0, 12);

  return (
    <div className="leftbar">
        <div className="container">
            <div className="menu">
                <div className="user">
                    <img src={currentUser.profilePic} alt="" />
                    <span>{currentUser.name}</span>
                </div>

                <div className="item">
                    <img src={Friends} alt="" />
                    <span>Friends</span>
                </div>
                <div className="item">
                    <img src={Groups} alt="" />
                    <span>Groups</span>
                </div>
                <div className="item">
                    <img src={Market} alt="" />
                    <span>Marketplace</span>
                </div>
                <div className="item">
                    <img src={Watch} alt="" />
                    <span>Watch</span>
                </div>
                <div className="item">
                    <img src={Memories} alt="" />
                    <span>Memories</span>
                </div>
                </div>
                <hr />
                <div className="menu">
                <span>Your shortcuts</span>
                <div className="item">
                    <img src={Events} alt="" />
                    <span>Events</span>
                </div>
                <div className="item">
                    <img src={Gaming} alt="" />
                    <span>Gaming</span>
                </div>
                                <div className="item clickable" onClick={() => setShowGallery((prev) => !prev)}>
                    <img src={Gallery} alt="" />
                                        <span>{showGallery ? "Hide Gallery" : "Gallery"}</span>
                </div>
                                {showGallery && (
                                    <div className="shortcutsGalleryWrap">
                                        {isGalleryLoading ? (
                                            <span className="galleryStatus">Loading images...</span>
                                        ) : galleryPosts.length > 0 ? (
                                            <div className="shortcutsGallery">
                                                {galleryPosts.map((post) => (
                                                    <Link
                                                        key={post.id}
                                                        to={`/post/${post.id}`}
                                                        className="thumb"
                                                        title={post.desc || "View post"}
                                                    >
                                                        <img
                                                            src={post.img.startsWith("http") || post.img.startsWith("/upload/") ? post.img : "/upload/" + post.img}
                                                            alt="uploaded"
                                                        />
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="galleryStatus">No uploaded images yet.</span>
                                        )}
                                    </div>
                                )}
                <div className="item">
                    <img src={Videos} alt="" />
                    <span>Videos</span>
                </div>
                <div className="item">
                    <img src={Messages} alt="" />
                    <span>Messages</span>
                </div>
                </div>
                <hr />
                <div className="menu">
                <span>Others</span>
                <div className="item">
                    <img src={Fund} alt="" />
                    <span>Fundraiser</span>
                </div>
                <div className="item">
                    <img src={Tutorials} alt="" />
                    <span>Tutorials</span>
                </div>
                <div className="item">
                    <img src={Courses} alt="" />
                    <span>Courses</span>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Leftbar