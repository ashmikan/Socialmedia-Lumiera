import "./Stories.scss"
import { useContext, useRef } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

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


  return (
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
        {statuses.map((status) => (
            <div className="story" key={status.id}>
                <img src={normalizeUploadPath(status.img)} alt=""/>
                <span>{status.name}</span>
            </div>
        ))}
    </div>
  )
}

export default Stories