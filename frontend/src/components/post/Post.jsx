import { Link } from "react-router-dom"
import "./Post.scss"
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import TextsmsOutlinedIcon from "@mui/icons-material/TextsmsOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Comments from "../comments/Comments";
import MapIcon from "../../assets/map.png";
import { useState } from "react";
import moment from "moment";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";

const Post = ({ post }) => {
  
  const [commentOpen, setCommentOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const {currentUser} = useContext(AuthContext);

    const { isLoading, isError, error, data } = useQuery({
    queryKey: ["likes", post.id],
    queryFn: () =>
      makeRequest.get("/likes?postId="+post.id).then((res) => {
        return res.data;
      })
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (liked) => {
      if(liked) return makeRequest.delete("/likes?postId="+ post.id);
      return makeRequest.post("/likes", {postId: post.id});  
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["likes"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (postId) => {
      return makeRequest.delete("/posts/" + postId);  
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const shareMutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleLike = () => {
    mutation.mutate(data.includes(currentUser.id))
  }

  const handleDelete = () => {
    deleteMutation.mutate(post.id)
  }

  const handleShare = () => {
    const sharedDesc = post.desc ? `Reshared: ${post.desc}` : "";
    shareMutation.mutate({ desc: sharedDesc, img: post.img });
  }

    
  return (
    <div className="post">
        <div className="container">
            <div className="user">
                <div className="userInfo">
                    <img
                      src={
                        post.profilePic
                          ? (post.profilePic.startsWith("/upload/") || post.profilePic.startsWith("http")
                              ? post.profilePic
                              : "/upload/" + post.profilePic)
                          : ""
                      }
                      alt=""
                    />
                    <div className="details">
                        <Link to={`/profile/${post.userId}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <span className="name">{post.name}</span>
                        </Link>

                        {post.place && (
                          <span className="place" >
                            <span>{post.place}</span>
                          </span>
                        )}

                        <span className="date"> {moment(post.createdAt).fromNow()} </span>
                    </div>
                </div>
                <MoreHorizIcon onClick={() => setMenuOpen(!menuOpen)} />
                {menuOpen && post.userId === currentUser.id && (
                    <button onClick={handleDelete}>Delete</button>
                )}
            </div>
            <div className="content">
                <p>{post.desc}</p>
                <img src={"/upload/" + post.img} alt=""/>
            </div>
            {post.taggedUsers && post.taggedUsers.length > 0 && (
              <div className="tagged">
                <span>With </span>
                {post.taggedUsers.map((u, idx) => (
                  <span key={u.id} style={{ marginRight: 6 }}>
                    <Link to={`/profile/${u.id}`} style={{ textDecoration: "none", color: "inherit" }}>{u.name}</Link>
                    {idx < post.taggedUsers.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
            <div className="info">
                <div className="item">
                    {isLoading ? (
                        "Loading...") 
                    : data?.includes?.(currentUser.id) ? (
                        <FavoriteOutlinedIcon style={{ color: "lightcoral"}} onClick={handleLike} />
                    ) : (
                        <FavoriteBorderOutlinedIcon onClick={handleLike}/>
                        )}
                    {data?.length ?? 0} Likes
                </div>
                <div className="item" onClick={() => setCommentOpen(!commentOpen)}>
                    <TextsmsOutlinedIcon />
                    {data?.length ?? 0} Comments
                </div>
                <div className="item" onClick={handleShare} style={{ cursor: "pointer" }}>
                  <ShareOutlinedIcon />
                  Share
                </div>
            </div>
            {commentOpen && <Comments postId={post.id}/>}
        </div>
    </div>
  )
}

export default Post