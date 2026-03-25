import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, ArrowRight, Bell, CheckCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import MapComponent from './MapComponent';

const ReceiverDashboard = () => {
  const [foods, setFoods] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Confirmation Modal State
  const [claimingFood, setClaimingFood] = useState(null);

  const fetchMyClaims = async () => {
    try {
      const { data } = await api.get('/food/receiver');
      setMyClaims(data);
    } catch (err) {
      console.error('Failed to fetch claims', err);
    }
  };

  // Setup Socket.io
  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('food_alert', (foodData) => {
      setNotifications(prev => [
        { id: Date.now(), text: `New food added locally: ${foodData.name}` },
        ...prev
      ]);
      
      if (userLocation) {
        fetchNearbyFood(userLocation.lat, userLocation.lng);
      }
    });

    return () => socket.disconnect();
  }, [userLocation]);

  const fetchNearbyFood = async (lat, lng) => {
    try {
      const { data } = await api.get(`/food/nearby?lat=${lat}&lng=${lng}&distance=10000`);
      setFoods(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch nearby food. ' + (err.response?.data?.message || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClaims();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({lat, lng});
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

  const confirmClaim = async () => {
    if (!claimingFood) return;
    try {
      await api.put(`/food/${claimingFood._id}/claim`);
      setFoods(foods.filter(f => f._id !== claimingFood._id));
      await fetchMyClaims();
      setClaimingFood(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim food');
      setClaimingFood(null);
    }
  };

  const handleClaimClick = (food) => {
    setClaimingFood(food);
  };

  const removeNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  
  // Status badge config aligned with AddFood colors
  const statusColors = {
    'Pending': 'bg-orange-100 text-orange-800 border-orange-200',
    'Accepted': 'bg-blue-100 text-blue-800 border-blue-200',
    'Picked': 'bg-green-100 text-green-800 border-green-200',
    'Delivered': 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 text-gray-800 font-sans">
      <div className="lg:col-span-2 space-y-8">
        
        {/* Map Panel */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative z-0 transition-transform duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
              <MapPin className="mr-3 text-green-500 w-7 h-7" />
              Live Discovery Map
            </h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-gray-100">
            <MapComponent foods={foods} userLocation={userLocation} onClaim={(id) => {
              const food = foods.find(f => f._id === id);
              if (food) handleClaimClick(food);
            }} />
          </div>
        </div>

        {/* Nearby Panel */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center mb-8 border-b pb-4 border-gray-100">
             Available Near You ({foods.length})
          </h2>

          {loading ? (
            <div className="text-center py-10">
              <div className="w-10 h-10 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Scanning your coordinates...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto text-center font-medium">{error}</div>
          ) : foods.length === 0 ? (
            <div className="text-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mx-auto mb-4 shadow-sm border border-green-200">
                <MapPin size={32} />
              </div>
              <div className="text-gray-600 mb-2 font-bold text-lg">No surplus food in your vicinity</div>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">We're constantly updating our map. We'll alert you right here as soon as a donor posts locally.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              <AnimatePresence>
                {foods.map(food => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={food._id} 
                    className="border border-gray-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/5 transition-all bg-white group"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                      <div className="mb-4 md:mb-0">
                        <h3 className="font-extrabold text-xl text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{food.name}</h3>
                        <div className="flex items-center text-sm font-medium text-gray-600 mt-2 space-x-5">
                          <span className="flex items-center"><Users size={16} className="mr-2 text-orange-500"/> Provides for {food.quantity}</span>
                          <span className="flex items-center text-red-500 bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                            <Clock size={16} className="mr-2"/> Expires {formatDistanceToNow(new Date(food.expiryTime), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="mt-4 text-sm text-gray-500 flex items-center">
                           Donated by: <strong className="text-gray-800 ml-1">{food.donorId?.name}</strong>
                           {food.donorId?.rating > 0 && <span className="ml-3 px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded-lg flex items-center">★ {food.donorId.rating.toFixed(1)}</span>}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handleClaimClick(food)}
                        className="bg-green-100 text-green-700 hover:bg-green-500 hover:text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-green-500/30 flex items-center w-full md:w-auto justify-center"
                      >
                        Reserve <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* My Claims Panel */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900 flex items-center mb-8 border-b pb-4 border-gray-100">
            My Reservations
          </h2>
          <div className="space-y-6">
            {myClaims.length === 0 ? (
              <p className="text-base text-gray-500 text-center py-6 font-medium">You haven't reserved any items yet.</p>
            ) : (
              myClaims.map(claim => (
                <div key={claim._id} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/50 hover:bg-white transition-colors">
                  <h4 className="font-bold text-lg text-gray-900 mb-3 truncate">{claim.name}</h4>
                  <div className="flex items-center justify-between mb-5">
                    <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm ${statusColors[claim.status] || 'bg-gray-100 border-gray-200 text-gray-800 border'}`}>
                      {claim.status}
                    </span>
                    <span className="text-gray-500 text-sm font-medium">
                       Donor: <span className="text-gray-800">{claim.donorId?.name || 'Unknown'}</span>
                    </span>
                  </div>
                  
                  {/* Premium Timeline Progress UI */}
                  <div className="pt-4 border-t border-gray-200/80">
                    <div className="flex justify-between items-center text-xs font-bold tracking-wide uppercase">
                      <span className={['Pending', 'Accepted', 'Picked', 'Delivered'].includes(claim.status) ? 'text-orange-600' : 'text-gray-400'}>Pending</span>
                      <span className="flex-1 mx-2 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full bg-orange-400 transition-all duration-700 ${['Accepted', 'Picked', 'Delivered'].includes(claim.status) ? 'w-full' : 'w-0'}`}></div></span>
                      <span className={['Accepted', 'Picked', 'Delivered'].includes(claim.status) ? 'text-blue-600' : 'text-gray-400'}>Accepted</span>
                      <span className="flex-1 mx-2 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full bg-blue-500 transition-all duration-700 ${['Picked', 'Delivered'].includes(claim.status) ? 'w-full' : 'w-0'}`}></div></span>
                      <span className={['Picked', 'Delivered'].includes(claim.status) ? 'text-green-600' : 'text-gray-400'}>Picked</span>
                      <span className="flex-1 mx-2 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full bg-green-500 transition-all duration-700 ${['Delivered'].includes(claim.status) ? 'w-full' : 'w-0'}`}></div></span>
                      <span className={claim.status === 'Delivered' ? 'text-gray-800' : 'text-gray-400'}>Delivered</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Notifications */}
      <div className="lg:col-span-1 hidden lg:block">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24 transition-transform duration-300 hover:-translate-y-1">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center">
            <Bell className="mr-2" size={18} />
            Live Alerts
          </h2>
          
          <div className="space-y-4">
            <AnimatePresence>
              {notifications.length === 0 ? (
                <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm text-gray-500 font-medium">Monitoring your local radius...</motion.p>
              ) : (
                notifications.map(note => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={note.id} 
                    className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-xl flex justify-between items-start shadow-sm"
                  >
                    <p className="text-sm font-bold text-orange-900">{note.text}</p>
                    <button 
                      onClick={() => removeNotification(note.id)}
                      className="text-orange-400 hover:text-orange-700 transition-colors ml-3"
                    >
                      ×
                    </button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Confirmation Modal aligned with AddFood styling */}
      <AnimatePresence>
        {claimingFood && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-white/20"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 mx-auto shadow-sm border border-green-200">
                <CheckCircle size={32} />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Confirm Reservation</h3>
              <p className="text-gray-600 mb-6 text-center">
                You are about to lock in: <br/><strong className="text-gray-900 text-lg">{claimingFood.name}</strong>
              </p>
              
              <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl mb-8 text-sm text-orange-800">
                <p className="font-bold mb-2 flex items-center"><Info size={16} className="mr-2"/> By reserving this, you agree to:</p>
                <ul className="list-disc pl-7 space-y-1.5 font-medium">
                  <li>Pick it up promptly once the donor accepts.</li>
                  <li>Ensure it is consumed before expiry.</li>
                  <li>Notify the donor immediately of any delays.</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setClaimingFood(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-colors"
                  disabled={loading}
                >
                  Go Back
                </button>
                <button 
                  onClick={confirmClaim}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all active:scale-95"
                  disabled={loading}
                >
                  Yes, Claim it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReceiverDashboard;
