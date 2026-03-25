import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  MapPin,
  Clock,
  Leaf,
  Flame,
  Users,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react';
import api from '../api/axios';

const AddFood = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    type: 'veg',
    expiryTime: '',
    location: {
      address: '',
      lat: null,
      lng: null
    }
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [status, setStatus] = useState({ loading: false, type: '', message: '' });
  const [detectingLocation, setDetectingLocation] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const searchTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    setSearchingLocation(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Location search failed", error);
    } finally {
      setSearchingLocation(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, location: { ...prev.location, address: value, lat: null, lng: null } }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      handleLocationSearch(value);
    }, 500);
  };

  const selectLocation = (result) => {
    setFormData(prev => ({
      ...prev,
      location: {
        address: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }
    }));
    setSearchResults([]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageSelection(files[0]);
    }
  };

  const handleImageSelection = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setStatus({ type: 'error', message: 'Geolocation is not supported by your browser' });
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            address: 'Current Location (Auto-detected)',
            lat: latitude,
            lng: longitude
          }
        }));
        setDetectingLocation(false);
      },
      (error) => {
        setStatus({ type: 'error', message: 'Failed to get location. Please allow access or enter manually.' });
        setDetectingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, type: '', message: '' });

    if (!formData.location.lat || !formData.location.lng) {
      setStatus({ loading: false, type: 'error', message: 'Please select a valid location from the dropdown suggestions or use Auto-Locate.' });
      return;
    }

    try {
      // In a real app, upload image to a bucket (S3, Cloudinary) here and get the URL
      // Since this is a hackathon project, we'll send the data we have.
      // If the backend accepts FormData, we could send `image` file directly.
      // For now, mirroring original behavior and adding extra fields.

      const payload = {
        name: formData.name,
        quantity: Number(formData.quantity),
        type: formData.type, // Custom added based on prompt
        expiryTime: formData.expiryTime,
        latitude: formData.location.lat,
        longitude: formData.location.lng,
        address: formData.location.address,
        image: imagePreview // Send base64 to DB
      };

      await api.post('/food', payload);

      setStatus({ loading: false, type: 'success', message: 'Food successfully listed and nearby people will be notified!' });

      // Reset form or navigate away after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2500);

    } catch (error) {
      setStatus({ loading: false, type: 'error', message: error.response?.data?.message || 'Failed to list food. Please try again.' });
    }
  };

  // Live Preview properties
  const isExpiringSoon = formData.expiryTime ? new Date(formData.expiryTime).getTime() - new Date().getTime() < 3600000 : false;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-500 hover:text-green-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* Form Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Donate Surplus Food</h1>
              <p className="text-gray-500 mb-8">Fill out the details below to share your extra food with the community. Every meal counts!</p>

              {status.message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-8 flex items-start gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                    }`}
                >
                  {status.type === 'error' ? <XCircle className="mt-0.5 flex-shrink-0" /> : <CheckCircle className="mt-0.5 flex-shrink-0" />}
                  <p className="font-medium">{status.message}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">

                {/* Image Upload Component */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Food Photo</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-400 hover:bg-gray-50'
                      }`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.length > 0) handleImageSelection(e.target.files[0]);
                      }}
                    />

                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                        <img src={imagePreview} alt="Food preview" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-black/70 text-white px-4 py-2 rounded-lg font-medium">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-40">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-4 shadow-sm border border-green-200">
                          <UploadCloud size={32} />
                        </div>
                        <p className="font-semibold text-gray-700">Drag & drop your image here</p>
                        <p className="text-sm text-gray-500 mt-1">or click to browse from your device</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Title / Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. 5 Boxes of Veg Pasta"
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <Users size={16} className="mr-2 text-orange-500" />
                      Provides for (people)
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      required
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                    />
                  </div>

                  {/* Food Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Food Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'veg' }))}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-lg text-sm font-medium transition-all ${formData.type === 'veg' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Leaf size={16} className="mr-2" /> Veg
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, type: 'non-veg' }))}
                        className={`flex-1 flex justify-center items-center py-2.5 rounded-lg text-sm font-medium transition-all ${formData.type === 'non-veg' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'
                          }`}
                      >
                        <Flame size={16} className="mr-2" /> Non-Veg
                      </button>
                    </div>
                  </div>

                  {/* Expiry Time - Important Field */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-orange-600 mb-2 bg-orange-50 p-2 rounded-lg border border-orange-100 inline-flex">
                      <Clock size={16} className="mr-2" />
                      Expiry Date & Time (Crucial)
                    </label>
                    <input
                      type="datetime-local"
                      name="expiryTime"
                      required
                      value={formData.expiryTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 bg-orange-50/30 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-gray-800"
                    />
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <MapPin size={16} className="mr-2 text-green-500" />
                      Pickup Location
                    </label>
                    <div className="relative flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.location.address}
                          onChange={handleLocationChange}
                          placeholder="Search for a place or use auto-locate"
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none transition-all ${formData.location.lat ? 'border-green-300 focus:border-green-500 focus:ring-2 focus:ring-green-200' : 'border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                            }`}
                        />
                        {searchingLocation && (
                          <div className="absolute right-3 top-3">
                            <svg className="animate-spin h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        {/* Autocomplete Dropdown */}
                        {searchResults.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-h-60 overflow-y-auto">
                            {searchResults.map((result) => (
                              <button
                                key={result.place_id}
                                type="button"
                                onClick={() => selectLocation(result)}
                                className="w-full text-left px-4 py-3 hover:bg-green-50 text-sm text-gray-700 transition-colors border-b border-gray-50 last:border-0 flex items-start"
                              >
                                <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="line-clamp-2">{result.display_name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={detectLocation}
                        disabled={detectingLocation}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors border border-gray-200 disabled:opacity-50 whitespace-nowrap"
                      >
                        {detectingLocation ? 'Detecting...' : 'Auto-Locate'}
                      </button>
                    </div>
                    {/* Validation helper text */}
                    {formData.location.address && !formData.location.lat && !searchResults.length && (
                      <p className="text-orange-500 text-xs mt-2 flex items-center">
                        <span className="font-semibold mr-1">!</span> Please select a verified location from the dropdown.
                      </p>
                    )}
                    {formData.location.address && formData.location.lat && (
                      <p className="text-green-600 text-xs mt-2 flex items-center font-medium">
                        <CheckCircle size={14} className="mr-1" /> Verified Location
                      </p>
                    )}
                  </div>

                </div>

                <div className="pt-6 border-t border-gray-100">
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all text-lg flex items-center justify-center disabled:opacity-70 disabled:scale-100 active:scale-95"
                  >
                    {status.loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Posting your donation...
                      </span>
                    ) : (
                      'Post Food Listing'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Live Preview Column */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-24">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Live Preview</h3>

              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden transition-transform duration-300 hover:-translate-y-1">
                {/* Preview Image */}
                <div className="h-48 bg-gray-100 relative">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={48} opacity={0.5} />
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${formData.type === 'veg' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
                      }`}>
                      {formData.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 line-clamp-2 mb-2">
                    {formData.name || 'Your Food Title Here'}
                  </h4>






                  <div className="space-y-3 mt-4 text-sm font-medium text-gray-600">
                    <div className="flex items-center">
                      <Users size={16} className="text-gray-400 mr-3" />
                      Provides {formData.quantity || '0'} people
                    </div>

                    <div className="flex items-start">
                      <MapPin size={16} className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {formData.location.address || 'Pickup location not specified'}
                      </span>
                    </div>

                    <div className={`flex items-center ${isExpiringSoon ? 'text-red-600' : ''}`}>
                      <Clock size={16} className={`${isExpiringSoon ? 'text-red-500' : 'text-gray-400'} mr-3`} />
                      {formData.expiryTime ? new Date(formData.expiryTime).toLocaleString() : 'Expiry date not set'}
                    </div>
                  </div>

                  <button className="w-full mt-6 bg-gray-100 text-gray-400 font-bold py-3 rounded-xl cursor-default border border-gray-200">
                    Reserve
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddFood;
