import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Utensils, Map, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Utensils className="h-8 w-8 text-purple-600" />
            <span className="ml-2 text-xl font-bold tracking-tight text-gray-900">FoodLink</span>
          </div>
          <div className="flex items-center space-x-6">
            <a onClick={() => navigate('/dashboard')} className="flex items-center cursor-pointer text-gray-600 hover:text-green-500 font-medium transition-colors">
              <Home size={18} className="mr-1" />
              Dashboard
            </a>
            {user?.role === 'Receiver' && (
              <a onClick={() => navigate('/discover')} className="flex items-center cursor-pointer text-gray-600 hover:text-green-500 font-medium transition-colors">
                <Map size={18} className="mr-1" />
                Live Map
              </a>
            )}
            <span className="text-sm font-medium text-gray-700 hidden sm:block border-l pl-6 border-gray-200">
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center p-2 border border-transparent rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
