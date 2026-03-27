import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DonorDashboard from '../components/DonorDashboard';
import ReceiverDashboard from '../components/ReceiverDashboard';
import DeliveryBoard from './DeliveryBoard';
import FarmerDashboard from '../components/FarmerDashboard';
import Chatbot from '../components/Chatbot';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {user?.role === 'Donor' ? <DonorDashboard /> : user?.role === 'Volunteer' ? <DeliveryBoard /> : user?.role === 'Farmer' ? <FarmerDashboard /> : <ReceiverDashboard />}
      </main>
      <Chatbot />
    </div>
  );
};

export default Dashboard;
