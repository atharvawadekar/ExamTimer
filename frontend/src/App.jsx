import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import MainLayout from './components/MainLayout';

function AppContent() {
  return <MainLayout />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
