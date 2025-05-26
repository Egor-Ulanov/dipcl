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
        console.log('Загружаем логотип...');
        
        // Загружаем в Cloudinary
        const url = await uploadToCloudinary(newLogo);
        console.log('Логотип загружен, URL:', url);
        
        // Сохраняем URL в Firebase
        setLogoURL(url);
        await updateDoc(doc(db, "users", user.uid), {
          logoURL: url,
        });
        
        console.log('URL логотипа сохранен в Firebase');
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
        console.log('Загружаем изображения...');
        
        // Загружаем все изображения в Cloudinary
        const uploadPromises = Array.from(newImages).map(uploadToCloudinary);
        const urls = await Promise.all(uploadPromises);
        console.log('Изображения загружены, URLs:', urls);
        
        // Сохраняем URLs в Firebase
        const updatedImages = [...images, ...urls];
        setImages(updatedImages);
        await updateDoc(doc(db, "users", user.uid), {
          images: updatedImages,
        });
        
        console.log('URLs изображений сохранены в Firebase');
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
        console.log('Сохраняем описание...');
        await setDoc(
          doc(db, "users", user.uid),
          { description },
          { merge: true }
        );
        console.log('Описание сохранено');
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
                    Удалить логотип
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
                  {loading ? 'Загрузка...' : 'Загрузить логотип'}
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="about">
          <h1>О нашей кампании</h1>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            disabled={!isEditing || loading}
            placeholder={isEditing ? "Введите описание..." : "Описание отсутствует"}
          />
          {isEditing && (
            <button onClick={handleDescriptionSave} disabled={loading}>
              Сохранить описание
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
                {loading ? 'Загрузка...' : 'Загрузить изображения'}
              </button>
            </div>
          )}
          <div className="images">
            {images.map((src, i) => (
              <div key={i} className="image-container">
                <img src={src} alt={`promo${i}`} />
                {isEditing && (
                  <button 
                    className="delete-button"
                    onClick={() => handleDeleteImage(i)}
                  >
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
