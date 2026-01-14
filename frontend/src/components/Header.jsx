import { useAuth } from '../context/AuthContext';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <h2 className="app-title">ExamTimer</h2>

        <div className="user-section">
          {user ? (
            <>
              <img
                src={user?.profilePicture}
                alt={user?.name}
                className="profile-pic"
              />
              <span className="user-name">{user?.name}</span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <button onClick={handleGoogleLogin} className="logout-btn">
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
