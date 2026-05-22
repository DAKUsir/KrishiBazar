import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Smartphone,
  CheckCircle,
  MapPin,
  Camera,
  Upload,
  Calendar,
  Hourglass,
  Send,
  Navigation
} from 'lucide-react';

const ListProduceForm = ({ t, currentLang }) => {
  const navigate = useNavigate();

  // Wizard Auth States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  
  const [farmerData, setFarmerData] = useState(null); // Set after verification

  // Crop Listing States
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsDetected, setGpsDetected] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().substring(0, 16));
  const [shelfLife, setShelfLife] = useState('5');
  const [notes, setNotes] = useState('');

  const [publishing, setPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Send Mock OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone) return;

    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      if (res.ok) {
        setIsOtpSent(true);
        setOtpError('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Verify Mock OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;

    try {
      setVerifyingOtp(true);
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFarmerData(data.farmer);
        setOtpError('');
      } else {
        setOtpError('Invalid OTP. Please enter 123456.');
      }
    } catch (err) {
      setOtpError('Server validation failed.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Geolocate crop village
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
        setGpsDetected(true);
        setDetectingGps(false);
      },
      (err) => {
        console.error(err);
        alert('Could not retrieve location. Using default village coordinates.');
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle image changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle crop publishing
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!quantity || !price || !village || !district) {
      alert('Please fill out all required fields');
      return;
    }

    try {
      setPublishing(true);
      const formData = new FormData();
      formData.append('crop', crop);
      formData.append('quantity', quantity);
      formData.append('price', price);
      formData.append('village', village);
      formData.append('district', district);
      formData.append('lat', lat || '12.9716');
      formData.append('lng', lng || '77.5946');
      formData.append('farmerName', farmerData.name);
      formData.append('farmerPhone', farmerData.phone);
      formData.append('isVerified', farmerData.isVerified);
      formData.append('harvestDate', harvestDate);
      formData.append('shelfLife', shelfLife);
      formData.append('notes', notes);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/listings', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setPublishSuccess(true);
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        alert('Error publishing listing');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to connect to backend server');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          🌾 {t.listProduceTitle}
        </h1>
        <p className="text-gray-500 text-sm mt-2 font-medium">
          {t.listProduceSubtitle}
        </p>
      </div>

      {/* Step 1: Authentication */}
      {!farmerData ? (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 text-brand-green bg-brand-green-light/40 p-4 rounded-2xl border border-brand-green/10">
            <Smartphone className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm text-brand-green-dark">Quick Mobile Login</h3>
              <p className="text-xs text-gray-500 font-medium">No password needed. Simple OTP verify for safety.</p>
            </div>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t.phoneLabel}
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-base font-semibold shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-3.5 px-6 rounded-2xl text-base font-bold shadow-md shadow-brand-green/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {t.sendOtp}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t.enterOtp}
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  placeholder="Enter 123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none shadow-inner"
                />
                {otpError && (
                  <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    {otpError}
                  </p>
                )}
              </div>
              <button
                type="submit"
                disabled={verifyingOtp}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-3.5 px-6 rounded-2xl text-base font-bold shadow-md shadow-brand-green/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {verifyingOtp ? 'Verifying...' : t.verifyOtp}
              </button>
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="text-xs font-bold text-brand-brown hover:text-brand-green transition-colors mt-2 text-center"
              >
                Back to Mobile Entry
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Step 2: Listing Form */
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
          {publishSuccess ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 bg-brand-green-light rounded-full flex items-center justify-center text-brand-green">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Published!</h2>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                {t.listingSuccess}
              </p>
            </div>
          ) : (
            <form onSubmit={handlePublish} className="flex flex-col gap-6">
              {/* Farmer Info Bar */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 font-semibold">{t.welcomeFarmer}</span>
                  <span className="text-sm font-bold text-gray-700">{farmerData.name || 'Farmer'}</span>
                </div>
                {farmerData.isVerified && (
                  <span className="bg-brand-green-light text-brand-green-dark text-[10px] font-extrabold px-2.5 py-1 rounded-full border border-brand-green/20">
                    🎖️ {t.verifiedFarmer}
                  </span>
                )}
              </div>

              {/* Crop Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.cropLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm bg-white"
                  >
                    <option value="Tomato">Tomato (🍅)</option>
                    <option value="Potato">Potato (🥔)</option>
                    <option value="Rice">Rice (🌾)</option>
                    <option value="Cotton">Cotton (☁️)</option>
                    <option value="Onion">Onion (🧅)</option>
                    <option value="Brinjal">Brinjal (🍆)</option>
                    <option value="Chilli">Chilli (🌶️)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.quantityLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 500"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.priceLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 15"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.shelfLifeLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 5"
                    value={shelfLife}
                    onChange={(e) => setShelfLife(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>
              </div>

              {/* Location Grid */}
              <div className="border-t border-gray-50 pt-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">📍 Village & GPS Location</h4>
                  <button
                    type="button"
                    onClick={handleGeolocate}
                    disabled={detectingGps}
                    className={`text-xs font-bold py-1.5 px-3 rounded-lg border flex items-center gap-1.5 transition-all ${
                      gpsDetected
                        ? 'bg-brand-green-light border-brand-green text-brand-green-dark'
                        : 'border-gray-200 hover:border-brand-green text-gray-500 hover:text-brand-green'
                    }`}
                  >
                    <Navigation className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                    {detectingGps ? 'Detecting GPS...' : gpsDetected ? 'GPS Attached!' : 'Detect GPS Coordinates'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{t.villageLabel} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Maddur"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{t.districtLabel} <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mandya"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Harvest details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-50 pt-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.harvestDateLabel}
                  </label>
                  <input
                    type="datetime-local"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                {/* Photo uploader */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {t.photoLabel}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer bg-gray-50 border border-dashed border-gray-200 hover:border-brand-green text-gray-500 hover:text-brand-green rounded-2xl p-4 flex-1 flex flex-col items-center justify-center gap-1 transition-colors">
                      <Camera className="w-5 h-5" />
                      <span className="text-xs font-semibold">Choose photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 relative shadow-sm">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quality scans / special treatments */}
              <div className="flex flex-col gap-1.5 border-t border-gray-50 pt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t.notesLabel}
                </label>
                <textarea
                  placeholder="e.g. Late Blight treated – safe for consumption. Cleaned and dried."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-brand-green outline-none text-sm resize-none"
                ></textarea>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={publishing}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-4 px-6 rounded-2xl text-base font-extrabold shadow-md shadow-brand-green/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Upload className="w-5 h-5" />
                {publishing ? t.submittingListing : 'Publish Crop Listing Now'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ListProduceForm;
