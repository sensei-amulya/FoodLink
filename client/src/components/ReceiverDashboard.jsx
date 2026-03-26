import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, ArrowRight, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import api from '../api/axios';
import MapComponent from './MapComponent';

const ReceiverDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Setup Socket.io
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('food_alert', (foodData) => {
      // Add notification
      setNotifications(prev => [
        { id: Date.now(), text: `New food added nearby: ${foodData.name}` },
        ...prev
      ]);
      
      // Auto refresh list
      if (userLocation) {
        fetchNearbyFood(userLocation.lat, userLocation.lng);
      }
    });

    return () => socket.disconnect();
  }, [userLocation]);

  const fetchNearbyFood = async (lat, lng) => {
    try {
      const { data } = await api.get(`/food/nearby?lat=${lat}&lng=${lng}&distance=10000`); // 10km search
      setFoods(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch nearby food. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);
          fetchNearbyFood(lat, lng);
        },
        (err) => {
          setError('Location access denied. Please enable location to find nearby food.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  }, []);

  const handleClaim = async (id) => {
    try {
      await api.put(`/food/${id}/claim`);
      // Remove from list
      setFoods(foods.filter(f => f._id !== id));
      alert('Food claimed successfully! Please pick it up before it expires.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim food');
    }
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative z-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MapPin className="mr-2 text-purple-600" />
              Live Food Map
            </h2>
          </div>
          <MapComponent foods={foods} userLocation={userLocation} onClaim={handleClaim} />
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
             Nearby Available Food ({foods.length})
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Scanning for nearby food...</div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
          ) : foods.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-gray-400 mb-2 font-medium">No food listings nearby</div>
              <p className="text-sm text-gray-500">We'll notify you as soon as someone donates food in your area.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {foods.map(food => (
                <div key={food._id} className="border border-gray-100 rounded-lg p-5 hover:border-purple-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{food.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1 space-x-4">
                        <span className="flex items-center"><Users size={14} className="mr-1"/> Serves {food.quantity}</span>
                        <span className="flex items-center text-red-500"><Clock size={14} className="mr-1"/> Expires {formatDistanceToNow(new Date(food.expiryTime), { addSuffix: true })}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 flex items-center">
                         Donor: <span className="font-medium text-gray-700 ml-1">{food.donorId?.name}</span>
                         {food.donorId?.rating > 0 && <span className="ml-2 text-yellow-500">★ {food.donorId.rating.toFixed(1)}</span>}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleClaim(food._id)}
                      className="bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center group cursor-pointer"
                    >
                      Claim <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6">
          <h2 className="text-lg font-bold text-gray-900 flex items-center mb-4">
            <Bell className="mr-2 text-purple-600" />
            Live Alerts
          </h2>
          
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Waiting for new donations...</p>
            ) : (
              notifications.map(note => (
                <div key={note.id} className="bg-purple-50 border border-purple-100 p-3 rounded-lg flex justify-between items-start animate-fade-in">
                  <p className="text-sm font-medium text-purple-900">{note.text}</p>
                  <button 
                    onClick={() => removeNotification(note.id)}
                    className="text-purple-400 hover:text-purple-700"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
