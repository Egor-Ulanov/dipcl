import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import './styleRegisterGroup.css';

function RegisterGroup({ user }) {
  const [groupId, setGroupId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' или 'error'

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!user?.email) {
      setMessage('Ошибка: вы не авторизованы.');
      setMessageType('error');
      return;
    }

    if (!groupId.trim() || !groupTitle.trim()) {
      setMessage('Пожалуйста, заполните все поля.');
      setMessageType('error');
      return;
    }

    try {
      await setDoc(doc(db, 'groups', groupId.trim()), {
        info: {
          title: groupTitle.trim(),
          admin_email: user.email,
          created_at: new Date(),
        },
      });
      setMessage('Группа успешно зарегистрирована!');
      setMessageType('success');
      setGroupId('');
      setGroupTitle('');
      console.log('Зарегистрировано:', groupId, groupTitle);
    } catch (error) {
      console.error('Ошибка при записи в Firestore:', error);
      setMessage('Не удалось зарегистрировать группу. Попробуйте еще раз.');
      setMessageType('error');
    }
  };

  return (
    <div className="register-group-container">
      <div className="register-group-card">
        <div className="register-group-header">
          <svg className="telegram-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.2647 2.42778C21.98 2.19091 21.6364 2.03567 21.2704 1.97858C20.9044 1.92149 20.5298 1.96469 20.1866 2.10357L2.26566 9.33557C1.88241 9.49496 1.55618 9.76841 1.32806 10.1203C1.09994 10.4722 0.98077 10.8869 0.98077 11.3116C0.98077 11.7362 1.09994 12.1509 1.32806 12.5028C1.55618 12.8547 1.88241 13.1282 2.26566 13.2876L6.93266 15.2036L8.76966 20.6036C8.81977 20.7436 8.89394 20.8734 8.98866 20.9876C9.0797 21.0997 9.18957 21.1936 9.31266 21.2656C9.46992 21.3608 9.64481 21.4215 9.82566 21.4436C9.9797 21.4617 10.1358 21.4452 10.2827 21.3952C10.4295 21.3452 10.5631 21.2631 10.6727 21.1556L13.6187 18.2096L17.8727 21.6036C18.2084 21.8699 18.6179 22.0136 19.0396 22.0136C19.4614 22.0136 19.8709 21.8699 20.2067 21.6036C20.5309 21.3456 20.7652 20.9959 20.8806 20.6016L23.8806 3.48157C23.9696 3.12467 23.9464 2.75099 23.814 2.40729C23.6816 2.06358 23.4456 1.76414 23.1346 1.54757L22.2647 2.42778ZM19.0396 20.0136L14.2646 16.1796L11.9996 18.4436V16.4436L18.7576 9.68557L8.74766 14.3836L4.67166 12.6916L20.9037 6.08957L19.0396 20.0136Z" fill="currentColor"/>
          </svg>
          <h2>Регистрация группы Telegram</h2>
        </div>
        
        <div className="register-group-content">
          <p className="register-group-description">
            Для подключения вашей группы Telegram к системе проверки сообщений, пожалуйста, 
            введите ID группы и её название. ID группы можно получить, добавив бота в группу 
            и отправив команду /start.
          </p>

          <form onSubmit={handleRegister} className="register-group-form">
            <div className="form-group">
              <label htmlFor="groupId">ID группы (chat.id)</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                </svg>
                <input
                  id="groupId"
                  type="text"
                  placeholder="Например: -1001234567890"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="groupTitle">Название группы</label>
              <div className="input-with-icon">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 15.5C9.67 15.5 7.69 14.05 6.89 12H17.11C16.31 14.05 14.33 15.5 12 15.5Z" fill="currentColor"/>
                </svg>
                <input
                  id="groupTitle"
                  type="text"
                  placeholder="Введите название группы"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="register-button">
              <svg className="button-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
              </svg>
              Зарегистрировать группу
            </button>
          </form>

          {message && (
            <div className={`message ${messageType}`}>
              <svg className="message-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {messageType === 'success' ? (
                  <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
                ) : (
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                )}
              </svg>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterGroup;
