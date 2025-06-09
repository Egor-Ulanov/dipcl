// src/components/HomePage.jsx
import React, { useState, useEffect } from "react";
import { auth, db } from "./firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import './stylesHomePage.css';

const CLOUDINARY_UPLOAD_PRESET = 'diplom'; // Вы получите это в настройках Cloudinary
const CLOUDINARY_CLOUD_NAME = 'dh2qb7atd'; // Ваше cloud name из Cloudinary

function HomePage({ isEditing }) {
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
    console.log('Начинаем загрузку в Cloudinary...');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки в Cloudinary: ' + response.statusText);
      }

      const data = await response.json();
      console.log('Получен ответ от Cloudinary:', data);
      return data.secure_url;
    } catch (error) {
      console.error('Ошибка при загрузке в Cloudinary:', error);
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
        console.error('Ошибка при загрузке логотипа:', error);
        alert('Не удалось загрузить логотип: ' + error.message);
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
        console.error('Ошибка при загрузке изображений:', error);
        alert('Не удалось загрузить изображения: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDescriptionSave = async () => {
    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { description },
          { merge: true }
        );
      } catch (error) {
        console.error('Ошибка при сохранении описания:', error);
        alert('Не удалось сохранить описание: ' + error.message);
      }
    }
  };

  const handleDeleteImage = async (indexToDelete) => {
    try {
      const updatedImages = images.filter((_, index) => index !== indexToDelete);
      setImages(updatedImages);
      await updateDoc(doc(db, "users", user.uid), {
        images: updatedImages,
      });
    } catch (error) {
      console.error('Ошибка при удалении изображения:', error);
      alert('Не удалось удалить изображение: ' + error.message);
    }
  };

  const handleDeleteLogo = async () => {
    try {
      setLogoURL("");
      await updateDoc(doc(db, "users", user.uid), {
        logoURL: "",
      });
    } catch (error) {
      console.error('Ошибка при удалении логотипа:', error);
      alert('Не удалось удалить логотип: ' + error.message);
    }
  };

  return (
    <div className="homepage-container">
      <main className="main-content">
        <header className="header">
          <div className="logo-container">
            {logoURL && (
              <>
                <img
                  src={logoURL}
                  alt="Логотип компании"
                  className="company-logo"
                />
                {isEditing && (
                  <button 
                    className="delete-button"
                    onClick={handleDeleteLogo}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                    Удалить
                  </button>
                )}
              </>
            )}
            {isEditing && (
              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewLogo(e.target.files[0])}
                  disabled={loading}
                />
                <button onClick={handleLogoUpload} disabled={loading}>
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
                      </svg>
                      Загрузить логотип
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="about">
          <h1>О нашей компании</h1>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            disabled={!isEditing || loading}
            placeholder={isEditing ? "Введите описание..." : "Описание отсутствует"}
          />
          {isEditing && (
            <button onClick={handleDescriptionSave} disabled={loading}>
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Сохранение...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                  Сохранить описание
                </>
              )}
            </button>
          )}
        </section>

        <section className="gallery">
          <h2>Наша работа</h2>
          {isEditing && (
            <div className="upload-controls">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files))}
                disabled={loading}
              />
              <button onClick={handleImagesUpload} disabled={loading}>
                {loading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Загрузка...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M19 7v2.99s-1.99.01-2 0V7h-3s.01-1.99 0-2h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z"/>
                    </svg>
                    Загрузить изображения
                  </>
                )}
              </button>
            </div>
          )}
          <div className="images">
            {images.map((src, i) => (
              <div key={i} className="image-container">
                <img src={src} alt={`Наша работа ${i + 1}`} />
                {isEditing && (
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteImage(i)}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                    </svg>
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default HomePage;
