import "./Stories.scss"
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const AUTO_PLAY_MS = 5000;

  const normalizeUploadPath = (value) => {
    if (!value) return "";
    if (value.startsWith("http") || value.startsWith("/upload/")) return value;
    return "/upload/" + value;
  };

  const { data: statuses = [] } = useQuery({
    queryKey: ["statuses"],
    queryFn: () => makeRequest.get("/statuses").then((res) => res.data),
    enabled: !!currentUser?.id,
  });

  const storyItems = useMemo(() => {
    if (!statuses || statuses.length === 0) return [];
    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
      img: status.img,
      createdAt: status.createdAt,
      profilePic: status.profilePic,
      userId: status.userId,
    }));
  }, [statuses]);

  const uploadStatusImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await makeRequest.post("/upload", formData);
    return res.data;
  };

  const addStatusMutation = useMutation({
    mutationFn: (newStatus) => makeRequest.post("/statuses", newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses"] });
    },
  });

  const handleAddStatus = () => {
    fileInputRef.current?.click();
  };

  const handleStatusFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadedFileName = await uploadStatusImage(file);
      await addStatusMutation.mutateAsync({ img: uploadedFileName });
    } catch (err) {
      console.log(err);
    } finally {
      e.target.value = "";
    }
  };

  const closeViewer = () => {
    setViewerOpen(false);
  };

  const openViewerAt = (index) => {
    if (!storyItems.length) return;
    setActiveIndex(index);
    setViewerOpen(true);
  };

  const goNext = () => {
    if (!storyItems.length) return;
    if (activeIndex >= storyItems.length - 1) {
      closeViewer();
      return;
    }
    setActiveIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (!storyItems.length) return;
    setActiveIndex((prev) => (prev <= 0 ? 0 : prev - 1));
  };

  useEffect(() => {
    if (!viewerOpen || !storyItems.length) return;
    const timer = setTimeout(() => {
      goNext();
    }, AUTO_PLAY_MS);
    return () => clearTimeout(timer);
  }, [viewerOpen, activeIndex, storyItems.length]);

  useEffect(() => {
    if (!viewerOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeViewer();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerOpen, activeIndex, storyItems.length]);

  const activeStory = storyItems[activeIndex];
  const progressPercent = viewerOpen ? ((activeIndex + 1) / Math.max(storyItems.length, 1)) * 100 : 0;


  return (
    <>
    <div className="stories">
        <div className="story">
                <img src={normalizeUploadPath(currentUser.profilePic)} alt=""/>
                <span>{currentUser.name}</span>
                <button onClick={handleAddStatus} disabled={addStatusMutation.isPending}>+</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleStatusFileChange}
                />
            </div>
        {storyItems.map((status, index) => (
            <div className="story" key={status.id} onClick={() => openViewerAt(index)}>
                <img src={normalizeUploadPath(status.img)} alt=""/>
                <span>{status.name}</span>
            </div>
        ))}
    </div>
    {viewerOpen && activeStory && (
      <div className="storyViewerOverlay" onClick={closeViewer}>
        <div className="storyViewer" onClick={(e) => e.stopPropagation()}>
          <div className="progressTrack">
            <div className="progressBar" style={{ width: `${progressPercent}%` }} />
          </div>

          <button className="closeBtn" onClick={closeViewer}>x</button>

          <div className="viewerHeader">
            <img src={normalizeUploadPath(activeStory.profilePic)} alt="" />
            <span>{activeStory.name}</span>
          </div>

          <img className="viewerImage" src={normalizeUploadPath(activeStory.img)} alt="" />

          <div className="viewerControls">
            <button onClick={goPrev} disabled={activeIndex === 0}>Prev</button>
            <button onClick={goNext}>{activeIndex >= storyItems.length - 1 ? "Finish" : "Next"}</button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

export default Stories