import React, { useContext, useRef, useState } from "react";
import { Camera, User } from "lucide-react";
import { supabase } from "../../../utils/supabaseClient";
import { updateAvatar } from "../../../apis/auth";
import { AuthContext } from "../../../context/AuthContext";
import toast from "react-hot-toast";

const ProfileAvatar = ({ avatarUrl, onChange, isEditing, id }) => {
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { setUser } = useContext(AuthContext);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file || !file.name) {
      toast.error("Aucun fichier valide sélectionné.");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const loadingToast = toast.loading("Upload de l'avatar en cours...");

    try {
      const { error } = await supabase.storage
        .from("expensetrack")
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData, error: urlError } = await supabase.storage
        .from("expensetrack")
        .getPublicUrl(filePath);

      if (urlError || !urlData?.publicUrl) {
        throw new Error("Impossible de récupérer l'URL publique.");
      }

      const publicUrl = urlData.publicUrl;
      setPreviewUrl(publicUrl);

      await updateAvatar({ avatar: publicUrl, _id: id });
      onChange(publicUrl);

      // ✅ mise à jour propre du user depuis le context
      setUser((prev) => ({
        ...prev,
        avatar: publicUrl,
      }));

      toast.success("Avatar mis à jour avec succès ! 🎉", { id: loadingToast });
    } catch (error) {
      console.error("Erreur Supabase :", error);
      toast.error("Erreur pendant l'upload de l'avatar : " + error.message, {
        id: loadingToast,
      });
    }
  };

  const avatarSrc = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative rounded-full overflow-hidden h-32 w-32 border-4 border-white shadow-lg transition duration-300 ${
          isEditing ? "cursor-pointer hover:opacity-90" : ""
        }`}
        onClick={handleAvatarClick}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Profile"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-200">
            <User size={64} className="text-gray-400" />
          </div>
        )}

        {isEditing && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <Camera size={36} className="text-white" />
          </div>
        )}
      </div>

      {isEditing && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-sm text-blue-500 mt-2">Click to change avatar</p>
        </>
      )}
    </div>
  );
};

export default ProfileAvatar;
