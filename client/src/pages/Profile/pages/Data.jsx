import React, { useContext, useState } from "react";
import NotificationToast from "./NotificationToast";
import ProfileForm from "./ProfileForm";
import ProfileView from "./ProfileView";
import ProfileAvatar from "./ProfileAvatar";
import { AuthContext } from "../../../context/AuthContext";
import defaultAvatar from "../../../assets/defaultAvatar.jpg";
import { update } from "../../../apis/auth";

export default function Data() {
  const { user, setUser } = useContext(AuthContext);
  const defaultProfile = {
    firstName:
      user.email.split("@")[0].charAt(0).toUpperCase() +
      user.email.split("@")[0].slice(1).toLowerCase(),
    lastName: "Doe",
    email: user.email,
    username: `${user.username.split("@")[0].toLowerCase()}`,
    bio: "Développeur passionné par la création de belles expériences utilisateur.",
    jobTitle: "Développeur full stack",
    company: "Google",
    location: "San Francisco, CA",
    website: `https://${user.email
      .replace(/@/, "_")
      .replace(/\.[a-z]{2,3}$/, "")}.fr`,
    avatarUrl: user.avatar || defaultAvatar,
  };
  const [profile, setProfile] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleProfileSubmit = async (data) => {
    try {
      const newData = { ...data, _id: user._id };
      const updatedUser = await update(newData); // données venant du backend

      // Met à jour l'état profile avec les données frontend
      setProfile(newData);

      // Met à jour AuthContext + localStorage avec les données backend correctes
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setIsEditing(false);
      setNotification({
        message: "Profil mis à jour avec succès !",
        type: "success",
        isVisible: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleAvatarChange = (url) => {
    setProfile((prev) => ({
      ...prev,
      avatarUrl: url,
    }));
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-32 sm:h-48"></div>
          <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex sm:space-x-5">
                <div className="-mt-16 sm:-mt-24">
                  <ProfileAvatar
                    avatarUrl={profile.avatarUrl}
                    id={user._id}
                    onChange={handleAvatarChange}
                    isEditing={isEditing}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              {isEditing ? (
                <ProfileForm
                  initialData={profile}
                  onSubmit={handleProfileSubmit}
                  onCancel={handleCancelEdit}
                />
              ) : (
                <ProfileView data={profile} onEdit={handleEditClick} />
              )}
            </div>
          </div>
        </div>
      </div>

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={handleCloseNotification}
      />
    </div>
  );
}
