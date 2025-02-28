import React, { useEffect, useState } from "react";

const DiscordCard: React.FC<{ userId: string }> = ({ userId }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Sayfa yüklendiğinde CSS veya Canvas içeriğini al
    setTimeout(() => {
      const bgDiv = document.querySelector("div[style*='background-image']");
      if (bgDiv) {
        const bgImage = bgDiv.getAttribute("style")?.match(/url\(["']?(.*?)["']?\)/)?.[1];
        if (bgImage) setImageUrl(bgImage);
      }

      const canvas = document.querySelector("canvas");
      if (canvas) {
        setImageUrl(canvas.toDataURL());
      }
    }, 1000);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {imageUrl ? (
        <img src={imageUrl} alt="Discord Kullanıcı Kartı" className="w-full h-auto" />
      ) : (
        <p>Resim yükleniyor...</p>
      )}
    </div>
  );
};

export default DiscordCard;
