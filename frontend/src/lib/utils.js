import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getSeverityColor(severity) {
  const map = {
    Low: 'text-green-600 bg-green-100 border-green-200',
    Medium: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    High: 'text-orange-600 bg-orange-100 border-orange-200',
    Critical: 'text-red-600 bg-red-100 border-red-200',
  }
  return map[severity] || map.Medium
}

export function formatCurrency(amount, currency = '₹') {
  return `${currency}${Number(amount).toLocaleString('en-IN')}`
}

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'
]

export const SOIL_TYPES = ['Sandy', 'Clay', 'Loam', 'Silt', 'Peaty', 'Chalky', 'Mixed']

export const CROP_LIST = [
  'Tomato', 'Rice', 'Wheat', 'Cotton', 'Onion', 'Potato', 'Maize', 'Sugarcane',
  'Soybean', 'Groundnut', 'Sunflower', 'Mustard', 'Jowar', 'Bajra', 'Turmeric',
  'Ginger', 'Chilli', 'Brinjal', 'Okra', 'Cucumber', 'Watermelon', 'Mango',
  'Banana', 'Grapes', 'Pomegranate', 'Coconut', 'Arecanut', 'Coffee', 'Tea',
]
