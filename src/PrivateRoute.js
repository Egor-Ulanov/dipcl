import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, user }) {
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!user) {
    return <Navigate to="/" />;
  }

  // Если авторизован, показываем запрошенную страницу
  return children;
}

export default PrivateRoute; 