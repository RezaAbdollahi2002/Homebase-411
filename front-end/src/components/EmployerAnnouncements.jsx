import { useState, useEffect } from "react";
import axios from "axios";
import { PiFiles } from "react-icons/pi";
import { useForm } from "react-hook-form";

const BASE_URL = "/api/announcements/";

const EmployerAnnouncements = () => {
  const [createAnnouncement, setCreateAnnouncement] = useState(false);
  const [editAnnouncements, setEditAnnouncements] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [expiresAt, setExpiresAt] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().substring(0, 10);
  });
  const [attachment, setAttachment] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [announcementId, setAnnouncementId] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const employerId = localStorage.getItem("employer_id");
  console.log("employer id:", employerId);

  // Fetch announcements
  useEffect(() => {
    if (!employerId) return;
    const fetchAnnouncements = async () => {
      try {
        const res = await axios.get(`${BASE_URL}get-announcements`, {
          params: { employer_id: employerId },
        });
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Error fetching announcements:", err);
      }
    };
    fetchAnnouncements();
  }, [employerId]);

  // ---------------- CREATE ----------------
  const handleCreateSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("employer_id", employerId);
      formData.append("title", title);
      formData.append("message", message);
      if (expiresAt && expiresAt.trim() !== "") {
        formData.append("expires_at", expiresAt);
      }
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await axios.post(`${BASE_URL}create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Announcement created:", res.data);
      setAnnouncements((prev) => [...prev, res.data]);
      resetForm();
      setCreateAnnouncement(false);
    } catch (err) {
      console.error("Error creating announcement:", err);
    }
  };

  // ---------------- EDIT ----------------
  const handleEdit = (announcement) => {
    setAnnouncementId(announcement.id);
    setTitle(announcement.title);
    setMessage(announcement.message);
    setExpiresAt(announcement.expires_at?.split("T")[0] || "");
    setAttachment(null);
    setEditAnnouncements(true);
  };

  const handleEditSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("employer_id", employerId);
      formData.append("title", title);
      formData.append("message", message);
      if (expiresAt && expiresAt.trim() !== "") {
        formData.append("expires_at", expiresAt);
      }
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const res = await axios.put(`${BASE_URL}edit/${announcementId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Announcement updated:", res.data);
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === res.data.id ? res.data : a))
      );
      resetForm();
      setEditAnnouncements(false);
      setAnnouncementId(null);
    } catch (err) {
      console.error("Error updating announcement:", err);
    }
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (announcement) => {
    if (!window.confirm(`Delete announcement "${announcement.title}"?`)) return;
    try {
      await axios.delete(`${BASE_URL}delete/${announcement.id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== announcement.id));
      console.log("Announcement deleted successfully");
    } catch (err) {
      console.error("Error deleting announcement:", err);
    }
  };

  // ---------------- HELPERS ----------------
  const resetForm = () => {
    setTitle("");
    setMessage("");
    setExpiresAt(() => {
      const date = new Date();
      date.setMonth(date.getMonth() + 3);
      return date.toISOString().substring(0, 10);
    });
    setAttachment(null);
  };

  // ---------------- RENDER ----------------
  const visibleAnnouncements = showAll ? announcements : announcements.slice(0, 2);

  return (
    <div className="text-black mt-5">
      <h1 className="text-lg md:text-xl lg:text-2xl font-bold mx-2 my-2">Announcement</h1>

      {/* Action buttons */}
      <div className="grid grid-cols-1 gap-3 justify-between px-3 py-1">
        <button
          className="text-purple-800 text-sm lg:text-medium shadow-lg round-sm border-gray-400 bg-gray-100 border-x-gray-400 px-2 py-1 hover:scale-105 duration:100"
          onClick={() => setCreateAnnouncement(true)}
        >
          Create Announcement
        </button>
      </div>

      {/* Create Modal */}
      {createAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="border border-gray-500 shadow-2xl px-6 py-4 bg-white rounded-xl">
            <p
              className="text-left text-blue-600 cursor-pointer hover:underline mb-3"
              onClick={() => setCreateAnnouncement(false)}
            >
              Back
            </p>
            <h1 className="font-bold text-center text-xl lg:text-2xl my-4">Create Announcement</h1>
            <form onSubmit={handleSubmit(handleCreateSubmit)} className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Title */}
              <div className="flex gap-3">
                <label className="text-purple-700 font-bold">Title: </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="text-sm font-semibold mt-1 px-2 py-2 max-h-[20px] border-gray-400"
                  placeholder="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <p>{errors.title.message}</p>}
              </div>
              {/* Expiration Date */}
              <div className="flex gap-3 items-center">
                <label className="text-purple-700 font-bold">Expiration date:</label>
                <input
                  type="date"
                  className="text-black px-2 py-1 border border-gray-400 rounded-md focus:outline-none"
                  value={expiresAt}
                  {...register("expires_at")}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().substring(0, 10)}
                />
                {errors.expires_at && <p className="text-xs text-red-500">{errors.expires_at.message}</p>}
              </div>
              {/* Message */}
              <div>
                <label className="font-bold block mb-1 text-purple-700">Announcement Message:</label>
                <textarea
                  {...register("message", { required: "Message is required" })}
                  className="border border-gray-700 text-black w-full rounded-md px-2 py-2 min-h-[120px]"
                  placeholder="Write your announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>
              {/* Attachment */}
              <div>
                <label className="font-bold block mb-1 text-purple-700">Attachment:</label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="file-upload"
                    className="flex items-center gap-2 cursor-pointer border border-purple-700 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-50"
                  >
                    <p className="text-purple-700 font-bold">Choose File</p>
                    <PiFiles className="w-6 h-6 text-purple-700" />
                  </label>
                  <input id="file-upload" type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
                </div>
                {attachment && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: <span className="font-medium">{attachment.name}</span>
                  </p>
                )}
                <div className="text-right mt-2">
                  <button
                    type="submit"
                    className="bg-blue-300 text-black font-bold border border-black px-2 py-1 hover:text-white hover:bg-purple-700 hover:scale-105 duration-300"
                  >
                    Create
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editAnnouncements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="border border-gray-500 shadow-2xl px-6 py-4 bg-white rounded-xl">
            <p
              className="text-left text-blue-600 cursor-pointer hover:underline mb-3"
              onClick={() => setEditAnnouncements(false)}
            >
              Back
            </p>
            <h1 className="font-bold text-center text-xl lg:text-2xl my-4">Edit Announcement</h1>
            <form onSubmit={handleSubmit(handleEditSubmit)} className="mx-auto grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Title */}
              <div className="flex gap-3">
                <label className="text-purple-700 font-bold">Title: </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="text-sm font-semibold mt-1 px-2 py-2 max-h-[20px] border-gray-400"
                  placeholder="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                {errors.title && <p>{errors.title.message}</p>}
              </div>
              {/* Expiration Date */}
              <div className="flex gap-3 items-center">
                <label className="text-purple-700 font-bold">Expiration date:</label>
                <input
                  type="date"
                  className="text-black px-2 py-1 border border-gray-400 rounded-md focus:outline-none"
                  value={expiresAt}
                  {...register("expires_at")}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().substring(0, 10)}
                />
                {errors.expires_at && <p className="text-xs text-red-500">{errors.expires_at.message}</p>}
              </div>
              {/* Message */}
              <div>
                <label className="font-bold block mb-1 text-purple-700">Announcement Message:</label>
                <textarea
                  {...register("message", { required: "Message is required" })}
                  className="border border-gray-700 text-black w-full rounded-md px-2 py-2 min-h-[120px]"
                  placeholder="Write your announcement..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
              </div>
              {/* Attachment */}
              <div>
                <label className="font-bold block mb-1 text-purple-700">Attachment:</label>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="edit-file-upload"
                    className="flex items-center gap-2 cursor-pointer border border-purple-700 text-purple-700 px-3 py-2 rounded-md hover:bg-purple-50"
                  >
                    <p className="text-purple-700 font-bold">Choose File</p>
                    <PiFiles className="w-6 h-6 text-purple-700" />
                  </label>
                  <input id="edit-file-upload" type="file" className="hidden" onChange={(e) => setAttachment(e.target.files[0])} />
                </div>
                {attachment && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: <span className="font-medium">{attachment.name}</span>
                  </p>
                )}
                <div className="text-right mt-2">
                  <button
                    type="submit"
                    className="bg-blue-300 text-black font-bold border border-black px-2 py-1 hover:text-white hover:bg-purple-700 hover:scale-105 duration-300"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcements list */}
      {visibleAnnouncements.length > 0 &&
        visibleAnnouncements.map((announcement, index) => (
          <div
            key={announcement.id || index}
            className="border border-gray-100 shadow-2xl px-3 py-3 bg-[#E2E4F2] text-black w-full my-2 rounded-sm hover:scale-105 duration:300"
          >
            <div className="flex justify-between items-center">
              <h1 className="text-lg lg:text-xl my-2 text-center font-bold">{announcement.title}</h1>
              <div className="flex gap-2">
                <p>{announcement.created_at?.split("T")[0]}</p>
                <button
                  className="text-black border border-gray-400 px-2 py-1 shadow-sm hover:text-white hover:bg-blue-200 hover:scale-105 text-xs"
                  onClick={() => handleEdit(announcement)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-black hover:text-white hover:scale-105 duration-300 px-2 py-1 text-xs"
                  onClick={() => handleDelete(announcement)}
                >
                  Remove
                </button>
              </div>
            </div>
            {expandedId === announcement.id ? (
              <p className="text-sm px-2 w-full break-words">
                {announcement.message}
                <span className="text-xs text-gray-700 cursor-pointer ml-1" onClick={() => setExpandedId(null)}>
                  less
                </span>
              </p>
            ) : (
              <p className="text-sm px-2 w-full break-words">
                {announcement.message.slice(0, 200)}...
                <span className="text-xs text-gray-700 cursor-pointer ml-1" onClick={() => setExpandedId(announcement.id)}>
                  more
                </span>
              </p>
            )}
            <p className="text-left text-red-500 text-xs lg:text-sm px-2">{announcement.expires_at}</p>
          </div>
        ))}

      {/* Show All / Show Less toggle */}
      {announcements.length > 2 && (
        <div className="text-center mt-3">
          <button className="text-blue-600 underline" onClick={() => setShowAll(!showAll)}>
            {showAll ? "Show Less" : "Show All"}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmployerAnnouncements;
