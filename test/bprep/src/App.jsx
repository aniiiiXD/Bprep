import React from 'react';
import axios from 'axios';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Outlet,
  Navigate,
  useNavigate
} from 'react-router-dom';
import {
  User,
  ClipboardList,
  Settings,
  LogOut
} from 'lucide-react';
import Interview from '../src/components/Interview';
import Profile from '../src/components/Proof';
import LoginPage from './pages/LoginPage';

// Layout Component
const Layout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Simple logout - redirect to login
    navigate('https://bprep.vercel.app/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-md fixed left-0 top-0 bottom-0 flex flex-col z-50">
        <div className="p-6 border-b">
          <a href="http://127.0.0.1:3000/frontend/base.html"><h2 className="text-2xl font-bold text-gray-800">BPrep</h2></a>
          
        </div>

        <nav className="flex-1 py-4">
          <Link
            to="/profile"
            className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-100 transition-colors group"
          >
            <User className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            <span className="text-gray-700 group-hover:text-blue-600">Profile</span>
          </Link>

          <Link
            to="/interview"
            className="flex items-center space-x-3 px-6 py-3 hover:bg-gray-100 transition-colors group"
          >
            <ClipboardList className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
            <span className="text-gray-700 group-hover:text-blue-600">Interview Prep</span>
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  );
};

// Main App Component with Routing
const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Layout />}>
          {/* Nested Routes */}
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="interview" element={<Interview />} />


          {/* Add more routes as needed */}
          <Route path="*" element={<Navigate to="/interview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;