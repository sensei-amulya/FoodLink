import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Package,
  MapPin,
  CheckCircle,
  Navigation,
  Phone,
  User as UserIcon,
  Map,
  Camera,
  UploadCloud,
  X,
} from "lucide-react";

const DeliveryBoard = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [deliveries, setDeliveries] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Accept Modal state
  const [acceptingId, setAcceptingId] = useState(null);
  const [volunteerName, setVolunteerName] = useState("");
  const [volunteerPhone, setVolunteerPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Proof Modal state
  const [proofTaskId, setProofTaskId] = useState(null);
  const [proofImageBase64, setProofImageBase64] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "available") {
        const { data } = await api.get("/food/available-deliveries");
        setDeliveries(data);
      } else {
        const { data } = await api.get("/food/my-deliveries");
        setMyDeliveries(data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to gather deliveries.");
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone) => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10;
  };

  const handleConfirmAccept = async (e) => {
    e.preventDefault();
    setPhoneError("");

    if (!volunteerName.trim()) {
      setPhoneError("Name is required");
      return;
    }
    if (!validatePhone(volunteerPhone)) {
      setPhoneError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      await api.post(`/food/accept-delivery/${acceptingId}`, {
        volunteerName,
        volunteerPhone,
      });
      setDeliveries(deliveries.filter((d) => d._id !== acceptingId));
      setAcceptingId(null);
      setVolunteerName("");
      setVolunteerPhone("");
      setActiveTab("my_deliveries");
    } catch (err) {
      setPhoneError(
        err.response?.data?.message || "Failed to accept delivery.",
      );
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofImageBase64) return;
    setUploading(true);
    try {
      await api.patch(`/food/mark-delivered/${proofTaskId}`, {
        deliveryProofImage: proofImageBase64,
      });
      setMyDeliveries(
        myDeliveries.map((d) =>
          d._id === proofTaskId
            ? {
                ...d,
                deliveryStatus: "delivered",
                deliveryProofImage: proofImageBase64,
              }
            : d,
        ),
      );
      setProofTaskId(null);
      setProofImageBase64("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark as delivered.");
    } finally {
      setUploading(false);
    }
  };

  const openGoogleMaps = (coords) => {
    if (!coords || coords.length < 2) return;
    const [lng, lat] = coords;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank",
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans pb-24">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center mb-2 tracking-tight">
            <Navigation className="mr-3 text-blue-600" size={36} /> Delivery Hub
          </h1>
          <p className="text-gray-500 font-medium text-lg">
            Manage community food deliveries and track routes.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200 w-full md:w-max">
          <button
            onClick={() => setActiveTab("available")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "available" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            Available Tasks
          </button>
          <button
            onClick={() => setActiveTab("my_deliveries")}
            className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "my_deliveries" ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
          >
            My Deliveries
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 shadow-sm border border-red-100 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
        </div>
      ) : activeTab === "available" ? (
        deliveries.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm mt-8">
            <Package className="mx-auto h-20 w-20 mb-6 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No active tasks
            </h2>
            <p className="text-gray-500 font-medium text-lg">
              Waiting for new delivery requests to emerge.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
            {deliveries.map((task) => (
              <div
                key={task._id}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col group active:scale-[0.98]"
              >
                <div className="flex justify-between items-start mb-6">
                  <h3 className="font-extrabold text-2xl text-gray-900 truncate pr-2 group-hover:text-blue-600 transition-colors">
                    {task.name}
                  </h3>
                  <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 text-xs font-bold tracking-wider rounded-xl uppercase shadow-sm">
                    PENDING
                  </span>
                </div>
                <div className="space-y-4 text-sm text-gray-600 mb-8 font-medium bg-gray-50/80 border border-gray-100 p-6 rounded-2xl flex-grow">
                  <div
                    className="flex items-center cursor-pointer group-hover:text-blue-500"
                    onClick={() =>
                      openGoogleMaps(task.donorId?.location?.coordinates)
                    }
                  >
                    <MapPin
                      size={20}
                      className="text-blue-500 mr-3 flex-shrink-0"
                    />
                    <div>
                      <span className="truncate text-base block">
                        Donor:{" "}
                        <strong className="text-gray-900">
                          {task.donorId?.name}
                        </strong>
                      </span>
                      <span className="text-xs text-gray-500 hover:text-blue-500 block uppercase tracking-wider">
                        📍 View Pickup Location
                      </span>
                    </div>
                  </div>
                  <div
                    className="flex items-center cursor-pointer group-hover:text-orange-500"
                    onClick={() => {
                      const coords = (task.receiverId || task.farmerId)
                        ?.location?.coordinates;
                      if (
                        coords &&
                        coords.length === 2 &&
                        !(coords[0] === 0 && coords[1] === 0)
                      ) {
                        openGoogleMaps(coords);
                      } else {
                        alert(
                          "Delivery location not available yet. Receiver needs to update their location.",
                        );
                      }
                    }}
                  >
                    <Package
                      size={20}
                      className="text-orange-500 mr-3 flex-shrink-0"
                    />
                    <div>
                      <span className="truncate text-base block">
                        {task.farmerId ? "Farmer" : "Receiver"}:{" "}
                        <strong className="text-gray-900">
                          {(task.receiverId || task.farmerId)?.name}
                        </strong>
                      </span>
                      <span className="text-xs text-gray-500 hover:text-orange-500 block uppercase tracking-wider">
                        📍 View Drop Location
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setAcceptingId(task._id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-center"
                >
                  Accept Delivery
                </button>
              </div>
            ))}
          </div>
        )
      ) : myDeliveries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 shadow-sm mt-8">
          <Navigation className="mx-auto h-20 w-20 mb-6 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            You have no active deliveries
          </h2>
          <p className="text-gray-500 font-medium text-lg">
            Grab a task from the Available Tasks tab to hit the road.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {myDeliveries.map((task) => (
            <div
              key={task._id}
              className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-gray-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-5">
                <div>
                  <h3 className="font-extrabold text-3xl text-gray-900 mb-3 tracking-tight">
                    {task.name}
                  </h3>
                  <span
                    className={`px-4 py-1.5 text-xs font-extrabold tracking-widest rounded-xl uppercase shadow-sm ${
                      task.deliveryStatus === "accepted"
                        ? "bg-blue-100 text-blue-800 border-blue-200 border"
                        : task.deliveryStatus === "picked"
                          ? "bg-orange-100 text-orange-800 border-orange-200 border"
                          : task.deliveryStatus === "delivered"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-700 border border-gray-200"
                    }`}
                  >
                    {task.deliveryStatus}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-5 mb-8">
                <div
                  className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 flex justify-between items-center group cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() =>
                    openGoogleMaps(task.donorId?.location?.coordinates)
                  }
                >
                  <div>
                    <span className="text-xs font-extrabold text-blue-500 uppercase tracking-widest block mb-1.5 flex items-center">
                      <MapPin size={14} className="mr-1" /> Pickup Location
                    </span>
                    <strong className="text-gray-900 text-xl block">
                      {task.donorId?.name}
                    </strong>
                  </div>
                  <button
                    className="bg-white text-blue-600 p-4 rounded-2xl border border-blue-200 shadow-sm group-hover:scale-105 transition-transform flex flex-col items-center"
                    onClick={() => {
                      const coords = task.donorId?.location?.coordinates;
                      if (
                        coords &&
                        coords.length === 2 &&
                        !(coords[0] === 0 && coords[1] === 0)
                      ) {
                        openGoogleMaps(coords);
                      } else {
                        alert("Pickup location not available.");
                      }
                    }}
                  >
                    <Navigation size={22} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase">
                      Navigate
                    </span>
                  </button>
                </div>

                <div
                  className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 flex justify-between items-center group cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => {
                    const coords = (task.receiverId || task.farmerId)?.location
                      ?.coordinates;
                    if (
                      coords &&
                      coords.length === 2 &&
                      !(coords[0] === 0 && coords[1] === 0)
                    ) {
                      openGoogleMaps(coords);
                    } else {
                      alert(
                        "Delivery location not available yet. Receiver needs to update their location.",
                      );
                    }
                  }}
                >
                  <div>
                    <span className="text-xs font-extrabold text-orange-500 uppercase tracking-widest block mb-1.5 flex items-center">
                      <Package size={14} className="mr-1" /> Drop Location
                    </span>
                    <strong className="text-gray-900 text-xl block">
                      {(task.receiverId || task.farmerId)?.name}
                    </strong>
                  </div>
                  <button
                    className="bg-white text-orange-600 p-4 rounded-2xl border border-orange-200 shadow-sm group-hover:scale-105 transition-transform flex flex-col items-center"
                    onClick={() => {
                      const coords = (task.receiverId || task.farmerId)
                        ?.location?.coordinates;
                      if (
                        coords &&
                        coords.length === 2 &&
                        !(coords[0] === 0 && coords[1] === 0)
                      ) {
                        openGoogleMaps(coords);
                      } else {
                        alert(
                          "Delivery location not available yet. Receiver needs to update their location.",
                        );
                      }
                    }}
                  >
                    <Navigation size={22} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase">
                      Navigate
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-auto pt-2">
                {task.deliveryStatus === "accepted" && (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-4 rounded-2xl text-center text-gray-500 font-bold text-sm">
                    🕒 Waiting for donor to confirm pickup...
                  </div>
                )}
                {task.deliveryStatus === "picked" && (
                  <button
                    onClick={() => setProofTaskId(task._id)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-green-500/30 active:scale-[0.98] transition-all flex items-center justify-center text-lg"
                  >
                    Mark as Delivered <Camera size={22} className="ml-2.5" />
                  </button>
                )}
                {(task.deliveryStatus === "delivered" ||
                  task.deliveryStatus === "completed") && (
                  <div className="bg-green-50 border border-green-200 p-5 rounded-2xl text-center text-green-700 font-extrabold flex items-center justify-center text-lg shadow-inner">
                    <CheckCircle className="mr-2" size={24} />
                    {task.deliveryStatus === "completed"
                      ? "Delivery Complete & Verified!"
                      : "Proof Uploaded. Pending Verification..."}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Delivery Modal */}
      {acceptingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4">
          <form
            onSubmit={handleConfirmAccept}
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-10 border border-white/20"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 mx-auto shadow-inner border border-blue-100">
              <UserIcon size={36} />
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
              Driver Details
            </h3>
            <p className="text-gray-500 font-medium mb-8 text-center leading-relaxed">
              Provide your contact info so the donor and receiver can reach you
              easily.
            </p>

            {phoneError && (
              <div className="text-red-600 bg-red-50 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center">
                {phoneError}
              </div>
            )}

            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-0 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 bg-gray-50 focus:bg-white text-lg"
                  placeholder="John Doe"
                  value={volunteerName}
                  onChange={(e) => setVolunteerName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-gray-700 mb-2 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  className="w-full border-2 border-gray-200 rounded-2xl p-4 focus:ring-0 focus:border-blue-500 outline-none transition-all font-bold text-gray-900 bg-gray-50 focus:bg-white text-lg tracking-widest"
                  placeholder="9876543210"
                  value={volunteerPhone}
                  onChange={(e) => setVolunteerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setAcceptingId(null);
                  setPhoneError("");
                  setVolunteerName("");
                  setVolunteerPhone("");
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-extrabold shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 active:scale-95 transition-all"
              >
                Accept
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {proofTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
          <form
            onSubmit={handleSubmitProof}
            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-10 border border-white/20"
          >
            <div className="w-full flex justify-end mb-2">
              <button
                type="button"
                onClick={() => {
                  setProofTaskId(null);
                  setProofImageBase64("");
                }}
                className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-6 mx-auto shadow-inner border border-green-100">
              <UploadCloud size={36} />
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
              Delivery Proof
            </h3>
            <p className="text-gray-500 font-medium mb-8 text-center px-4 leading-relaxed">
              Please upload a photo of the delivered food or the handoff.
            </p>

            <div className="mb-8 relative">
              {!proofImageBase64 ? (
                <label className="border-2 border-dashed border-gray-300 hover:border-green-400 bg-gray-50 hover:bg-green-50/30 rounded-3xl p-10 flex flex-col justify-center items-center cursor-pointer transition-colors min-h-[200px]">
                  <Camera size={40} className="text-gray-400 mb-4" />
                  <span className="text-gray-600 font-bold mb-1">
                    Click to browse or snap photo
                  </span>
                  <span className="text-gray-400 text-sm font-medium">
                    JPEG, PNG accepted
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                  <img
                    src={proofImageBase64}
                    alt="Delivery Proof Preview"
                    className="w-full h-auto object-cover max-h-[300px]"
                  />
                  <button
                    type="button"
                    onClick={() => setProofImageBase64("")}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 font-bold px-4 py-2 rounded-xl shadow-lg border border-red-100 hover:bg-red-50 text-sm"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!proofImageBase64 || uploading}
              className={`w-full py-4 rounded-2xl font-extrabold shadow-lg active:scale-95 transition-all text-lg flex items-center justify-center ${!proofImageBase64 || uploading ? "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white shadow-green-500/30"}`}
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>{" "}
                  Uploading...
                </>
              ) : (
                <>
                  Submit Proof <CheckCircle size={22} className="ml-2" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DeliveryBoard;
