import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import PostComponent from "../../components/post/Post";
import Comments from "../../components/comments/Comments";
import "./Post.scss";

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", id],
    queryFn: () =>
      makeRequest.get(`/posts/${id}`).then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="post-page">
        <div className="post-detail">
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="post-page">
        <div className="post-detail">
          <p>Post not found</p>
          <button onClick={() => navigate("/")}>Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page">
      <div className="post-detail">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <PostComponent post={post} />
      </div>
    </div>
  );
};

export default PostPage;
