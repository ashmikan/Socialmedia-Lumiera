import "./Comments.scss"
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({postId}) => {
  const { currentUser } = useContext(AuthContext);

  const { isLoading, isError, data } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get(`/comments?postId=${postId}`).then((res) => res.data),
  });
  
  console.log(data);
  
  return (
    <div className="comments">
        <div className="write">
            <img src={currentUser.profilePic} alt=""/>
            <input type="text" placeholder="Write a comment..."/>
            <button>Send</button>
        </div>
        {isError
          ? "Something went wrong!"
          : isLoading
          ? "Loading..."
          : (data ?? []).map((comment) => (
            <div className="comment" key={comment.id}>
              <img src={comment.profilePicture} alt=""/>
              <div className="info">
                <span>{comment.name}</span>
                <p>{comment.desc}</p>
              </div>
              <div className="date"> {moment(comment.createdAt).fromNow()} </div>
            </div>
          ))}
    </div>
  )
}

export default Comments