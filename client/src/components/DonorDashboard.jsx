import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, MapPin, Clock, Info, CheckCircle, Mail, User, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const DonorDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonorListings = async () => {
      try {
        const { data } = await api.get('/food/donor');
        setListings(data);
      } catch (error) {
        console.error('Error fetching donor listings', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonorListings();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/food/${id}/status`, { status: newStatus });
      setListings(listings.map(item => item._id === id ? { ...item, status: newStatus, receiverId: newStatus === 'Available' ? null : item.receiverId } : item));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const statusColors = {
    'Available': 'bg-green-100 text-green-700 border-green-200 shadow-sm',
    'Pending': 'bg-orange-100 text-orange-800 border-orange-200 shadow-sm',
    'Accepted': 'bg-blue-100 text-blue-800 border-blue-200 shadow-sm',
    'Picked': 'bg-green-100 text-green-800 border-green-200 shadow-sm',
    'Delivered': 'bg-gray-100 text-gray-600 border-gray-200 shadow-none'
  };

  return (
    <div className="space-y-8 text-gray-800 font-sans max-w-6xl mx-auto">
      
      {/* Header Panel */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 gap-6 transition-transform duration-300 hover:-translate-y-1"
      >
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center mb-2">
            <Package className="mr-4 text-green-500 w-8 h-8" />
            Your Impact
          </h2>
          <p className="text-gray-500 font-medium text-lg">Manage your donations and oversee requests from the community.</p>
        </div>
        <Link 
          to="/add-food"
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all flex items-center whitespace-nowrap active:scale-95"
        >
          <Plus className="mr-2" size={20} />
          Donate Food
        </Link>
      </motion.div>

      {/* Listings Panel */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-transform duration-300 hover:-translate-y-1">
        <h3 className="text-2xl font-extrabold text-gray-900 mb-8 border-b pb-4 border-gray-100">Live Donations</h3>
        
        {loading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-500 font-medium">Loading your legacy of contributions...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
              <Package className="text-green-400 w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-gray-800 mb-2">No active listings yet</h4>
            <p className="text-gray-500 max-w-md mx-auto mb-8 font-medium">You haven't posted any food recently. When you do, they will appear here to manage and track.</p>
            <Link 
              to="/add-food"
              className="text-green-600 font-bold bg-green-50 px-8 py-3.5 rounded-xl border border-green-100 hover:bg-green-100 transition-colors inline-block"
            >
              Create your first listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            <AnimatePresence>
              {listings.map((item) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={item._id} 
                  className="border border-gray-200 rounded-3xl p-6 md:p-8 transition-all hover:shadow-lg hover:border-green-200 bg-white group"
                >
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                      <h4 className="text-2xl font-extrabold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">{item.name}</h4>
                      <p className="text-sm font-medium text-gray-500 flex items-center">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        Posted on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className={`px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center ${statusColors[item.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                        {item.status === 'Available' ? <Info size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                        {item.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Premium Timeline Progress UI */}
                  {['Pending', 'Accepted', 'Picked', 'Delivered'].includes(item.status) && (
                    <div className="pt-2 mb-6 border-b border-gray-100 pb-6">
                      <div className="flex justify-between items-center text-xs font-bold tracking-wide uppercase text-gray-400">
                        <span className={['Pending', 'Accepted', 'Picked', 'Delivered'].includes(item.status) ? 'text-orange-600' : ''}>Pending</span>
                        <span className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-orange-400 transition-all duration-700 ${['Accepted', 'Picked', 'Delivered'].includes(item.status) ? 'w-full' : 'w-0'}`}></div></span>
                        <span className={['Accepted', 'Picked', 'Delivered'].includes(item.status) ? 'text-blue-600' : ''}>Accepted</span>
                        <span className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-blue-500 transition-all duration-700 ${['Picked', 'Delivered'].includes(item.status) ? 'w-full' : 'w-0'}`}></div></span>
                        <span className={['Picked', 'Delivered'].includes(item.status) ? 'text-green-600' : ''}>Picked</span>
                        <span className="flex-1 mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-green-500 transition-all duration-700 ${['Delivered'].includes(item.status) ? 'w-full' : 'w-0'}`}></div></span>
                        <span className={item.status === 'Delivered' ? 'text-gray-800' : ''}>Delivered</span>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                    <div className="space-y-4 text-sm font-medium text-gray-600">
                      <p className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <strong className="text-gray-800 mr-2 flex items-center"><User size={16} className="mr-2 text-green-500"/> Quantity:</strong> Provides for {item.quantity} people
                      </p>
                      <p className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <strong className="text-gray-800 mr-2 flex items-center whitespace-nowrap"><Clock size={16} className="mr-2 text-red-500"/> Expiry:</strong> 
                        <span className={new Date(item.expiryTime) < new Date() ? 'text-red-500 font-bold ml-1' : 'ml-1'}>
                          {new Date(item.expiryTime).toLocaleString()}
                          {new Date(item.expiryTime) < new Date() && item.status === 'Available' ? ' (Expired)' : ''}
                        </span>
                      </p>
                    </div>
                    
                    {item.status !== 'Available' && item.receiverId && (
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <h5 className="font-extrabold text-gray-900 flex items-center mb-3">
                          <CheckCircle size={18} className="mr-2 text-green-500" /> Requested By
                        </h5>
                        <p className="text-gray-800 mb-2 font-bold text-lg">{item.receiverId.name}</p>
                        <p className="text-gray-500 flex items-center mb-5 font-medium">
                          <Mail size={16} className="mr-2 text-gray-400" /> 
                          <a href={`mailto:${item.receiverId.email}`} className="text-green-500 hover:text-green-600 hover:underline">
                            {item.receiverId.email}
                          </a>
                        </p>
                        
                        {/* Action Buttons based on status */}
                        {item.status === 'Pending' && (
                          <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button onClick={() => handleStatusUpdate(item._id, 'Available')} className="w-1/3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-3 rounded-xl font-bold transition-colors border border-red-100">Reject</button>
                            <button onClick={() => handleStatusUpdate(item._id, 'Accepted')} className="w-2/3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-green-500/20 active:scale-95">Accept Request</button>
                          </div>
                        )}
                        {item.status === 'Accepted' && (
                          <div className="pt-4 border-t border-gray-100">
                            <button onClick={() => handleStatusUpdate(item._id, 'Picked')} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex justify-center items-center active:scale-95">
                              Mark as Picked Up <CheckCircle size={18} className="ml-2"/>
                            </button>
                          </div>
                        )}
                        {item.status === 'Picked' && (
                          <div className="pt-4 border-t border-gray-100">
                            <button onClick={() => handleStatusUpdate(item._id, 'Delivered')} className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-green-500/20 flex justify-center items-center active:scale-95">
                              Mark as Finalized <CheckCircle size={18} className="ml-2"/>
                            </button>
                          </div>
                        )}
                        {item.status === 'Delivered' && (
                          <div className="pt-4 border-t border-gray-100 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
                            Transaction Completed
                          </div>
                        )}
                      </div>
                    )}
                    {item.status === 'Available' && (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500">
                        <Users size={32} className="text-gray-300 mb-2"/>
                        <span className="font-bold">Awaiting Requests</span>
                        <span className="text-xs mt-1 text-center">Your listing is active on the map</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
