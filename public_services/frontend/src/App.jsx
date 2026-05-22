import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Globe,
  PlusCircle,
  Activity,
  CheckCircle,
  MapPin,
  Scale,
  Sparkles,
  TrendingUp,
  X,
  Bell
} from 'lucide-react';

import translations from './utils/translations';
import ProductCard from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import ListingDetail from './components/ListingDetail';
import ListProduceForm from './components/ListProduceForm';

// Initialize socket
const socket = io('http://localhost:5050');

const AppContent = () => {
  const location = useLocation();
  const [lang, setLang] = useState('en'); // 'en', 'hi', 'kn'
  const t = translations[lang];

  // Geolocation states
  const [buyerCoords, setBuyerCoords] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  // Filters State
  const initialFilters = {
    crop: '',
    district: '',
    minQty: '0',
    maxQty: '5000',
    minPrice: '0',
    maxPrice: '150',
    search: '',
    sort: 'newest',
    maxDist: '100'
  };
  const [filters, setFilters] = useState(initialFilters);

  // Listings state
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Real-time notification states
  const [newListingAlert, setNewListingAlert] = useState(null);

  // Fetch listings from backend
  const fetchListings = async () => {
    try {
      let url = `/api/listings?crop=${filters.crop}&district=${filters.district}&minQty=${filters.minQty}&maxQty=${filters.maxQty}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}&search=${filters.search}&sort=${filters.sort}`;
      
      if (buyerCoords) {
        url += `&lat=${buyerCoords.lat}&lng=${buyerCoords.lng}&maxDist=${filters.maxDist}`;
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters or geolocation change
  useEffect(() => {
    fetchListings();
  }, [filters, buyerCoords]);

  // Set up auto-polling (30 seconds) fallback
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Polling] Fetching fresh crop listings...');
      fetchListings();
    }, 30000);
    return () => clearInterval(interval);
  }, [filters, buyerCoords]);

  // Socket.io real-time updates listener
  useEffect(() => {
    socket.on('new_listing', (newListing) => {
      console.log('Real-time: New listing arrived:', newListing);
      
      // Update active listings list instantly
      setListings(prev => [newListing, ...prev]);

      // Trigger beautiful top floating toast notification
      setNewListingAlert(newListing);
      setTimeout(() => {
        setNewListingAlert(null);
      }, 6000);
    });

    socket.on('listing_status_change', (updatedListing) => {
      setListings(prev =>
        prev.map(item => item._id === updatedListing._id ? updatedListing : item)
      );
    });

    return () => {
      socket.off('new_listing');
      socket.off('listing_status_change');
    };
  }, []);

  // Request browser geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setBuyerCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        console.error(err);
        alert('Could not detect location. Filters will exclude distance parameters.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setBuyerCoords(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f6]">
      {/* Real-time Listing Banner Alert */}
      {newListingAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-white rounded-2xl border-2 border-brand-green/30 shadow-2xl p-4 animate-slide-up flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center text-brand-green flex-shrink-0 animate-bounce">
            <Bell className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-sm text-gray-800 uppercase tracking-wide">
                ⚡ Real-time Listing
              </h4>
              <button onClick={() => setNewListingAlert(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">
              <span className="text-brand-green font-bold">{newListingAlert.farmer.name}</span> in <span className="font-bold">{newListingAlert.location.village}</span> just listed <span className="font-bold text-gray-700">{newListingAlert.quantity}kg of {newListingAlert.crop}</span>!
            </p>
            <Link
              to={`/listing/${newListingAlert._id}`}
              onClick={() => setNewListingAlert(null)}
              className="text-[11px] font-bold text-brand-green hover:text-brand-green-dark flex items-center gap-0.5 mt-2"
            >
              View Listing Live &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Modern Navigation Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-40 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-green to-emerald-600 flex items-center justify-center shadow-md shadow-brand-green/20 group-hover:rotate-6 transition-all duration-300">
              <span className="text-xl font-bold text-white">FS</span>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-brand-green-dark font-display">FarmShield AI</span>
              <span className="text-xs font-semibold text-brand-brown block -mt-1 uppercase tracking-widest">Marketplace</span>
            </div>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-100 hover:border-gray-200 text-sm font-semibold text-gray-600 hover:text-brand-green transition-all bg-white">
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'ಕನ್ನಡ'}
              </button>
              <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 w-28 overflow-hidden z-50">
                <button onClick={() => setLang('en')} className="px-4 py-1.5 hover:bg-brand-green-light hover:text-brand-green text-sm font-semibold text-left text-gray-700">English</button>
                <button onClick={() => setLang('hi')} className="px-4 py-1.5 hover:bg-brand-green-light hover:text-brand-green text-sm font-semibold text-left text-gray-700">हिंदी</button>
                <button onClick={() => setLang('kn')} className="px-4 py-1.5 hover:bg-brand-green-light hover:text-brand-green text-sm font-semibold text-left text-gray-700">ಕನ್ನಡ</button>
              </div>
            </div>

            {/* List Produce Farmer CTA */}
            {location.pathname !== '/list-produce' && (
              <Link
                to="/list-produce"
                className="flex items-center gap-1.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2 px-4 rounded-xl text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Farmer Portal</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Pages Content */}
      <main className="flex-grow">
        <Routes>
          {/* 1. Main Listings Feed */}
          <Route
            path="/"
            element={
              <div>
                {/* Hero / Impact Banner */}
                <section className="bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white py-12 px-4">
                  <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="max-w-xl">
                      <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-sm text-brand-yellow font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4 border border-white/5">
                        <Sparkles className="w-3.5 h-3.5" /> Hackathon Special Delivery
                      </div>
                      <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                        {t.title}
                      </h1>
                      <p className="text-white/80 text-base md:text-lg mt-3 leading-relaxed font-medium">
                        {t.subtitle}
                      </p>
                    </div>

                    {/* Success Metrics Box */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10 flex flex-col gap-4 w-full md:w-80 shadow-lg">
                      <div className="flex gap-3 items-start border-b border-white/10 pb-3">
                        <TrendingUp className="w-8 h-8 text-brand-yellow flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Social Impact</p>
                          <p className="font-extrabold text-sm text-white">{t.successMarketTitle}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <Activity className="w-8 h-8 text-emerald-300 flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Latency MVP</p>
                          <p className="font-extrabold text-sm text-white">{t.successListTitle}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Filters and Feed Grid */}
                <section className="max-w-6xl mx-auto px-4 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filter Sidebar */}
                    <div className="lg:col-span-1">
                      <FilterSidebar
                        filters={filters}
                        setFilters={setFilters}
                        onReset={handleResetFilters}
                        t={t}
                        isLocating={isLocating}
                        onGeolocate={handleGeolocate}
                        hasCoordinates={!!buyerCoords}
                      />
                    </div>

                    {/* Feed Grid */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                      {/* Active count and stats */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 font-display">
                          Live Crop Feed ({listings.length})
                        </h2>
                        {buyerCoords && (
                          <span className="text-xs font-semibold text-brand-green bg-brand-green-light border border-brand-green/10 px-2.5 py-1 rounded-full">
                            📍 GPS-Distance Filters Enabled
                          </span>
                        )}
                      </div>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-3 text-sm text-gray-400 font-medium">Checking fresh harvest scans...</p>
                        </div>
                      ) : listings.length === 0 ? (
                        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
                          <span className="text-6xl">🌾</span>
                          <h3 className="text-lg font-bold text-gray-700 mt-4">No crops match your filters</h3>
                          <p className="text-sm text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                            Try resetting filters, entering different districts, or increasing the geolocated range.
                          </p>
                          <button
                            onClick={handleResetFilters}
                            className="mt-6 bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
                          >
                            Reset All Filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {listings.map(prod => (
                            <ProductCard
                              key={prod._id}
                              product={prod}
                              t={t}
                              currentLang={lang}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            }
          />

          {/* 2. Listing Detail View */}
          <Route path="/listing/:id" element={<ListingDetail t={t} currentLang={lang} />} />

          {/* 3. Farmer Produce Form */}
          <Route path="/list-produce" element={<ListProduceForm t={t} currentLang={lang} />} />
        </Routes>
      </main>

      {/* bilingual footer */}
      <footer className="bg-gray-900 text-white border-t border-gray-800 py-10 mt-auto px-4 text-center">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-brand-green-light">
            <span className="text-xl">🌾</span>
            <span className="font-extrabold tracking-wider font-display uppercase">FarmShield AI</span>
          </div>
          <p className="text-gray-400 text-sm italic font-medium">
            &ldquo;{t.tagline}&rdquo;
          </p>
          <div className="w-12 h-1 bg-brand-green rounded-full my-1"></div>
          <a
            href="https://pesce.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            {t.pesFooter}
          </a>
        </div>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
