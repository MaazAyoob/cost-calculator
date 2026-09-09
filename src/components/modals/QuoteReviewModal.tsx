import React, { useState } from 'react';
import { X, UploadCloud, FileCheck, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuoteReviewModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [fileUploaded, setFileUploaded] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploaded(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B3D34]/40 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-2xl border border-[#E5E7EB] max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl text-left relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="space-y-1.5 pr-6">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F28C28] bg-[rgba(242,140,40,0.1)] px-2 py-0.5 rounded border border-[#F28C28]/20">
                OFFERING #3 &bull; CONTRACTOR QUOTE REVIEW
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B3D34] font-heading tracking-tight">
                Should I sign this?
              </h2>
              <p className="text-xs text-[#4B5563]">
                Professional quote review, market rate benchmarking, clause risk analysis, and negotiation support before you appoint a contractor.
              </p>
            </div>

            {/* Price Card */}
            <div className="p-4 bg-[#F8F8F6] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider block">One-time consultation</span>
                <span className="text-2xl font-black text-[#1B3D34] font-mono">₹8,999</span>
                <span className="text-[10px] text-[#4B5563] ml-1">all inclusive</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#1B3D34] bg-white px-2.5 py-1 rounded border border-[#E5E7EB] font-mono">
                  48-Hour Turnaround
                </span>
              </div>
            </div>

            {/* Scope Features */}
            <div className="space-y-2 text-xs text-[#1B3D34]">
              <span className="font-bold text-[11px] uppercase tracking-wider text-[#4B5563] block">
                What Hutty QS Engineers do for you:
              </span>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Line-by-Line Rate Verification:</strong> Compare contractor unit rates against verified wholesale materials &amp; labor benchmarks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Identify Unclear or Missing Items:</strong> Detect excluded scope (e.g. soil testing, temporary power, compound wall) that trigger surprise extra bills later.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Negotiation &amp; Payment Stage Advice:</strong> Restructure milestone payment terms to keep cash flow safe and contractor accountable.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1B3D34] shrink-0 mt-0.5" />
                  <span><strong>Agreement &amp; Contract Clause Review:</strong> Ensure standard penalty, defect liability, and delay protection terms are included.</span>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-[#E5E7EB]">
              {/* File Upload Shell */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B3D34] block">Upload Contractor Quote / PDF / Excel</label>
                <label className="border-2 border-dashed border-[#1B3D34]/30 hover:border-[#1B3D34] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#F8F8F6]">
                  <UploadCloud className="w-6 h-6 text-[#1B3D34] mb-1" />
                  <span className="text-xs font-bold text-[#1B3D34]">
                    {fileUploaded ? fileUploaded : 'Click to select quote document'}
                  </span>
                  <span className="text-[10px] text-[#4B5563]">PDF, Excel, Word or Scanned Images up to 25MB</span>
                  <input type="file" onChange={handleFileChange} className="hidden" />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#1B3D34] block">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#1B3D34] block">Specific Concerns or Questions (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Is the steel rate too high? Does the quote include foundation excavation?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E7EB] bg-[#F8F8F6] focus:bg-white focus:outline-none focus:border-[#1B3D34]"
                />
              </div>

              <button
                type="submit"
                className="w-full hutty-btn-primary py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Get a Second Opinion — ₹8,999</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </form>
          </>
        ) : (
          /* Submission Confirmation */
          <div className="text-center space-y-5 py-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] border border-[#1B3D34]/20 flex items-center justify-center mx-auto">
              <FileCheck className="w-7 h-7 text-[#1B3D34]" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1B3D34] bg-[rgba(27,61,52,0.08)] px-2.5 py-1 rounded">
                QUOTE RECEIVED FOR REVIEW
              </span>
              <h3 className="text-2xl font-extrabold text-[#1B3D34] font-heading">
                We're reviewing your quote.
              </h3>
              <p className="text-xs text-[#4B5563] max-w-sm mx-auto leading-relaxed">
                A senior Hutty Quantity Survey engineer will audit the quote line items, compare with market benchmarks, and contact <strong>{phone}</strong> within 48 hours with a detailed redline report.
              </p>
            </div>

            <button
              onClick={onClose}
              className="hutty-btn-secondary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
