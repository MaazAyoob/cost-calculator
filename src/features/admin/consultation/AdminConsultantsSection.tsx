import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  MapPin,
  Briefcase,
  UserCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useConsultationStore } from '../../../store/useConsultationStore';
import { useAdminStore } from '../../../store/useAdminStore';
import { Consultant } from '../../../types/consultation';
import {
  LAUNCH_CONSULTATION_CATEGORIES,
  LAUNCH_CONSULTATION_PRICE_DISPLAY,
} from '../../../config/consultation';

export const AdminConsultantsSection: React.FC = () => {
  const { token } = useAdminStore();
  const {
    adminConsultants,
    fetchAdminConsultants,
    createAdminConsultant,
    updateAdminConsultant,
    toggleConsultantStatus,
    isAdminLoading,
    adminError,
    adminSuccessMessage,
    clearAdminMessages,
  } = useConsultationStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State for Add / Edit Consultant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>(LAUNCH_CONSULTATION_CATEGORIES[0]);
  const [formExperienceYears, setFormExperienceYears] = useState(5);
  const [formCity, setFormCity] = useState('Bangalore');
  const [formServiceAreas, setFormServiceAreas] = useState('Indiranagar, Koramangala, Whitefield');
  const [formAbout, setFormAbout] = useState('');
  const [formSpecializations, setFormSpecializations] = useState('');
  const [formServices, setFormServices] = useState('');
  const [formProfileImage, setFormProfileImage] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveToken = token || 'dev-admin-mock-token-2026';

  useEffect(() => {
    fetchAdminConsultants(effectiveToken);
  }, [fetchAdminConsultants, effectiveToken]);

  const handleOpenAddModal = () => {
    setEditingConsultant(null);
    setFormName('');
    setFormTitle('');
    setFormCategory(LAUNCH_CONSULTATION_CATEGORIES[0]);
    setFormExperienceYears(8);
    setFormCity('Bangalore');
    setFormServiceAreas('All Bangalore');
    setFormAbout('');
    setFormSpecializations('Residential Architecture, Plan Review');
    setFormServices('Floor Plan Review, Drawing Vetting');
    setFormProfileImage('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80');
    setFormActive(true);
    setFormFeatured(false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (consultant: Consultant) => {
    setEditingConsultant(consultant);
    setFormName(consultant.name);
    setFormTitle(consultant.title);
    setFormCategory(consultant.category);
    setFormExperienceYears(consultant.experienceYears);
    setFormCity(consultant.city);
    setFormServiceAreas(consultant.serviceAreas.join(', '));
    setFormAbout(consultant.about);
    setFormSpecializations(consultant.specializations.join(', '));
    setFormServices(consultant.services.join(', '));
    setFormProfileImage(consultant.profileImage || '');
    setFormActive(consultant.active);
    setFormFeatured(consultant.featured);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formName.trim() || !formTitle.trim() || !formAbout.trim()) {
      setFormError('Name, Title, and About section are required.');
      return;
    }

    const payload = {
      name: formName.trim(),
      title: formTitle.trim(),
      category: formCategory,
      experienceYears: Number(formExperienceYears),
      city: formCity.trim(),
      serviceAreas: formServiceAreas.split(',').map((s) => s.trim()).filter(Boolean),
      about: formAbout.trim(),
      specializations: formSpecializations.split(',').map((s) => s.trim()).filter(Boolean),
      services: formServices.split(',').map((s) => s.trim()).filter(Boolean),
      profileImage: formProfileImage.trim() || null,
      active: formActive,
      featured: formFeatured,
    };

    try {
      if (editingConsultant) {
        await updateAdminConsultant(editingConsultant.id, payload, effectiveToken);
      } else {
        await createAdminConsultant(payload, effectiveToken);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Operation failed');
    }
  };

  const handleToggleActive = async (consultant: Consultant) => {
    try {
      await toggleConsultantStatus(consultant.id, !consultant.active, effectiveToken);
    } catch (err: any) {
      console.error(err);
    }
  };

  const filteredConsultants = adminConsultants.filter((c) => {
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold font-heading text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#1B3D34]" />
            <span>Consultant Directory Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manually add, update, activate, and feature Hutty-approved architects, engineers, and specialists.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="hutty-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4 text-[#F28C28]" />
          <span>Add New Consultant</span>
        </button>
      </div>

      {/* Notifications */}
      {adminError && (
        <div className="p-4 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{adminError}</span>
          </div>
          <button onClick={clearAdminMessages} className="text-red-500 font-bold">×</button>
        </div>
      )}

      {adminSuccessMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{adminSuccessMessage}</span>
          </div>
          <button onClick={clearAdminMessages} className="text-emerald-500 font-bold">×</button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by consultant name, title, or city..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34] focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1B3D34] font-medium cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {LAUNCH_CONSULTATION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Consultants Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Expert Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Standard Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredConsultants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                    No consultants found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredConsultants.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {c.profileImage ? (
                            <img src={c.profileImage} alt={c.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-slate-700">
                              {c.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{c.name}</span>
                            {c.featured && (
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#F28C28]/20 text-[#F28C28]">
                                Featured
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">{c.title}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {c.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {c.experienceYears} Years
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {c.city}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {LAUNCH_CONSULTATION_PRICE_DISPLAY}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(c)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          c.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Click to toggle Active / Inactive"
                      >
                        {c.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(c)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={`/consult/${c.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="View Public Profile"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Consultant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 my-8 text-left space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 font-heading">
                {editingConsultant ? `Edit Consultant: ${editingConsultant.name}` : 'Add New Consultant'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ar. Ramesh Nambiar"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34] bg-white"
                  >
                    {LAUNCH_CONSULTATION_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Professional Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Principal Residential Architect"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience (Years) *</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={formExperienceYears}
                    onChange={(e) => setFormExperienceYears(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City / Region *</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="e.g. Bangalore"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profile Photo Image URL</label>
                  <input
                    type="url"
                    value={formProfileImage}
                    onChange={(e) => setFormProfileImage(e.target.value)}
                    placeholder="https://... (Unsplash or secure CDN URL)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Areas (Comma separated)</label>
                <input
                  type="text"
                  value={formServiceAreas}
                  onChange={(e) => setFormServiceAreas(e.target.value)}
                  placeholder="e.g. Indiranagar, Koramangala, Whitefield, All Bangalore"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">About &amp; Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={formAbout}
                  onChange={(e) => setFormAbout(e.target.value)}
                  placeholder="Detailed credentials, background, and practical philosophy..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34] resize-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Specializations (Comma separated)</label>
                <input
                  type="text"
                  value={formSpecializations}
                  onChange={(e) => setFormSpecializations(e.target.value)}
                  placeholder="e.g. Luxury Villas, Vastu Compliance, Setback Optimization"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Consultation Services (Comma separated)</label>
                <input
                  type="text"
                  value={formServices}
                  onChange={(e) => setFormServices(e.target.value)}
                  placeholder="e.g. Architectural Plan Review, BOQ Rate Verification"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1B3D34]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formActive}
                    onChange={(e) => setFormActive(e.target.checked)}
                    className="rounded text-[#1B3D34] focus:ring-emerald-600"
                  />
                  <span>Active for Public Directory &amp; Bookings</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="rounded text-[#1B3D34] focus:ring-emerald-600"
                  />
                  <span>Featured Profile</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdminLoading}
                  className="hutty-btn-primary px-5 py-2 rounded-xl font-bold cursor-pointer disabled:opacity-50"
                >
                  {isAdminLoading ? 'Saving...' : editingConsultant ? 'Update Profile' : 'Create Consultant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
