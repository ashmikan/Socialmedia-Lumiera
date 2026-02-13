import { useState } from "react";
import "./EditPost.scss";
import { makeRequest } from "../../axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const EditPost = ({ setOpenEdit, post }) => {
  const [desc, setDesc] = useState(post.desc || "");
  const [file, setFile] = useState(null);

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (updated) => {
      return makeRequest.put("/posts/" + post.id, updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imgUrl = post.img;
    if (file) {
      const uploaded = await upload(file);
      imgUrl = uploaded;
    }

    mutation.mutate({ desc, img: imgUrl });
    setOpenEdit(false);
  };

  return (
    <div className="editPost">
      <div className="wrapper">
        <h2>Edit Post</h2>
        <form onSubmit={handleSubmit}>
          <label>Description</label>
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} />

          <label>Image</label>
          <div className="fileRow">
            <label htmlFor="postImg" className="imgLabel">
              <div className="imgPreview">
                <img
                  src={file ? URL.createObjectURL(file) : (post.img ? "/upload/" + post.img : "")}
                  alt=""
                />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              id="postImg"
              type="file"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="actions">
            <button type="submit">Save</button>
            <button type="button" className="cancel" onClick={() => setOpenEdit(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
