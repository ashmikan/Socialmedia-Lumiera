import "./Profile.scss"
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts"
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import {useState} from "react";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);

  const { currentUser } = useContext(AuthContext);
  const urlUserId = useLocation().pathname.split("/")[2];
  const userId = urlUserId === "me" ? currentUser?.id : urlUserId;

  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      makeRequest.get("/users/find/"+userId).then((res) => {
        return res.data;
      }),
    enabled: !!userId
  });

  const { isLoading: rIsLoading, data: relationshipData } = useQuery({
    queryKey: ["relationship", userId],
    queryFn: () =>
      makeRequest.get("/relationships?followedUserId="+ userId).then((res) => {
        return res.data;
      }),
    enabled: !!userId && currentUser?.id !== parseInt(userId)
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (Following) => {
      if(Following) return makeRequest.delete("/relationships?userId="+ userId);
      return makeRequest.post("/relationships", {userId});  
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["relationship"] });
    },
  });

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id))
  }


  return (
    <div className="profile">
      <div className="images">
        <img
          src={data?.coverPic}
          alt=""
          className="cover"
        />
        <img
          src={data?.profilePic}
          alt=""
          className="profilePic"
        />
      </div>
      <div className="profileContainer">
        <div className="uInfo">
          <div className="left">
            <a href="http://facebook.com">
              <FacebookTwoToneIcon fontSize="large" />
            </a>
            <a href="http://facebook.com">
              <InstagramIcon fontSize="large" />
            </a>
            <a href="http://facebook.com">
              <TwitterIcon fontSize="large" />
            </a>
            <a href="http://facebook.com">
              <LinkedInIcon fontSize="large" />
            </a>
            <a href="http://facebook.com">
              <PinterestIcon fontSize="large" />
            </a>
          </div>
          <div className="center">
            <span>{data?.name}</span>
            <div className="info">
              <div className="item">
                <PlaceIcon />
                <span>{data?.city}</span>
              </div>
            </div>
            {rIsLoading ? "loading" : currentUser?.id === parseInt(userId) ? (
              <button onClick={ () => setOpenUpdate (true) }>Update</button>
            ) : (
              <button onClick={handleFollow}>{relationshipData?.includes(currentUser.id) ? "Following" : "Follow"}</button>
            )}
          </div>
          <div className="right">
            <EmailOutlinedIcon />
            <MoreVertIcon />
          </div>
        </div>
      <Posts userId={userId} />
      </div>
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={data} />}
    </div>
  )
}

export default Profile