// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

const CLOUDINARY_UPLOAD_PRESET = 'diplom'; // Вы получите это в настройках Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dh2qb7atd'; // Ваше cloud name из Cloudinary

function HomePage() {
  const [logoURL, setLogoURL] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [newLogo, setNewLogo] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLogoURL(data.logoURL || "");
          setDescription(data.description || "");
          setImages(data.images || []);
        }
      }
    };
    fetchData();
  }, [user]);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload-image', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        return data.url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

  const handleLogoUpload = async () => {
    if (newLogo && user) {
      try {
        setLoading(true);
        const url = await uploadToCloudinary(newLogo);
        setLogoURL(url);
        await updateDoc(doc(db, "users", user.uid), {
          logoURL: url,
        });
      } catch (error) {
        console.error('Error uploading logo:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImagesUpload = async () => {
    if (newImages.length > 0 && user) {
      try {
        setLoading(true);
        const uploadPromises = Array.from(newImages).map(uploadToCloudinary);
        const urls = await Promise.all(uploadPromises);
        
        const updatedImages = [...images, ...urls];
        setImages(updatedImages);
        await updateDoc(doc(db, "users", user.uid), {
          images: updatedImages,
        });
      } catch (error) {
        console.error('Error uploading images:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDescriptionSave = async () => {
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        { description },
        { merge: true }
      );
    }
  };

  return (
    <div className="homepage-container">
      <aside className="sidebar">
        <h2 className="logo">ЛОГО</h2>
        <nav className="nav-links">
          <a href="/check">Проверка</a>
          <a href="/stats">Статистика</a>
          <a href="/register-group">Группы</a>
          <a href="/profile">Профиль</a>
          <a href="/instructions">Инструкция</a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="header">
          {logoURL && (
            <img
              src={logoURL}
              alt="Логотип компании"
              className="company-logo"
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewLogo(e.target.files[0])}
            disabled={loading}
          />
          <button onClick={handleLogoUpload} disabled={loading}>
            {loading ? 'Загрузка...' : 'Загрузить логотип'}
          </button>
        </header>

        <section className="about">
          <h1>О нашей кампании</h1>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            disabled={loading}
          />
          <button onClick={handleDescriptionSave} disabled={loading}>
            Сохранить описание
          </button>
        </section>

        <section className="gallery">
          <h2>Наша работа</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewImages(e.target.files)}
            disabled={loading}
          />
          <button onClick={handleImagesUpload} disabled={loading}>
            {loading ? 'Загрузка...' : 'Загрузить изображения'}
          </button>
          <div className="images">
            {images.map((src, i) => (
              <img key={i} src={src} alt={`promo${i}`} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
