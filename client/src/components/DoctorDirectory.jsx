import React, { useState, useEffect } from 'react';
import { getDoctors, getDoctorSlots } from '../services/doctorService';
import {
  Star,
  MapPin,
  Calendar,
  Video,
  Clock,
  Search,
  Filter,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  User,
  Building2,
  AlertCircle,
} from 'lucide-react';
import AppointmentBookingModal from './AppointmentBookingModal';

export default function DoctorDirectory({ onDoctorSelect, onBookingSuccess }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const specialtiesList = [
    { label: 'All Specialties', value: '' },
    { label: 'Cardiology', value: 'Cardiology' },
    { label: 'Endocrinology', value: 'Endocrinology' },
    { label: 'Neurology', value: 'Neurology' },
    { label: 'Internal Medicine', value: 'Internal Medicine' },
  ];

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (specialty) params.specialty = specialty;
      if (searchTerm) params.search = searchTerm;
      params.limit = 20;

      const response = await getDoctors(params);
      setDoctors(response.data?.doctors || []);
    } catch (err) {
      setError(err.message || 'Failed to load clinicians.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleViewSlots = async (doctor) => {
    try {
      setSelectedDoctor(doctor);
      setSlotsLoading(true);
      const response = await getDoctorSlots(doctor._id);
      setSlots(response.data?.slots || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // View: Doctor Slot Scheduling / Availability Drawer
  if (selectedDoctor) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => setSelectedDoctor(null)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Specialist Directory
        </button>

        {/* Doctor Summary Banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-xl font-black shadow-sm shrink-0">
              {selectedDoctor.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{selectedDoctor.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedDoctor.specialty}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {selectedDoctor.rating || 4.9}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  {selectedDoctor.hospital}
                </span>
                <span>•</span>
                <span>{selectedDoctor.experienceYears}+ Yrs Experience</span>
                <span>•</span>
                <span className="font-bold text-slate-800">Fee: ₹{selectedDoctor.consultationFee}</span>
              </div>
            </div>
          </div>
        </div>

        {bookingSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl mb-6 flex items-center justify-between text-xs font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Appointment requested successfully! You can track this in "My Appointments".</span>
            </div>
            <button onClick={() => setBookingSuccess(false)} className="text-emerald-700 hover:text-emerald-900 text-lg leading-none">
              ×
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600" />
            Bookable Availability Slots
          </h3>
          <span className="text-xs text-slate-500">{slots.length} available slots found</span>
        </div>

        {slotsLoading ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <div className="w-8 h-8 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Checking clinician calendar...</p>
          </div>
        ) : slots.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            No open slots found for this specialist. Please check back shortly.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot) => (
              <div
                key={slot._id}
                className="bg-white border border-slate-200 hover:border-teal-500 rounded-xl p-4 transition-all shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-extrabold text-slate-800 flex items-center justify-between">
                    <span>{formatDate(slot.date)}</span>
                    {slot.consultationType === 'video' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        <Video className="w-3 h-3" /> Video
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">
                        In-Clinic
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-black text-teal-800 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>

                <button
                  onClick={() => setBookingSlot(slot)}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        )}

        {bookingSlot && (
          <AppointmentBookingModal
            slot={bookingSlot}
            doctor={selectedDoctor}
            onClose={() => setBookingSlot(null)}
            onSuccess={() => {
              setBookingSlot(null);
              setBookingSuccess(true);
              handleViewSlots(selectedDoctor);
              if (onBookingSuccess) onBookingSuccess();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 tracking-wider uppercase mb-1">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>Specialist Roster</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verified Healthcare Specialists
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified clinicians, evaluate credentials, and schedule in-person or video consultations.
          </p>
        </div>

        {/* Search input */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name or hospital..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-medium text-slate-900"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Specialty Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4">
        {specialtiesList.map((sp) => {
          const isActive = specialty === sp.value;
          return (
            <button
              key={sp.value}
              onClick={() => setSpecialty(sp.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {sp.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-slate-200 rounded-2xl"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-10 bg-slate-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
          <Stethoscope className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No specialists found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doctor) => {
            const initials = doctor.fullName
              ? doctor.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')
              : 'DR';

            return (
              <div
                key={doctor._id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* Doctor Card Top */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white text-lg font-black shadow-sm shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-extrabold text-slate-900 truncate">
                        {doctor.fullName}
                      </h3>
                      <div className="text-xs font-semibold text-teal-700 mt-0.5">
                        {doctor.specialty}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {doctor.experienceYears}+ Years Clinical Practice
                      </div>
                    </div>
                  </div>

                  {/* Hospital affiliation */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doctor.hospital}</span>
                  </div>

                  {/* Rating & Fee */}
                  <div className="flex items-center justify-between text-xs mb-5">
                    <div className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{doctor.rating || 4.9}</span>
                      <span className="text-slate-400 font-normal">({doctor.reviewsCount || 42})</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-slate-400">Consultation Fee: </span>
                      <span className="font-extrabold text-slate-900">₹{doctor.consultationFee || 1000}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleViewSlots(doctor)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>View Available Slots</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
