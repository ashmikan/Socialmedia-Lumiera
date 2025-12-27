import "./Comments.scss"
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import { makeRequest } from "../../axios";
import moment from "moment";
import { useState } from "react";

const Comments = ({postId}) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);

  const { isLoading, isError, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get(`/comments?postId=${postId}`).then((res) => res.data),
  });
  
  
  const queryClient = useQueryClient();


  const mutation = useMutation({
    mutationFn: (newComment) => {
      return makeRequest.post("/comments", newComment);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => {
      return makeRequest.delete(`/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    },
  });

  // Fetch likes for all comments in this post (map: commentId -> [userIds])
  const { data: commentLikes } = useQuery({
    queryKey: ["commentLikes", postId],
    queryFn: () =>
      makeRequest.get(`/comment-likes?postId=${postId}`).then((res) => res.data),
  });

  const likeMutation = useMutation({
    mutationFn: (commentId) => {
      return makeRequest.post("/comment-likes", { commentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commentLikes"] });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: (commentId) => {
      return makeRequest.delete(`/comment-likes?commentId=${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commentLikes"] });
    },
  });

  const isLikedByMe = (commentId) => {
    const users = commentLikes?.[commentId] || [];
    return users.includes?.(currentUser.id);
  };

  const likeCount = (commentId) => (commentLikes?.[commentId]?.length ?? 0);

  const handleToggleLike = (commentId) => {
    if (isLikedByMe(commentId)) {
      unlikeMutation.mutate(commentId);
    } else {
      likeMutation.mutate(commentId);
    }
  };

  
  const handleClick = async (e) => {
    e.preventDefault();
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  
  return (
    <div className="comments">
        <div className="write">
            <img
              src={
                currentUser.profilePic
                  ? (currentUser.profilePic.startsWith('/upload/') || currentUser.profilePic.startsWith('http')
                      ? currentUser.profilePic
                      : `/upload/${currentUser.profilePic}`)
                  : ""
              }
              alt=""
            />
            <input 
              type="text" 
              placeholder="Write a comment..." 
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
            <button onClick={handleClick}> Send</button>
        </div>
        {isError
          ? "Something went wrong!"
          : isLoading
          ? "Loading..."
          : (data ?? []).map((comment) => (
            <div className="comment" key={comment.id}>
              <img
                src={
                  comment.profilePic
                    ? (comment.profilePic.startsWith('/upload/') || comment.profilePic.startsWith('http')
                        ? comment.profilePic
                        : `/upload/${comment.profilePic}`)
                    : ""
                }
                alt=""
              />
              <div className="info">
                <span>{comment.name}</span>
                <p>{comment.desc}</p>
                <div className="comment-like">
                  {isLikedByMe(comment.id) ? (
                    <FavoriteOutlinedIcon 
                      fontSize="small"
                      style={{ color: 'lightcoral', cursor: 'pointer' }} 
                      onClick={() => handleToggleLike(comment.id)}
                    />
                  ) : (
                    <FavoriteBorderOutlinedIcon 
                      fontSize="small"
                      style={{ cursor: 'pointer' }} 
                      onClick={() => handleToggleLike(comment.id)}
                    />
                  )}
                  <span className="like-count">{likeCount(comment.id)}</span>
                </div>
              </div>
              <div className="date">
                {moment(comment.createdAt).fromNow()}
                {comment.userId === currentUser.id && (
                  <button
                    className="delete-btn"
                    onClick={() => deleteMutation.mutate(comment.id)}
                    title="Delete comment"
                  >
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </button>
                )}
              </div>
            </div>
          ))}
    </div>
  )
}

export default Comments