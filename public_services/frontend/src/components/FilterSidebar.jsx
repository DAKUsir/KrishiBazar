import React from 'react';
import { Search, SlidersHorizontal, Navigation, RefreshCw } from 'lucide-react';

const FilterSidebar = ({
  filters,
  setFilters,
  onReset,
  t,
  isLocating,
  onGeolocate,
  hasCoordinates
}) => {
  const cropTypes = ['Tomato', 'Potato', 'Rice', 'Cotton', 'Onion', 'Brinjal', 'Chilli'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col gap-6 animate-fade-in">
      {/* Sidebar Header */}
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-brand-green" />
          {t.filterTitle}
        </h3>
        <button
          onClick={onReset}
          className="text-xs font-semibold text-brand-brown hover:text-brand-green flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Free Text Search */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Search</label>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleChange}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 hover:border-gray-200 focus:border-brand-green outline-none text-sm transition-all focus:ring-2 focus:ring-brand-green-light"
          />
        </div>
      </div>

      {/* Geolocate Button */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {t.distance}
        </label>
        <button
          type="button"
          onClick={onGeolocate}
          disabled={isLocating}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
            hasCoordinates
              ? 'bg-brand-green-light border-brand-green text-brand-green-dark'
              : 'bg-gray-50 border-gray-100 hover:bg-brand-green-light hover:border-brand-green text-gray-600 hover:text-brand-green'
          }`}
        >
          <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
          {isLocating
            ? 'Locating...'
            : hasCoordinates
            ? t.locationDetected
            : t.detectLocation}
        </button>

        {hasCoordinates && (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex justify-between text-xs font-medium text-gray-500">
              <span>Max: {filters.maxDist} km</span>
            </div>
            <input
              type="range"
              min="5"
              max="500"
              step="5"
              value={filters.maxDist}
              onChange={(e) => handleSliderChange('maxDist', e.target.value)}
              className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-green"
            />
          </div>
        )}
      </div>

      {/* Crop Selector */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.cropType}</label>
        <select
          name="crop"
          value={filters.crop}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-100 focus:border-brand-green outline-none text-sm bg-white transition-all focus:ring-2 focus:ring-brand-green-light"
        >
          <option value="">{t.allCrops}</option>
          {cropTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* District Search */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.district}</label>
        <input
          type="text"
          name="district"
          value={filters.district}
          onChange={handleChange}
          placeholder="e.g. Mandya, Mysore"
          className="w-full px-3 py-2.5 rounded-xl border border-gray-100 focus:border-brand-green outline-none text-sm transition-all focus:ring-2 focus:ring-brand-green-light"
        />
      </div>

      {/* Quantity Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>{t.quantityRange}</span>
          <span className="text-brand-green font-bold">{filters.minQty}kg - {filters.maxQty === '5000' ? '5000kg+' : `${filters.maxQty}kg`}</span>
        </div>
        <div className="flex gap-4">
          <input
            type="range"
            min="0"
            max="5000"
            step="100"
            value={filters.maxQty}
            onChange={(e) => handleSliderChange('maxQty', e.target.value)}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-green"
          />
        </div>
      </div>

      {/* Price Slider */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>{t.priceRange}</span>
          <span className="text-brand-green font-bold">₹{filters.minPrice} - ₹{filters.maxPrice === '150' ? '150+' : filters.maxPrice}</span>
        </div>
        <div className="flex gap-4">
          <input
            type="range"
            min="0"
            max="150"
            step="5"
            value={filters.maxPrice}
            onChange={(e) => handleSliderChange('maxPrice', e.target.value)}
            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-brand-green"
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="flex flex-col gap-1.5 pb-2">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.sortBy}</label>
        <select
          name="sort"
          value={filters.sort}
          onChange={handleChange}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-100 focus:border-brand-green outline-none text-sm bg-white transition-all focus:ring-2 focus:ring-brand-green-light"
        >
          <option value="newest">{t.newest}</option>
          <option value="priceAsc">{t.priceLowHigh}</option>
          <option value="priceDesc">{t.priceHighLow}</option>
          <option value="qtyDesc">{t.qtyHighLow}</option>
          {hasCoordinates && (
            <option value="distance">{t.distanceAsc}</option>
          )}
        </select>
      </div>
    </div>
  );
};

export default FilterSidebar;
