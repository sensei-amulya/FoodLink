import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Plus, MapPin, Clock, Info, CheckCircle, Mail, User, Users, Edit, Trash2, XCircle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';

const DonorDashboard = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [editingFood, setEditingFood] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', quantity: 1, type: 'veg', expiryTime: '' });

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
      // Re-fetch fresh data so populated receiverId/farmerId objects are always current
      const { data } = await api.get('/food/donor');
      setListings(data);
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      try {
        await api.delete(`/food/${id}`);
        setListings(listings.filter(item => item._id !== id));
      } catch (error) {
        console.error('Failed to delete food', error);
        alert('Failed to delete food. ' + (error.response?.data?.message || ''));
      }
    }
  };

  const handleEditClick = (item) => {
    setEditingFood(item._id);
    setEditFormData({
      name: item.name,
      quantity: item.quantity,
      type: item.type,
      expiryTime: item.expiryTime ? new Date(item.expiryTime).toISOString().slice(0, 16) : ''
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/food/${editingFood}`, editFormData);
      setListings(listings.map(item => item._id === editingFood ? { ...item, ...data } : item));
      setEditingFood(null);
    } catch (error) {
      console.error('Failed to update food', error);
      alert('Failed to update food. ' + (error.response?.data?.message || ''));
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
        <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8 border-b pb-4 border-gray-100 gap-4">
          <h3 className="text-2xl font-extrabold text-gray-900">Live Donations</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {['All', 'Available', 'Pending', 'Accepted', 'Picked', 'Delivered'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === status ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

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
              {(filterStatus === 'All' ? listings : listings.filter(item => item.status === filterStatus)).length === 0 ? (
                <p className="text-gray-500 text-center py-4 font-medium">No results found for status: {filterStatus}</p>
              ) : (
                (filterStatus === 'All' ? listings : listings.filter(item => item.status === filterStatus)).map((item) => (
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
                      <div className="flex items-center gap-4">
                        {item.status === 'Available' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleEditClick(item)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                              <Edit size={18} />
                            </button>
                            <button onClick={async () => {
                              if (window.confirm('Are you sure you want to mark this as expired and send to compost?')) {
                                try { await api.patch(`/food/mark-expired/${item._id}`); window.location.reload(); } catch (e) { alert('Failed to expire'); }
                              }
                            }} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Expire for Compost">
                              <Leaf size={18} />
                            </button>
                            <button onClick={() => handleDelete(item._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        )}
                        <span className={`px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center ${statusColors[item.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {item.status === 'Available' ? <Info size={16} className="mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Premium Timeline Progress UI */}
                    {['Accepted', 'Picked', 'Delivered', 'Completed'].includes(item.status) || item.status === 'Pending' ? (
                      <div className="pt-2 mb-6 border-b border-gray-100 pb-6">
                        <div className="flex justify-between items-center text-[10px] md:text-xs font-bold tracking-wide uppercase text-gray-400">
                          <span className={item.status !== 'Available' ? 'text-orange-600' : ''}>Requested</span>
                          <span className="flex-1 mx-1 md:mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-orange-400 transition-all duration-700 ${['accepted', 'picked', 'delivered', 'completed'].includes(item.deliveryStatus) ? 'w-full' : 'w-0'}`}></div></span>
                          <span className={['accepted', 'picked', 'delivered', 'completed'].includes(item.deliveryStatus) ? 'text-blue-600' : ''}>Assigned</span>
                          <span className="flex-1 mx-1 md:mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-blue-500 transition-all duration-700 ${['picked', 'delivered', 'completed'].includes(item.deliveryStatus) ? 'w-full' : 'w-0'}`}></div></span>
                          <span className={['picked', 'delivered', 'completed'].includes(item.deliveryStatus) ? 'text-indigo-600' : ''}>Picked</span>
                          <span className="flex-1 mx-1 md:mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-indigo-500 transition-all duration-700 ${['delivered', 'completed'].includes(item.deliveryStatus) ? 'w-full' : 'w-0'}`}></div></span>
                          <span className={['delivered', 'completed'].includes(item.deliveryStatus) ? 'text-green-600' : ''}>Delivered</span>
                          <span className="flex-1 mx-1 md:mx-2 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full bg-green-500 transition-all duration-700 ${item.deliveryStatus === 'completed' ? 'w-full' : 'w-0'}`}></div></span>
                          <span className={item.deliveryStatus === 'completed' ? 'text-gray-800' : ''}>Completed</span>
                        </div>
                      </div>
                    ) : null}

                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="space-y-4 text-sm font-medium text-gray-600">
                        <p className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <strong className="text-gray-800 mr-2 flex items-center"><User size={16} className="mr-2 text-green-500" /> Quantity:</strong> Provides for {item.quantity} people
                        </p>
                        <p className="flex items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                          <strong className="text-gray-800 mr-2 flex items-center whitespace-nowrap"><Clock size={16} className="mr-2 text-red-500" /> Expiry:</strong>
                          <span className={new Date(item.expiryTime) < new Date() ? 'text-red-500 font-bold ml-1' : 'ml-1'}>
                            {new Date(item.expiryTime).toLocaleString()}
                            {new Date(item.expiryTime) < new Date() && item.status === 'Available' ? ' (Expired)' : ''}
                          </span>
                        </p>
                      </div>

                      {item.status !== 'Available' && (item.receiverId || item.farmerId) && (
                        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <h5 className="font-extrabold text-gray-900 flex items-center mb-3">
                            <CheckCircle size={18} className="mr-2 text-green-500" /> Requested By
                          </h5>
                          <p className="text-gray-800 mb-2 font-bold text-lg">{(item.receiverId || item.farmerId).name}</p>
                          <p className="text-gray-500 flex items-center mb-5 font-medium">
                            <Mail size={16} className="mr-2 text-gray-400" />
                            <a href={`mailto:${(item.receiverId || item.farmerId).email}`} className="text-green-500 hover:text-green-600 hover:underline">
                              {(item.receiverId || item.farmerId).email}
                            </a>
                          </p>

                          {item.deliveryStatus && item.deliveryStatus !== 'pending' && (
                            <div className="mt-4 mb-5 bg-gray-50 p-4 rounded-2xl border border-gray-200 shadow-sm">
                              <h6 className="font-extrabold text-xs text-gray-500 mb-2 uppercase tracking-widest">Driver Details</h6>
                              <p className="text-base text-gray-900 font-bold">{item.volunteerName}</p>
                              <p className="text-sm font-bold text-gray-700 mt-1 mb-4 flex items-center">
                                📞 {item.volunteerPhone}
                              </p>
                              <span className={`px-3 py-1.5 text-xs font-extrabold tracking-widest uppercase rounded-lg ${item.deliveryStatus === 'completed' ? 'bg-green-100 text-green-700 border-green-200 shadow-sm' : 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'}`}>
                                {item.deliveryStatus === 'completed' ? 'COMPLETED' : 'VOLUNTEER ASSIGNED'}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons based on status */}
                          {item.status === 'Pending' && (
                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                              <button onClick={() => handleStatusUpdate(item._id, 'Available')} className="w-1/3 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-3 rounded-xl font-bold transition-colors border border-red-100">Reject</button>
                              <button onClick={() => handleStatusUpdate(item._id, 'Accepted')} className="w-2/3 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-all shadow-md shadow-green-500/20 active:scale-95">Accept Request</button>
                            </div>
                          )}
                          {(item.status === 'Accepted' || item.status === 'Expired') && item.deliveryStatus === 'accepted' && (
                            <div className="pt-4 border-t border-gray-100">
                              <button onClick={async () => { await api.patch(`/food/mark-picked/${item._id}`); window.location.reload(); }} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex justify-center items-center active:scale-95">
                                Mark as Picked Up <CheckCircle size={18} className="ml-2" />
                              </button>
                            </div>
                          )}
                          {(item.status === 'Accepted' || item.status === 'Expired') && (item.deliveryStatus === 'picked') && (
                            <div className="pt-4 border-t border-gray-100 text-center text-sm font-bold text-gray-500 uppercase tracking-widest">
                              En route to Receiver
                            </div>
                          )}
                          {(item.status === 'Accepted' || item.status === 'Expired') && item.deliveryStatus === 'delivered' && (
                            <div className="pt-4 border-t border-gray-100">
                              <div className="mb-5 bg-green-50 p-4 rounded-xl border border-green-200">
                                <h6 className="text-xs font-extrabold text-green-800 uppercase mb-3 flex items-center"><CheckCircle size={16} className="mr-2"/> Delivery Proof Uploaded</h6>
                                {item.deliveryProofImage && <img src={item.deliveryProofImage} alt="Proof" className="w-full max-h-[160px] object-cover rounded-lg border border-green-300 shadow-sm" />}
                              </div>
                              <button onClick={async () => { await api.patch(`/food/confirm-delivery/${item._id}`); window.location.reload(); }} className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-extrabold transition-all shadow-lg shadow-green-500/30 flex justify-center items-center active:scale-95">
                                Confirm Final Delivery <CheckCircle size={20} className="ml-2" />
                              </button>
                            </div>
                          )}
                          {item.deliveryStatus === 'completed' && (
                            <div className="pt-4 border-t border-gray-100 text-center text-sm font-bold text-green-600 uppercase tracking-widest flex justify-center items-center">
                              <CheckCircle size={18} className="mr-2"/> Transaction Completed
                            </div>
                          )}
                        </div>
                      )}
                      {item.status === 'Available' && (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500">
                          <Users size={32} className="text-gray-300 mb-2" />
                          <span className="font-bold">Awaiting Requests</span>
                          <span className="text-xs mt-1 text-center">Your listing is active on the map</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-gray-900">Edit Donation</h3>
                <button onClick={() => setEditingFood(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={submitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Quantity (people)</label>
                  <input type="number" min="1" value={editFormData.quantity} onChange={(e) => setEditFormData({...editFormData, quantity: e.target.value})} required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                  <select value={editFormData.type} onChange={(e) => setEditFormData({...editFormData, type: e.target.value})} className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                    <option value="veg">Veg</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Time</label>
                  <input type="datetime-local" value={editFormData.expiryTime} onChange={(e) => setEditFormData({...editFormData, expiryTime: e.target.value})} required className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" />
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-green-500/30 active:scale-95 transition-all">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default DonorDashboard;
