import { useState, useEffect } from "react";

const DiscordCard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("API_LINKİNİZ"); // API'den veri çek
        const result = await response.json();
        setData(result); // State'i güncelle
      } catch (error) {
        console.error("API'den veri çekilirken hata oluştu:", error);
      }
    };

    fetchData(); // Bileşen yüklendiğinde çalıştır
    const interval = setInterval(fetchData, 5000); // 5 saniyede bir yenile

    return () => clearInterval(interval); // Bileşen kaldırıldığında temizle
  }, []);

  if (!data) return <p>Yükleniyor...</p>;

  return (
    <div className="card">
      <img src={data.avatar} alt="Profil Resmi" />
      <h2>{data.username}</h2>
      <p>{data.status}</p>
    </div>
  );
};

export default DiscordCard;
