import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Menu, X, ChevronDown, User as UserIcon, LogOut, FolderKanban, FileText } from 'lucide-react';
import { useWizardStore } from '../../store/useWizardStore';
import { useCustomerAuthStore } from '../../store/useCustomerAuthStore';
import { HuttyLogo } from '../brand/HuttyLogo';
import { QuoteReviewModal } from '../modals/QuoteReviewModal';
import { BuildTrackingModal } from '../modals/BuildTrackingModal';

export const WebsiteHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useCustomerAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [offeringsDropdown, setOfferingsDropdown] = useState(false);
  const [accountDropdown, setAccountDropdown] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);

  // Track scroll for architectural sticky transition
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? 'bg-[#F8F8F6]/95 backdrop-blur-md border-[#E3E8E2] py-2.5 shadow-xs'
            : 'bg-[#F8F8F6] border-[#E3E8E2] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-6">

          {/* Hutty Logo */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => handleNav('/')}
              className="cursor-pointer shrink-0 transition-transform active:scale-[0.98]"
              role="link"
              aria-label="Hutty — Home"
            >
              <HuttyLogo variant="full" width={105} className="hidden sm:block" />
              <HuttyLogo variant="full" width={92} className="sm:hidden" />
            </div>
          </div>

          {/* Desktop Navigation: Clean, Architectural & Reference-Aligned */}
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
            <button
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  navigate('/');
                }
              }}
              className={`text-sm transition-colors cursor-pointer relative py-1 ${
                location.pathname === '/' || isCurrent('/calculator') || isCurrent('/planner')
                  ? 'text-[#1B3D34] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#F28C28] after:rounded-full'
                  : 'text-[#687770] font-medium hover:text-[#172722]'
              }`}
            >
              Calculate
            </button>

            <button
              onClick={() => handleNav('/consult')}
              className={`text-sm transition-colors cursor-pointer relative py-1 ${
                isCurrent('/consult')
                  ? 'text-[#1B3D34] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#F28C28] after:rounded-full'
                  : 'text-[#687770] font-medium hover:text-[#172722]'
              }`}
            >
              Consult
            </button>

            <button
              onClick={() => handleNav('/pricing')}
              className={`text-sm transition-colors cursor-pointer relative py-1 ${
                isCurrent('/pricing')
                  ? 'text-[#1B3D34] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#F28C28] after:rounded-full'
                  : 'text-[#687770] font-medium hover:text-[#172722]'
              }`}
            >
              Pricing
            </button>

            <button
              onClick={() => {
                if (location.pathname === '/') {
                  const el = document.getElementById('how-it-works') || document.querySelector('section:nth-of-type(3)');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  navigate('/#how-it-works');
                }
              }}
              className="text-sm text-[#687770] font-medium hover:text-[#172722] transition-colors cursor-pointer py-1"
            >
              How It Works
            </button>

            <button
              onClick={() => handleNav('/professionals/join')}
              className={`text-sm transition-colors cursor-pointer relative py-1 ${
                isCurrent('/professionals')
                  ? 'text-[#1B3D34] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#F28C28] after:rounded-full'
                  : 'text-[#687770] font-medium hover:text-[#172722]'
              }`}
            >
              For Professionals
            </button>

            {/* Resources Dropdown */}
            <div className="relative" onMouseLeave={() => setOfferingsDropdown(false)}>
              <button
                type="button"
                onClick={() => setOfferingsDropdown(!offeringsDropdown)}
                className="text-sm text-[#687770] font-medium hover:text-[#172722] transition-colors cursor-pointer py-1 flex items-center gap-1 select-none"
              >
                <span>Resources</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${offeringsDropdown ? 'rotate-180 text-[#1B3D34]' : 'text-[#687770]'}`} />
              </button>

              {offeringsDropdown && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#E3E8E2] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      handleNav('/dashboard');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                  >
                    <span>My Project Dashboard</span>
                    <ArrowRight className="w-3 h-3 text-[#687770]" />
                  </button>
                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      if (location.pathname === '/') {
                        const el = document.getElementById('standards') || document.querySelector('section:nth-of-type(10)');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/#standards');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                  >
                    <span>Engineering Standards</span>
                    <ArrowRight className="w-3 h-3 text-[#687770]" />
                  </button>
                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      if (location.pathname === '/') {
                        const el = document.getElementById('material-prices') || document.querySelector('section:nth-of-type(11)');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/#material-prices');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                  >
                    <span>Live Material Prices</span>
                    <ArrowRight className="w-3 h-3 text-[#687770]" />
                  </button>
                  <button
                    onClick={() => {
                      setOfferingsDropdown(false);
                      if (location.pathname === '/') {
                        const el = document.getElementById('faq') || document.querySelector('section:nth-of-type(12)');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      } else {
                        navigate('/#faq');
                      }
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                  >
                    <span>Planning &amp; BOQ FAQ</span>
                    <ArrowRight className="w-3 h-3 text-[#687770]" />
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Block: Account & Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              /* Authenticated Customer Pill */
              <div className="relative" onMouseLeave={() => setAccountDropdown(false)}>
                <button
                  type="button"
                  onClick={() => setAccountDropdown(!accountDropdown)}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1B3D34] bg-[#EBF3EF] border border-[#D5E5DC] hover:bg-[#DDF0E5] transition-colors cursor-pointer select-none"
                  title="My Customer Account"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#1B3D34]" />
                  <span className="truncate max-w-[120px]">{user?.name?.split(' ')[0] || 'My Account'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${accountDropdown ? 'rotate-180' : ''}`} />
                </button>

                {accountDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-[#E3E8E2] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                    <div className="px-3 py-2 border-b border-[#EDF2EE]">
                      <span className="block text-xs font-bold text-[#1B3D34] truncate">{user?.name}</span>
                      <span className="block text-[11px] text-[#687770] truncate">{user?.email}</span>
                    </div>

                    <button
                      onClick={() => {
                        setAccountDropdown(false);
                        navigate('/account?tab=projects');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FolderKanban className="w-3.5 h-3.5 text-[#1B3D34]" />
                        My Projects
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#687770]" />
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdown(false);
                        navigate('/account?tab=reports');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#1B3D34]" />
                        My Reports
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#687770]" />
                    </button>

                    <button
                      onClick={() => {
                        setAccountDropdown(false);
                        navigate('/account?tab=profile');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#1B3D34] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-[#1B3D34]" />
                        Profile &amp; Settings
                      </span>
                      <ArrowRight className="w-3 h-3 text-[#687770]" />
                    </button>

                    <div className="pt-1 border-t border-[#EDF2EE]">
                      <button
                        onClick={() => {
                          setAccountDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Public Visitor Log In Link */
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex text-xs sm:text-sm font-bold text-[#1B3D34] hover:text-[#F28C28] px-3 py-2 transition-colors cursor-pointer"
              >
                Log In
              </button>
            )}

            <button
              onClick={() => {
                if (isAuthenticated) {
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                } else {
                  navigate('/login?redirect=/calculator');
                }
              }}
              className="bg-[#1B3D34] hover:bg-[#142E27] text-white text-xs sm:text-sm font-bold px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-1.5 shrink-0"
            >
              <span className="hidden xs:inline">Start Free Estimate</span>
              <span className="xs:hidden">Estimate</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#F28C28]" />
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg lg:hidden text-[#172722] hover:bg-[rgba(27,61,52,0.06)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E3E8E2]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#172722]" /> : <Menu className="w-5 h-5 text-[#172722]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-50 bg-[#F8F8F6] flex flex-col border-t border-[#E3E8E2] animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {/* Authenticated Customer Card in Mobile Menu */}
              {isAuthenticated ? (
                <div className="p-4 bg-white rounded-2xl border border-[#D5E5DC] shadow-xs space-y-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1B3D34] text-white flex items-center justify-center font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-bold text-[#1B3D34] block truncate">{user?.name}</span>
                      <span className="text-xs text-[#687770] block truncate">{user?.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EDF2EE]">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/account?tab=projects');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#1B3D34] bg-[#F8F8F6] hover:bg-[#EBF3EF] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <FolderKanban className="w-3.5 h-3.5 text-[#1B3D34]" />
                      <span>My Projects</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/account?tab=reports');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#1B3D34] bg-[#F8F8F6] hover:bg-[#EBF3EF] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#1B3D34]" />
                      <span>My Reports</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/account?tab=profile');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#1B3D34] bg-[#F8F8F6] hover:bg-[#EBF3EF] flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#1B3D34]" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-white rounded-2xl border border-[#E3E8E2] flex items-center justify-between mb-2 shadow-2xs">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-[#1B3D34] block">Already have an account?</span>
                    <span className="text-[11px] text-[#687770] block">Access saved plans and unlocked reports</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-[#1B3D34] bg-[#EDF3ED] hover:bg-[#DDF4E7] transition-colors cursor-pointer"
                  >
                    Log In
                  </button>
                </div>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    useWizardStore.getState().startNewProject();
                    navigate('/calculator');
                  } else {
                    navigate('/login?redirect=/calculator');
                  }
                }}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/calculator') || isCurrent('/planner')
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                    : 'bg-white text-[#172722] border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Calculate Estimate</span>
                  <p className={`text-xs ${isCurrent('/calculator') ? 'text-white/80' : 'text-[#687770]'}`}>
                    Plot sizing, spaces &amp; live cost calculation
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/calculator') ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              </button>

              <button
                onClick={() => handleNav('/consult')}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/consult')
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                    : 'bg-white text-[#172722] border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Consult an Expert</span>
                  <p className={`text-xs ${isCurrent('/consult') ? 'text-white/80' : 'text-[#687770]'}`}>
                    Independent architectural reviews &bull; Flat ₹1,499
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/consult') ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              </button>

              <button
                onClick={() => handleNav('/pricing')}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/pricing')
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                    : 'bg-white text-[#172722] border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Pricing &amp; Plans</span>
                  <p className={`text-xs ${isCurrent('/pricing') ? 'text-white/80' : 'text-[#687770]'}`}>
                    Free estimate, ₹499 detailed BOQ, ₹1,499 premium
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/pricing') ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              </button>

              <button
                onClick={() => handleNav('/professionals/join')}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/professionals')
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                    : 'bg-white text-[#172722] border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">For Professionals</span>
                  <p className={`text-xs ${isCurrent('/professionals') ? 'text-white/80' : 'text-[#687770]'}`}>
                    Join Hutty network &bull; Offer independent consultations
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/professionals') ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              </button>

              <button
                onClick={() => handleNav('/dashboard')}
                className={`w-full text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/dashboard')
                    ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                    : 'bg-white text-[#172722] border-[#E3E8E2] hover:bg-[rgba(27,61,52,0.04)]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Estimate Summary</span>
                  <p className={`text-xs ${isCurrent('/dashboard') ? 'text-white/80' : 'text-[#687770]'}`}>
                    Active residence status, quantities &amp; budget
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/dashboard') ? 'text-[#F28C28]' : 'text-[#687770]'}`} />
              </button>
            </div>

            {/* Bottom Sticky Action inside Mobile Drawer */}
            <div className="p-5 border-t border-[#E3E8E2] bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (isAuthenticated) {
                    useWizardStore.getState().startNewProject();
                    navigate('/calculator');
                  } else {
                    navigate('/login?redirect=/calculator');
                  }
                }}
                className="w-full hutty-btn-primary py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm min-h-[50px] cursor-pointer"
              >
                <span>Start Free Estimate</span>
                <ArrowRight className="w-4 h-4 text-[#F28C28]" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <QuoteReviewModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      />
      <BuildTrackingModal
        isOpen={showTrackModal}
        onClose={() => setShowTrackModal(false)}
      />
    </>
  );
};