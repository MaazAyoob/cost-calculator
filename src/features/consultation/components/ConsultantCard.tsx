import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, CheckCircle2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Consultant } from '../../../types/consultation';
import { LAUNCH_CONSULTATION_PRICE_DISPLAY } from '../../../config/consultation';

interface ConsultantCardProps {
  consultant: Consultant;
  onBookClick: (consultant: Consultant) => void;
}

export const ConsultantCard: React.FC<ConsultantCardProps> = ({ consultant, onBookClick }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/consult/${consultant.slug}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] hover:border-[#1B3D34]/30 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Content */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Photo + Info + Category Badge */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            onClick={handleCardClick}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 bg-[#F8F8F6] border border-[#E5E7EB] cursor-pointer"
          >
            {consultant.profileImage ? (
              <img
                src={consultant.profileImage}
                alt={consultant.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-lg text-[#1B3D34] bg-[#1B3D34]/10">
                {consultant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Titles */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[rgba(27,61,52,0.12)]">
                {consultant.category}
              </span>
              {consultant.featured && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F28C28]/15 text-[#F28C28] flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Featured</span>
                </span>
              )}
            </div>

            <h3
              onClick={handleCardClick}
              className="text-base sm:text-lg font-bold text-[#1B3D34] mt-1 truncate hover:text-[#F28C28] transition-colors cursor-pointer font-heading"
            >
              {consultant.name}
            </h3>

            <p className="text-xs text-[#4B5563] truncate mt-0.5">{consultant.title}</p>

            <div className="flex items-center gap-3 text-xs text-[#4B5563] mt-2">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#1B3D34]/70" />
                <span>{consultant.experienceYears}+ yrs exp</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 truncate">
                <MapPin className="w-3.5 h-3.5 text-[#1B3D34]/70" />
                <span>{consultant.city}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Short About Preview */}
        <p className="text-xs text-[#4B5563] line-clamp-3 leading-relaxed">
          {consultant.about}
        </p>

        {/* Specializations Tags */}
        {consultant.specializations && consultant.specializations.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">
              Specialties
            </span>
            <div className="flex flex-wrap gap-1.5">
              {consultant.specializations.slice(0, 3).map((spec, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F8F8F6] text-[#1B3D34] border border-[#E5E7EB]"
                >
                  {spec}
                </span>
              ))}
              {consultant.specializations.length > 3 && (
                <span className="text-[10px] text-[#4B5563] self-center">
                  +{consultant.specializations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Card Footer: Fee + Action Buttons */}
      <div className="px-5 py-4 sm:px-6 bg-[#F8F8F6]/70 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#4B5563] tracking-wider block">
            Consultation Fee
          </span>
          <span className="text-base sm:text-lg font-mono font-extrabold text-[#1B3D34]">
            {LAUNCH_CONSULTATION_PRICE_DISPLAY}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCardClick}
            className="px-3 py-2 rounded-xl text-xs font-bold text-[#1B3D34] hover:bg-white border border-[#E5E7EB] transition-colors cursor-pointer"
          >
            View Profile
          </button>

          <button
            type="button"
            onClick={() => onBookClick(consultant)}
            className="hutty-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>Book</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
          </button>
        </div>
      </div>
    </div>
  );
};
