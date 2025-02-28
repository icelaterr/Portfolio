import React from "react";

const DiscordCard: React.FC<{ userId: string }> = ({ userId }) => {
  const cardUrl = `https://api.setscript.com/users/card/${userId}`;

  return (
    <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <img
        src={cardUrl}
        alt="Discord Kullanıcı Kartı"
        className="w-full h-auto"
      />
    </div>
  );
};

export default DiscordCard;
