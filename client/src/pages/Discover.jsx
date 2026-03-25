import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, List, Filter, Clock, Users, ArrowRight, CheckCircle, Search, Leaf, Flame, Image as ImageIcon, Map as MapIcon, X, ArrowLeft } from 'lucide-react';
import api from '../api/axios';

// Map setup
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({
  iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// Distance Helper (Haversine Formula) in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const p = 0.017453292519943295;
  const c = Math.cos;
  const a = 0.5 - c((lat2 - lat1) * p)/2 + c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a));
};

const Discover = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [foods, setFoods] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    distance: 100, // 100km default for testing
    type: 'all', // 'all', 'veg', 'non-veg'
    urgentOnly: false // false or true
  });
  
  // Modal Claim State
  const [claimingFood, setClaimingFood] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({lat, lng});
          fetchFood(lat, lng, filters);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  const fetchFood = async (lat, lng, currentFilters) => {
    setLoading(true);
    try {
      const distanceMeters = currentFilters.distance * 1000;
      let url = `/food/nearby?lat=${lat}&lng=${lng}&distance=${distanceMeters}`;
      if (currentFilters.type !== 'all') url += `&type=${currentFilters.type}`;
      
      const { data } = await api.get(url);
      setFoods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters) => {
    setFilters(newFilters);
    if (userLocation) {
      fetchFood(userLocation.lat, userLocation.lng, newFilters);
    }
    setShowFilters(false);
  };

  const confirmClaim = async () => {
    if (!claimingFood) return;
    try {
      await api.put(`/food/${claimingFood._id}/claim`);
      setFoods(foods.filter(f => f._id !== claimingFood._id));
      setClaimingFood(null);
      // Optional: global toast or redirect
      alert('Food successfully reserved!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to claim food');
      setClaimingFood(null);
    }
  };

  const getTimeRemaining = (expiryTime) => {
    const total = Date.parse(expiryTime) - Date.parse(new Date());
    const hours = Math.floor((total / (1000 * 60 * 60)));
    const minutes = Math.floor((total / 1000 / 60) % 60);
    return { total, hours, minutes };
  };

  // Processed foods based on urgency filter and distance calc
  const processedFoods = useMemo(() => {
    let result = foods.map(food => {
      const t = getTimeRemaining(food.expiryTime);
      const isUrgent = t.total > 0 && t.hours < 2;
      const dist = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, food.location.coordinates[1], food.location.coordinates[0]).toFixed(1) : '?';
      return { ...food, isUrgent, dist, timeRemaining: t };
    });

    if (filters.urgentOnly) {
      result = result.filter(f => f.isUrgent);
    }
    
    return result;
  }, [foods, filters.urgentOnly, userLocation]);

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col bg-gray-50 relative overflow-hidden">
      {/* Top Header Controls */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 flex justify-between items-center shadow-sm z-30 relative">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-gray-500 hover:text-green-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-xl border border-gray-100"
            title="Back to Dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900 flex items-center hidden sm:flex">
            <MapIcon className="mr-2 text-green-500" /> Discover Food
          </h1>
        </div>
        
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-xl flex items-center">
            <button 
              onClick={() => setViewMode('map')} 
              className={`p-2 rounded-lg flex items-center text-sm font-semibold transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <MapPin size={16} className="mr-1" /> Map
            </button>
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-lg flex items-center text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-800'}`}
            >
              <List size={16} className="mr-1" /> List
            </button>
          </div>
          
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2 px-4 rounded-xl flex items-center text-sm font-bold transition-colors ${showFilters || filters.type !== 'all' || filters.urgentOnly || filters.distance !== 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            <Filter size={16} className="mr-1" /> Filters
          </button>
        </div>
      </div>

      {/* Floating Filter Overlay */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-16 right-4 z-40 bg-white p-6 rounded-3xl shadow-xl border border-gray-100 w-80"
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-2">
              <h3 className="font-bold text-gray-900">Search Filters</h3>
              <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-red-500"><X size={18}/></button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Food Type</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['all', 'veg', 'non-veg'].map(t => (
                    <button key={t} onClick={() => applyFilters({...filters, type: t})} className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${filters.type === t ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>{t}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 flex justify-between">
                  <span>Max Distance</span>
                  <span className="text-green-600">{filters.distance} km</span>
                </label>
                <input 
                  type="range" min="1" max="10000" step="50" value={filters.distance} 
                  onChange={(e) => setFilters({...filters, distance: Number(e.target.value)})}
                  onMouseUp={(e) => applyFilters({...filters, distance: Number(e.target.value)})}
                  className="w-full accent-green-500"
                />
              </div>

              <div>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" checked={filters.urgentOnly} onChange={(e) => applyFilters({...filters, urgentOnly: e.target.checked})} className="rounded text-green-500 focus:ring-green-500 mr-3 w-5 h-5 accent-green-500"/>
                  <span className="text-sm font-semibold text-gray-700">Urgent Only (Expires &lt; 2 hrs)</span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 w-full h-full">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-bold">Scanning area for food...</p>
          </div>
        ) : null}

        {/* Map View */}
        {viewMode === 'map' && (
          <div className="w-full h-full">
            <MapContainer center={userLocation || [20.5937, 78.9629]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 10 }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
              {userLocation && <MapUpdater center={userLocation} />}
              
              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup className="font-bold text-center">Your Location</Popup>
                </Marker>
              )}

              {processedFoods.map((food) => (
                <Marker 
                  key={food._id}
                  position={[food.location.coordinates[1], food.location.coordinates[0]]}
                  icon={food.isUrgent ? redIcon : greenIcon}
                >
                  <Popup>
                    <div className="min-w-[200px] p-1 font-sans">
                      {food.imageUrl && (
                        <div className="w-full h-24 mb-2 rounded-lg overflow-hidden relative">
                          <img src={food.imageUrl} className="w-full h-full object-cover" alt={food.name} />
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-extrabold text-gray-900 border-b pb-1 truncate block max-w-[150px]">{food.name}</h3>
                         <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${food.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}>{food.type === 'veg' ? 'Veg' : 'Non-Veg'}</span>
                      </div>
                      
                      <p className="text-xs mb-1.5 flex justify-between"><span className="text-gray-500">Distance:</span> <strong className="text-gray-800">{food.dist} km</strong></p>
                      <p className="text-xs mb-1.5 flex justify-between"><span className="text-gray-500">Serves:</span> <strong className="text-gray-800">{food.quantity} people</strong></p>
                      <p className={`text-xs mb-3 flex justify-between font-bold ${food.isUrgent ? 'text-red-500' : 'text-orange-500'}`}>
                        <span>Expires in:</span> 
                        <span>{food.timeRemaining.hours}h {food.timeRemaining.minutes}m</span>
                      </p>
                      
                      <button onClick={() => setClaimingFood(food)} className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-2 rounded-lg shadow-md shadow-green-500/20 active:scale-95 transition-all">
                        Claim Food
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* List View */}
        <div className={`w-full h-full bg-gray-50 overflow-y-auto p-4 sm:p-6 lg:p-8 ${viewMode === 'list' ? 'block' : 'hidden'}`}>
          <div className="max-w-5xl mx-auto">
            {processedFoods.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm mt-10">
                <MapPin size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No food found in this area</h3>
                <p className="text-gray-500">Try expanding your distance filter or changing food types.</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {processedFoods.map(food => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                    key={food._id} 
                    className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    {/* Image handling */}
                    <div className="h-40 bg-gray-100 relative group-hover:scale-105 transition-transform duration-500">
                      {food.imageUrl ? (
                        <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      {/* Urgency Badge */}
                      {food.isUrgent && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center shadow-red-500/30">
                          <Flame size={12} className="mr-1"/> Expiring Soon
                        </div>
                      )}
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3 flex items-center shadow-lg">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm flex items-center ${food.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}>
                          {food.type === 'veg' ? <Leaf size={12} className="mr-1" /> : <Flame size={12} className="mr-1"/>}
                          {food.type === 'veg' ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 relative bg-white z-10">
                      <h3 className="font-extrabold text-xl text-gray-900 mb-4 truncate group-hover:text-green-500 transition-colors">{food.name}</h3>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center"><MapPin size={16} className="mr-2 text-green-500"/> Distance</span>
                          <span className="font-bold text-gray-800">{food.dist} km</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center"><Users size={16} className="mr-2 text-orange-400"/> Serves</span>
                          <span className="font-bold text-gray-800">{food.quantity} people</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center"><Clock size={16} className="mr-2 text-gray-400"/> Time left</span>
                          <span className={`font-bold pl-2 py-1 rounded-md ${food.isUrgent ? 'text-red-500' : 'text-orange-500'}`}>
                            {food.timeRemaining.hours}h {food.timeRemaining.minutes}m
                          </span>
                        </div>
                      </div>
                      
                      <button onClick={() => setClaimingFood(food)} className="w-full bg-green-50 hover:bg-green-500 text-green-600 hover:text-white border border-green-100 py-3 rounded-xl font-bold transition-all flex justify-center items-center shadow-sm hover:shadow-green-500/20 active:scale-95">
                        Claim Food <ArrowRight size={18} className="ml-2"/>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {claimingFood && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 border border-white/20 relative"
            >
              <button 
                onClick={() => setClaimingFood(null)} 
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-6 mx-auto shadow-sm border border-green-200">
                <CheckCircle size={32} />
              </div>
              
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">Confirm Reservation</h3>
              <p className="text-gray-600 mb-6 text-center">
                You are reserving: <br/><strong className="text-gray-900 text-lg">{claimingFood.name}</strong>
              </p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setClaimingFood(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmClaim}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all active:scale-95"
                >
                  Confirm Claim
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Discover;
