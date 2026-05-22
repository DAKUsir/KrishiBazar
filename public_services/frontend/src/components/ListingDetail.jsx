import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Hourglass,
  MapPin,
  ShieldCheck,
  Phone,
  AlertTriangle,
  Send,
  CheckCircle,
  MessageSquare,
  Scale
} from 'lucide-react';
import L from 'leaflet';

const ListingDetail = ({ t, currentLang }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lead submission form state
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [requestedQty, setRequestedQty] = useState('');
  const [submittingLead, setSubmittingLead] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  
  // Phone reveal state
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  
  // Report state
  const [reported, setReported] = useState(false);
  const [reporting, setReporting] = useState(false);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error('Listing not found');
        const data = await res.json();
        setListing(data);
        
        // Pre-fill default quantity in form
        setRequestedQty(data.quantity.toString());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // Open express interest form immediately if query param "express=true" is passed
  useEffect(() => {
    if (listing && searchParams.get('express') === 'true') {
      setShowInterestForm(true);
    }
  }, [listing, searchParams]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (listing && listing.location && listing.location.coordinates) {
      const { lat, lng } = listing.location.coordinates;
      
      // Clear leaflet container instances if needed
      const mapContainer = L.DomUtil.get('detail-map');
      if (mapContainer) {
        mapContainer._leaflet_id = null;
      }
      
      const map = L.map('detail-map', {
        zoomControl: true,
        scrollWheelZoom: false
      }).setView([lat, lng], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);
      
      L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${listing.crop}</b><br>${listing.location.village}, ${listing.location.district}`)
        .openPopup();
      
      return () => {
        map.remove();
      };
    }
  }, [listing]);

  // Format Date Helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLang === 'en' ? 'en-US' : currentLang === 'hi' ? 'hi-IN' : 'kn-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle lead submit
  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!buyerName || !buyerPhone || !requestedQty) return;

    try {
      setSubmittingLead(true);
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: id,
          buyerName,
          buyerPhone,
          requestedQuantity: Number(requestedQty)
        })
      });
      if (res.ok) {
        setLeadSuccess(true);
        setTimeout(() => {
          setShowInterestForm(false);
          setLeadSuccess(false);
        }, 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingLead(false);
    }
  };

  // Handle report suspicious listing
  const handleReport = async () => {
    try {
      setReporting(true);
      const res = await fetch(`/api/listings/${id}/report`, { method: 'POST' });
      if (res.ok) {
        setReported(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading crop details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md mx-auto border border-red-100">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3" />
          <h3 className="text-lg font-bold">Error</h3>
          <p className="text-sm mt-1">{error || 'Listing not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-brand-green text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-brand-green-dark transition-colors"
          >
            {t.backToHome}
          </button>
        </div>
      </div>
    );
  }

  // Pre-configured WhatsApp text
  const whatsappUrl = `https://wa.me/${listing.farmer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${listing.farmer.name}, I saw your listing for ${listing.crop} (${listing.quantity}kg at ₹${listing.price}/kg) on FarmShield AI. Is it still available?`
  )}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-brand-green mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        {t.backToHome}
      </button>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Media, Details, Maps */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Crop Image Banner */}
          <div className="relative h-96 w-full rounded-3xl overflow-hidden shadow-sm bg-gray-100 border border-gray-100">
            {listing.image ? (
              <img
                src={listing.image.startsWith('http') ? listing.image : `http://localhost:5050${listing.image}`}
                alt={listing.crop}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand-green/10 to-brand-brown/10 flex flex-col items-center justify-center gap-3">
                <span className="text-8xl">
                  {listing.crop === 'Tomato' ? '🍅' : listing.crop === 'Potato' ? '🥔' : listing.crop === 'Rice' ? '🌾' : listing.crop === 'Cotton' ? '☁️' : listing.crop === 'Onion' ? '🧅' : listing.crop === 'Brinjal' ? '🍆' : listing.crop === 'Chilli' ? '🌶️' : '📦'}
                </span>
                <span className="text-xl font-bold text-brand-green">{listing.crop}</span>
              </div>
            )}

            {/* Float Badges */}
            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              {listing.farmer.isVerified && (
                <span className="bg-gradient-to-r from-brand-green to-emerald-600 text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {t.verifiedFarmer}
                </span>
              )}
            </div>

            {/* Price Overlay */}
            <div className="absolute bottom-6 left-6 bg-black/75 backdrop-blur-sm text-white px-5 py-2 rounded-2xl shadow font-semibold">
              <span className="text-2xl font-bold">₹{listing.price}</span> / kg
            </div>
          </div>

          {/* Listing Specs and Details */}
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
            <div>
              <span className="bg-brand-green-light text-brand-green-dark border border-brand-green/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                {listing.crop}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-800 mt-2 tracking-tight">
                {listing.crop} {t.location}: {listing.location.village}
              </h1>
              <p className="text-gray-400 text-sm mt-1 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand-brown" />
                {listing.location.village}, {listing.location.district}
              </p>
            </div>

            {/* Specs Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-green-light flex items-center justify-center text-brand-green">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">{t.quantity}</p>
                  <p className="text-lg font-bold text-gray-700">{listing.quantity} kg</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-brown-light flex items-center justify-center text-brand-brown">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">{t.harvestDate}</p>
                  <p className="text-base font-bold text-gray-700">{formatDate(listing.harvestDate)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-600">
                  <Hourglass className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">{t.shelfLife}</p>
                  <p className="text-base font-bold text-gray-700">{listing.shelfLife} {t.days}</p>
                </div>
              </div>
            </div>

            {/* Disease treatment & Quality Notes */}
            {listing.notes && (
              <div className="flex flex-col gap-2">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  🛡️ {t.qualityNotes}
                </h3>
                <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-sm text-gray-600 leading-relaxed font-medium">
                  {listing.notes}
                </div>
              </div>
            )}

            {/* GPS Map View */}
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                🗺️ {t.gpsLocation}
              </h3>
              <div
                id="detail-map"
                className="h-72 w-full rounded-2xl overflow-hidden border border-gray-100 shadow-inner"
              ></div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Buy and Safety Sidebar */}
        <div className="flex flex-col gap-8">
          {/* Farmer Contact and Action Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-5">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-50 pb-3">
              {t.contactFarmer}
            </h3>

            {/* Farmer Avatar/Name */}
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center font-bold text-white text-lg">
                {listing.farmer.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-700 truncate">{listing.farmer.name}</p>
                <p className="text-xs text-brand-green font-semibold flex items-center gap-0.5">
                  {listing.farmer.isVerified ? (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t.mandiStatusBadge}
                    </>
                  ) : (
                    'Community Farmer'
                  )}
                </p>
              </div>
            </div>

            {/* Masked Phone Reveal Form */}
            {!isPhoneRevealed ? (
              <div className="bg-brand-brown-light/40 border border-brand-brown/10 rounded-2xl p-4 flex flex-col gap-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                  {t.termsAgreement}
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="rounded border-gray-300 text-brand-green focus:ring-brand-green h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-gray-700 select-none">
                    I agree to trade directly & fairly
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsPhoneRevealed(true)}
                  disabled={!agreeToTerms}
                  className="w-full bg-brand-brown text-white py-2.5 px-4 rounded-xl text-sm font-bold shadow-sm transition-all hover:bg-brand-brown/95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" />
                  {t.revealPhone}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 animate-fade-in">
                <a
                  href={`tel:${listing.farmer.phone}`}
                  className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Call: {listing.farmer.phone}
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25d366] hover:bg-[#20ba56] text-white py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  {t.whatsappChat}
                </a>
              </div>
            )}

            {/* Express Interest Main CTA */}
            <button
              onClick={() => setShowInterestForm(true)}
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-3.5 px-6 rounded-2xl text-base font-bold shadow-md shadow-brand-green/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {t.expressInterest}
            </button>
          </div>

          {/* Trust and Safety reporting */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-brand-brown" />
              Trust & Safety
            </h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              If this listing displays incorrect prices, wrong locations, or suspicious behavior, report it below. Admins will review reports within 1 hour.
            </p>

            {reported ? (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-xl border border-red-100 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                {t.reportedSuccess}
              </div>
            ) : (
              <button
                onClick={handleReport}
                disabled={reporting}
                className="w-full border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {reporting ? 'Reporting...' : t.reportButton}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Express Interest Overlay Form */}
      {showInterestForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-slide-up">
            <div className="bg-brand-green p-6 text-white">
              <h3 className="text-xl font-bold tracking-tight">{t.expressInterestTitle}</h3>
              <p className="text-xs text-brand-green-light mt-1">
                Direct SMS will be sent to the farmer with your information.
              </p>
            </div>

            {leadSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
                <div className="w-16 h-16 bg-brand-green-light rounded-full flex items-center justify-center text-brand-green">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-gray-800">Success!</h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {t.interestSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handleLeadSubmit} className="p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t.buyerName}</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Anand Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t.buyerPhone}</label>
                  <input
                    type="tel"
                    required
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    placeholder="e.g. +91 9900887766"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t.requestedQty}</label>
                  <input
                    type="number"
                    required
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    placeholder={`Max available: ${listing.quantity} kg`}
                    max={listing.quantity}
                    min="1"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-green outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => setShowInterestForm(false)}
                    className="w-full border border-gray-200 hover:bg-gray-50 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-2.5 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submittingLead ? t.submitting : t.expressInterest}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListingDetail;
