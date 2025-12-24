import "./Share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import Feeling from "../../assets/emoji.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [place, setPlace] = useState("");
  const [showPlaceInput, setShowPlaceInput] = useState(false);
  const [feeling, setFeeling] = useState("");
  const [showFeelingInput, setShowFeelingInput] = useState(false);

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const { data: followerIds = [] } = useQuery({
    queryKey: ["followers", currentUser?.id],
    queryFn: () => makeRequest.get("/relationships?followedUserId=" + currentUser.id).then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  const { data: followerUsers = [] } = useQuery({
    queryKey: ["followerUsers", followerIds],
    queryFn: async () => {
      if (!followerIds || followerIds.length === 0) return [];
      const users = await Promise.all(
        followerIds.map((id) => makeRequest.get("/users/find/" + id).then((res) => res.data))
      );
      return users;
    },
    enabled: followerIds?.length > 0,
  });


  const mutation = useMutation({
    mutationFn: (newPost) => {
      return makeRequest.post("/posts", newPost);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  
  const handleClick = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.id) {
      alert("You must be logged in to share.");
      return;
    }
    let imgUrl = "";
    if (file) imgUrl = await upload();
    const safeTagged = (taggedUsers || [])
      .map((id) => (id == null ? id : Number(id)))
      .filter((id) => id !== null && id !== undefined && !Number.isNaN(id));
    const payload = { desc, img: imgUrl };
    const trimmedPlace = (place || "").trim();
    if (trimmedPlace.length > 0) payload.place = trimmedPlace;
    const trimmedFeeling = (feeling || "").trim();
    if (trimmedFeeling.length > 0) payload.feeling = trimmedFeeling;
    if (safeTagged.length > 0) payload.taggedUsers = safeTagged;
    console.log("POST /posts payload", payload, "currentUser:", currentUser);
    mutation.mutate(payload);
    setDesc("");
    setFile(null);
    setShowTagPicker(false);
    setPlace("");
    setShowPlaceInput(false);
    setFeeling("");
    setShowFeelingInput(false);
  };

  const toggleTag = (userId) => {
    const idNum = userId == null ? userId : Number(userId);
    setTaggedUsers((prev) =>
      prev.includes(idNum) ? prev.filter((id) => id !== idNum) : [...prev, idNum]
    );
  };

  // derive a normalized followerUsers list (ensure id exists)
  const normFollowers = (followerUsers || []).map((u) => ({
    id: u?.id ?? u?.userId ?? null,
    name: u?.name ?? "Unknown",
    profilePic: u?.profilePic ?? null,
  }));

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
            <img src={ currentUser.profilePic} alt="" />
            <input
              type="text"
              placeholder={`What's on your mind ${currentUser.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {file && (
              <img className="file" alt="" src={URL.createObjectURL(file)} />
            )}
          </div>
        </div>
        {showTagPicker && normFollowers?.length > 0 && (
          <div className="tag-friends">
            <label>Tag friends:</label>
            <div className="friends-list">
              {normFollowers.map((u) => (
                <label key={u.id ?? Math.random()} style={{ marginRight: 8 }}>
                  <input
                    type="checkbox"
                    checked={u.id != null && taggedUsers.includes(Number(u.id))}
                    onChange={() => toggleTag(u.id)}
                  />
                  <img
                    src={
                      u.profilePic
                        ? (u.profilePic.startsWith("/upload/") ? u.profilePic : "/upload/" + u.profilePic)
                        : Friend
                    }
                    alt=""
                    style={{ width: 24, height: 24, borderRadius: "50%", marginLeft: 6, marginRight: 6 }}
                  />
                  <span>{u.name || "Unknown"}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {showPlaceInput && (
          <div className="place-input">
            <label>Add Location:</label>
            <input
              type="text"
              placeholder="Where are you?"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </div>
        )}
        {showFeelingInput && (
          <div className="feeling-input">
            <label>Add Feeling:</label>
            <select value={feeling} onChange={(e) => setFeeling(e.target.value)}>
              <option className="null" value="">Select feeling…</option>
              <option value="Happy">Happy 😊</option>
              <option value="Sad">Sad 😢</option>
              <option value="Excited">Excited 🤩</option>
              <option value="Blessed">Blessed 🙏</option>
              <option value="Grateful">Grateful 💖</option>
              <option value="Angry">Angry 😡</option>
              <option value="Tired">Tired 😴</option>
            </select>
          </div>
        )}
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image</span>
              </div>
            </label>
            <div className="item" style={{ cursor: "pointer" }} onClick={() => setShowPlaceInput((s) => !s)}>
              <img src={Map} alt="" />
              <span>Add Location</span>
            </div>
            <div className="item" style={{ cursor: "pointer" }} onClick={() => setShowTagPicker((s) => !s)}>
              <img src={Friend} alt="" />
              <span>Tag Friends</span>
            </div>
            <div className="item" style={{ cursor: "pointer" }} onClick={() => setShowFeelingInput((s) => !s)}>
              <img src={Feeling} alt="" />
              <span>Add Feeling</span>
            </div>
          </div>
          <div className="right">
            <button onClick={handleClick}>Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;