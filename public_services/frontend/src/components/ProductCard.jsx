import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Scale, ShieldCheck, Calendar, Eye, Phone, ArrowUpRight } from 'lucide-react';

const ProductCard = ({ product, t, currentLang }) => {
  const {
    _id,
    crop,
    quantity,
    price,
    location,
    farmer,
    image,
    createdAt,
    distance
  } = product;

  // Relative time helper
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (currentLang === 'hi') {
      if (diffMins < 60) return `${diffMins} मिनट पहले`;
      if (diffHours < 24) return `${diffHours} घंटे पहले`;
      return `${diffDays} दिन पहले`;
    } else if (currentLang === 'kn') {
      if (diffMins < 60) return `${diffMins} ನಿಮಿಷಗಳ ಹಿಂದೆ`;
      if (diffHours < 24) return `${diffHours} ಗಂಟೆಗಳ ಹಿಂದೆ`;
      return `${diffDays} ದಿನಗಳ ಹಿಂದೆ`;
    } else {
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    }
  };

  // Check if listed in the last 6 hours
  const isTodayFresh = () => {
    const diffMs = new Date() - new Date(createdAt);
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 6;
  };

  // Crop-specific colors and emojis for visual appeal
  const getCropMeta = (cropName) => {
    const meta = {
      Tomato: { emoji: '🍅', color: 'bg-red-50 text-red-700 border-red-200' },
      Potato: { emoji: '🥔', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
      Rice: { emoji: '🌾', color: 'bg-amber-50 text-amber-800 border-amber-200' },
      Cotton: { emoji: '☁️', color: 'bg-slate-50 text-slate-700 border-slate-200' },
      Onion: { emoji: '🧅', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      Brinjal: { emoji: '🍆', color: 'bg-violet-50 text-violet-800 border-violet-200' },
      Chilli: { emoji: '🌶️', color: 'bg-red-100 text-red-800 border-red-300' }
    };
    return meta[cropName] || { emoji: '📦', color: 'bg-green-50 text-green-700 border-green-200' };
  };

  const cropMeta = getCropMeta(crop);
  const fresh = isTodayFresh();

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 animate-slide-up group">
      {/* Visual Header / Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image.startsWith('http') ? image : `http://localhost:5050${image}`}
            alt={crop}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80"; // Fallback farm photo
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-brown/10 flex items-center justify-center">
            <span className="text-6xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">
              {cropMeta.emoji}
            </span>
          </div>
        )}

        {/* Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2 justify-between pointer-events-none">
          {fresh && (
            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm animate-pulse-slow">
              🔥 {t.freshBadge}
            </span>
          )}
          {farmer.isVerified && (
            <span className="bg-gradient-to-r from-brand-green to-emerald-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 ml-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              {t.verifiedFarmer}
            </span>
          )}
        </div>

        {/* Cost overlay */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center">
          <span className="text-lg font-bold">₹{price}</span>/kg
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cropMeta.color} mb-1`}>
              {crop}
            </span>
            <h3 className="text-xl font-bold text-gray-800 tracking-tight">{crop}</h3>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {getRelativeTime(createdAt)}
          </span>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-gray-50 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Scale className="w-4 h-4 text-brand-green flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t.quantity}</p>
              <p className="font-semibold text-gray-700">{quantity} kg</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 text-brand-brown flex-shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t.location}</p>
              <p className="font-medium text-gray-700 truncate max-w-[100px]">{location.district}</p>
            </div>
          </div>
        </div>

        {/* Farmer info */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-full bg-brand-green-light flex items-center justify-center font-bold text-brand-green">
            {farmer.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-700 truncate">{farmer.name}</p>
            </div>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              📍 {location.village}
              {distance !== undefined && (
                <span className="text-brand-green font-medium">({distance} km)</span>
              )}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link
            to={`/listing/${_id}`}
            className="flex items-center justify-center gap-1 border border-gray-200 hover:border-brand-green text-gray-600 hover:text-brand-green py-2 px-3 rounded-xl text-sm font-medium transition-colors"
          >
            <Eye className="w-4 h-4" />
            {t.detailsButton}
          </Link>
          <Link
            to={`/listing/${_id}?express=true`}
            className="flex items-center justify-center gap-1 bg-brand-green hover:bg-brand-green-dark text-white py-2 px-3 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-brand-green/20"
          >
            <Phone className="w-4 h-4" />
            {t.contactFarmer}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
