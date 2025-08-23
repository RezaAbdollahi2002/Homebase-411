import React, { useEffect, useState } from "react";
import { FaPenFancy, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BACKEND_URL = "http://localhost:8000";

const EmployerProfile = () => {
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [errors, setErrors] = useState({});

  const employerId = localStorage.getItem("employer_id");

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d) ? "" : d.toISOString().split("T")[0];
  };

  // Fetch profile on mount
  useEffect(() => {
    if (!employerId) {
      toast.error("Employer ID not found");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/employer/settings/${employerId}/employer-info`
        );
        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setProfileData({ ...data, dob: formatDate(data.dob) });
        setOriginalProfileData({ ...data, dob: formatDate(data.dob) });
        setPreview(data.profile_pic ? `${data.profile_pic}` : "");
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [employerId]);

  // Handle profile picture change
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

  // Update only the profile picture
  const uploadProfilePicture = async () => {
    if (!profilePic) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", profilePic);

      const response = await fetch(
        `${BACKEND_URL}/employers/${employerId}/profile-picture`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPreview(`${BACKEND_URL}${data.profile_picture}`);
        toast.success("Profile picture updated!");
        setProfilePic(null);
      } else {
        const err = await response.json();
        toast.error("Upload failed: " + (err.detail || "Unknown error"));
      }
    } catch (error) {
      toast.error("Error uploading picture: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle profile info input
  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const newErrors = {};
    if (!profileData.first_name?.trim()) newErrors.first_name = "First name required";
    if (!profileData.last_name?.trim()) newErrors.last_name = "Last name required";
    if (!profileData.email || !/^\S+@\S+\.\S+$/.test(profileData.email))
      newErrors.email = "Valid email required";
    if (!/^\d{10,}$/.test(profileData.phone_number))
      newErrors.phone_number = "Phone number must be at least 10 digits";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setProfileData(originalProfileData);
    setPreview(originalProfileData?.profile_pic ? `${originalProfileData.profile_pic}` : "");
    setProfilePic(null);
    setEdit(false);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInputs()) {
      toast.error("Please fix validation errors");
      return;
    }
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("first_name", profileData.first_name || "");
      formData.append("last_name", profileData.last_name || "");
      formData.append("email", profileData.email || "");
      formData.append("phone_number", profileData.phone_number || "");

      const response = await fetch(
        `${BACKEND_URL}/employers/${employerId}/settings/update`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        toast.success("Profile info updated!");
        setOriginalProfileData(profileData);
        setEdit(false);
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

  const fields = [
    { name: "first_name", label: "First Name", type: "text" },
    { name: "last_name", label: "Last Name", type: "text" },
    { name: "email", label: "Email", type: "text" },
    { name: "phone_number", label: "Phone Number", type: "text" },
  ];

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-xl">
      <ToastContainer />
      <div className="flex flex-col">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4 mb-6">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Profile Preview"
                className="w-24 h-24 rounded-full object-cover border"
              />
              <button
                type="button"
                onClick={removeImage}
                disabled={isUploading}
                title="Remove image"
                className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <FaTrashAlt />
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 border">
              No Image
            </div>
          )}
          <div className="flex flex-col">
            <label
              htmlFor="profilePicInput"
              className={`cursor-pointer text-purple-700 font-semibold ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Change Profile Photo
            </label>
            <input
              type="file"
              id="profilePicInput"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {profilePic && (
              <button
                type="button"
                onClick={uploadProfilePicture}
                disabled={isUploading}
                className="mt-2 px-3 py-1 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </button>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <div className="flex items-center mb-1">
            <p className="text-lg font-semibold">Profile Info</p>
            <button
              type="button"
              onClick={() => setEdit(!edit)}
              disabled={isUploading}
              className="ml-3 text-purple-700 hover:text-purple-900 transition"
              title={edit ? "Stop Editing" : "Edit Profile"}
            >
              <FaPenFancy className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            {fields.map(({ name, label, type }) => (
              <div key={name}>
                <label className="block text-purple-900 font-semibold mb-1">{label}</label>
                {edit ? (
                  <>
                    <input
                      type={type}
                      value={profileData?.[name] || ""}
                      onChange={(e) => handleInputChange(name, e.target.value)}
                      className={`w-full border p-2 rounded text-sm ${
                        errors[name] ? "border-red-500" : "border-gray-300"
                      }`}
                      disabled={isUploading}
                    />
                    {errors[name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
                    )}
                  </>
                ) : (
                  <p className="text-black ml-1">{profileData?.[name] || "Not Provided"}</p>
                )}
              </div>
            ))}
          </div>

          {edit && (
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="mr-3 px-3 py-1 rounded border border-gray-300 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className={`text-white rounded px-4 py-2 bg-purple-700 font-semibold hover:scale-105 transition ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
