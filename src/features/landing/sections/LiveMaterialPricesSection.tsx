import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RotateCw, Sparkles, ShieldCheck, ArrowRight, Layers, MapPin, Database } from 'lucide-react';
import { rateService, PublicBenchmarkRate } from '../../../calculation-engine/data/rateService';
import { formatCurrency } from '../../../utils/cn';
import { useWizardStore } from '../../../store/useWizardStore';

export const LiveMaterialPricesSection: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<'Bengaluru' | 'Mysuru'>('Bengaluru');
  const [selectedPackage, setSelectedPackage] = useState<'Standard' | 'Premium' | 'Luxury'>('Standard');
  const [rates, setRates] = useState<PublicBenchmarkRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  const loadRates = useCallback(async () => {
    setLoading(true);
    try {
      // First try fetching from live public API endpoint
      const items = await rateService.fetchPublicBenchmarkRates(selectedLocation, selectedPackage);
      setRates(items);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsOfflineFallback(false);
    } catch {
      // Graceful fallback to local rateService
      const localItems = rateService.getPublicBenchmarkRates(selectedLocation, selectedPackage);
      setRates(localItems);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setIsOfflineFallback(true);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, selectedPackage]);

  useEffect(() => {
    loadRates();

    // Subscribe to rateService so if an admin changes a price, this section auto-refreshes
    const unsubscribe = rateService.subscribe(() => {
      loadRates();
    });
    return unsubscribe;
  }, [loadRates]);

  const handleApplyToCalculator = () => {
    const store = useWizardStore.getState();
    store.startNewProject();
    store.setCity(selectedLocation === 'Bengaluru' ? 'Bangalore' : 'Mysore');
    store.setSelectedPackage(selectedPackage.toUpperCase() as any);
    navigate('/calculator');
  };

  return (
    <section id="live-prices" className="py-16 sm:py-20 bg-[#F8F8F6] border-y border-[#E5E7EB] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[rgba(27,61,52,0.06)] border border-[#1B3D34]/15 text-[#1B3D34] text-xs font-bold tracking-wide">
              <Database className="w-3.5 h-3.5 text-[#F28C28]" />
              <span>HUTTY PRICING INTELLIGENCE</span>
            </div>
            <h2 className="heading-lg text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1B3D34] tracking-tight font-heading">
              Latest Material Prices
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
              Updated from Hutty&apos;s current pricing database. These authoritative unit rates feed directly into our engineering takeoff and cost calculation engine.
            </p>
          </div>

          {/* Context Controls & Refresh */}
          <div className="flex flex-wrap items-center gap-3 self-start md:self-end">
            
            {/* Location Selector */}
            <div className="inline-flex p-1 bg-white border border-[#E5E7EB] rounded-xl shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedLocation('Bengaluru')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedLocation === 'Bengaluru'
                    ? 'bg-[#1B3D34] text-white'
                    : 'text-[#4B5563] hover:text-[#1B3D34]'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Bengaluru</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocation('Mysuru')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  selectedLocation === 'Mysuru'
                    ? 'bg-[#1B3D34] text-white'
                    : 'text-[#4B5563] hover:text-[#1B3D34]'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Mysuru</span>
              </button>
            </div>

            {/* Package Tier Selector */}
            <div className="inline-flex p-1 bg-white border border-[#E5E7EB] rounded-xl shadow-2xs">
              {(['Standard', 'Premium', 'Luxury'] as const).map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    selectedPackage === pkg
                      ? 'bg-[#1B3D34] text-white'
                      : 'text-[#4B5563] hover:text-[#1B3D34]'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadRates}
              disabled={loading}
              title="Refresh latest rates from server"
              className="p-2 bg-white border border-[#E5E7EB] rounded-xl text-[#4B5563] hover:text-[#1B3D34] hover:bg-[rgba(27,61,52,0.04)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#F28C28]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#4B5563] pb-2 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Active context: <strong className="text-[#1B3D34]">{selectedLocation}</strong> &bull; <strong className="text-[#1B3D34]">{selectedPackage} Tier</strong></span>
            {lastUpdated && <span className="text-[#4B5563]/70 hidden sm:inline">&bull; Last updated: {lastUpdated}</span>}
          </div>
          {isOfflineFallback ? (
            <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Unable to refresh latest prices &bull; Showing cached database rates
            </span>
          ) : (
            <span className="text-[#1B3D34] font-medium hidden sm:inline">
              Authoritative Single Source of Truth
            </span>
          )}
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rates.map((item) => (
            <motion.div
              key={item.rateId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#1B3D34]/40 hover:shadow-xs transition-all text-left"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] bg-[#F8F8F6] px-2 py-0.5 rounded border border-[#E5E7EB]">
                    {item.category}
                  </span>
                  {item.source === 'OVERRIDE' ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[rgba(242,140,40,0.12)] text-[#F28C28] border border-[#F28C28]/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> LIVE OVERRIDE
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-[#4B5563]/70">
                      Hutty Baseline
                    </span>
                  )}
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-[#1B3D34] leading-snug line-clamp-2" title={item.displayName}>
                  {item.displayName}
                </h3>
              </div>

              <div className="pt-4 mt-3 border-t border-[#E5E7EB] flex items-baseline justify-between">
                <div>
                  <span className="text-lg sm:text-xl font-bold font-mono text-[#1B3D34] tracking-tight">
                    {formatCurrency(item.rate)}
                  </span>
                </div>
                <span className="text-xs text-[#4B5563] font-medium">
                  {item.unit}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Verification Banner & Calculator Link */}
        <div className="bg-white border border-[#E5E7EB] rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(27,61,52,0.08)] text-[#1B3D34] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#1B3D34]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#1B3D34]">
                100% Price Consistency Across Hutty
              </h4>
              <p className="text-[11px] text-[#4B5563] leading-relaxed">
                When our quantity surveyors update material rates in the Admin Rate Master, all cost calculations, Bill of Quantities, and public rates update instantly.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyToCalculator}
            className="hutty-btn-primary px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 cursor-pointer w-full sm:w-auto justify-center"
          >
            <span>Estimate With These Rates</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
          </button>
        </div>

      </div>
    </section>
  );
};
