import React, { useEffect, useState } from "react";
import { FaPenFancy, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKEND_URL = "http://localhost:8000";

const EmployeeProfile = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState({});

  const employeeId = localStorage.getItem("employee_id");

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  };

  // Fetch employee profile
  useEffect(() => {
    if (!employeeId) {
      toast.error("Employee ID not found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/employees/settings/${employeeId}/employee-info`
        );
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfileData({ ...data, dob: formatDate(data.dob) });
        setOriginalProfileData({ ...data, dob: formatDate(data.dob) });
        setPreview(data.profile_pic ? `${BACKEND_URL}${data.profile_pic}` : "");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employeeId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfilePic(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfilePic(null);
    setPreview("");
  };

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!profileData.first_name?.trim()) newErrors.first_name = "First name is required";
    if (!profileData.last_name?.trim()) newErrors.last_name = "Last name is required";
    if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email)) newErrors.email = "Valid email is required";
    if (!profileData.phone_number || profileData.phone_number.trim().length < 10) newErrors.phone_number = "Phone number must be at least 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setProfileData(originalProfileData);
    setPreview(originalProfileData.profile_pic ? `${BACKEND_URL}${originalProfileData.profile_pic}` : "");
    setProfilePic(null);
    setEdit(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error("Employee ID not loaded yet");
      return;
    }
    if (!validateInputs()) {
      toast.error("Please fix validation errors");
      return;
    }
    setIsUploading(true);

    try {
      const formData = new FormData();
      if (profilePic) formData.append("file", profilePic);
      formData.append("first_name", profileData.first_name || "");
      formData.append("last_name", profileData.last_name || "");
      formData.append("dob", profileData.dob || "");
      formData.append("email", profileData.email || "");
      formData.append("phone_number", profileData.phone_number || "");

      const response = await fetch(`${BACKEND_URL}/employees/${employeeId}/settings/update`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Profile updated successfully!");
        setPreview(data.profile_pic ? `${BACKEND_URL}${data.profile_pic}` : "");
        setProfilePic(null);
        setEdit(false);
        setOriginalProfileData((prev) => ({ ...profileData, profile_pic: data.profile_pic }));
      } else {
        const err = await response.json();
        toast.error("Update failed: " + (err.detail || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error updating profile: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return <div className="text-center mt-10 text-gray-600">Loading profile...</div>;

  return (
    <div className="max-w-md md:mx-1 mx-auto mt-10 p-4 border rounded shadow-xl">
      <ToastContainer />
      <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
        <div className="flex justify-between items-center mb-4">
          <h1 className="font-bold text-xl">Profile</h1>
          <div>
            {edit && (
              <button type="button" onClick={handleCancel} disabled={isUploading} className="mr-3 px-3 py-1 rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
            )}
            <button type="submit" disabled={isUploading} className={`text-white rounded px-4 py-2 bg-purple-700 font-semibold transition-transform duration-200 hover:scale-105 ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
              {isUploading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <hr className="mb-6" />

        <div className="flex items-center space-x-4 mb-6">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border" />
              <button type="button" onClick={removeImage} disabled={isUploading} title="Remove image" className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition"><FaTrashAlt /></button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 border">No Image</div>
          )}

          <label htmlFor="profilePicInput" className={`cursor-pointer text-purple-700 font-semibold ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}>
            Change Profile Photo
          </label>
          <input type="file" id="profilePicInput" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        </div>

        <div>
          <div className="flex items-center mb-1">
            <p className="text-lg font-semibold">Profile Info</p>
            <button type="button" onClick={() => setEdit(!edit)} disabled={isUploading} className="ml-3 text-purple-700 hover:text-purple-900 transition" title={edit ? "Stop Editing" : "Edit Profile"}>
              <FaPenFancy className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">You can also change these settings in the app on your device.</p>

          <div className="flex flex-col gap-4">
            {["first_name", "last_name", "dob", "email", "phone_number"].map((field) => (
              <div key={field}>
                <label htmlFor={field} className="block text-purple-900 font-semibold capitalize mb-1">{field.replace("_", " ")}</label>
                {edit ? (
                  <>
                    <input id={field} type={field === "dob" ? "date" : "text"} value={profileData?.[field] || ""} onChange={(e) => handleInputChange(field, e.target.value)} className={`w-full border p-2 rounded text-sm ${errors[field] ? "border-red-500" : "border-gray-300"}`} disabled={isUploading} />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]}</p>}
                  </>
                ) : (
                  <p className="text-black ml-1">{profileData?.[field] || "Not Provided"}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmployeeProfile;
