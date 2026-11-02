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
            ? 'bg-[#F8F8F6]/95 backdrop-blur-md border-[#E5E7EB] py-2.5 shadow-xs'
            : 'bg-[#F8F8F6] border-[#E5E7EB] py-3.5'
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

          {/* Desktop Navigation: Elegant, Restrained & Homeowner-First */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Main Navigation">
            <button
              onClick={() => handleNav('/how-it-works')}
              className={`text-sm transition-colors cursor-pointer py-1 font-semibold relative ${
                isCurrent('/how-it-works')
                  ? 'text-[#183B32] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#C66B4E] after:rounded-full'
                  : 'text-[#66716B] hover:text-[#18211E]'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => handleNav('/pricing')}
              className={`text-sm transition-colors cursor-pointer py-1 font-semibold relative ${
                isCurrent('/pricing')
                  ? 'text-[#183B32] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#C66B4E] after:rounded-full'
                  : 'text-[#66716B] hover:text-[#18211E]'
              }`}
            >
              Pricing
            </button>

            <button
              onClick={() => handleNav('/consult')}
              className={`text-sm transition-colors cursor-pointer py-1 font-semibold relative ${
                isCurrent('/consult')
                  ? 'text-[#183B32] font-bold after:content-[\'\'] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2.5px] after:bg-[#C66B4E] after:rounded-full'
                  : 'text-[#66716B] hover:text-[#18211E]'
              }`}
            >
              Consult an Expert
            </button>
          </nav>

          {/* Right Action Block: Account & Primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
                /* Authenticated Customer Pill */
                <div className="relative" onMouseLeave={() => setAccountDropdown(false)}>
                  <button
                    type="button"
                    onClick={() => setAccountDropdown(!accountDropdown)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#183B32] bg-[#E8EFE9] border border-[#B7CDBB]/80 hover:bg-[#D5E5DC] transition-colors cursor-pointer select-none"
                    title="My Customer Account"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#183B32]" />
                    <span className="truncate max-w-[120px]">{user?.name?.split(' ')[0] || 'My Account'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${accountDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {accountDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      <div className="px-3 py-2 border-b border-[#E5E7EB]/70">
                        <span className="block text-xs font-bold text-[#183B32] truncate">{user?.name}</span>
                        <span className="block text-[11px] text-[#66716B] truncate">{user?.email}</span>
                      </div>

                      <button
                        onClick={() => {
                          setAccountDropdown(false);
                          navigate('/account?tab=projects');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#183B32] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FolderKanban className="w-3.5 h-3.5 text-[#183B32]" />
                          My Projects
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#66716B]" />
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdown(false);
                          navigate('/account?tab=reports');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#183B32] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-[#183B32]" />
                          My Reports
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#66716B]" />
                      </button>

                      <button
                        onClick={() => {
                          setAccountDropdown(false);
                          navigate('/account?tab=profile');
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#183B32] hover:bg-[#F8F8F6] flex items-center justify-between cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <UserIcon className="w-3.5 h-3.5 text-[#183B32]" />
                          Profile &amp; Settings
                        </span>
                        <ArrowRight className="w-3 h-3 text-[#66716B]" />
                      </button>

                      <div className="pt-1 border-t border-[#E5E7EB]/70">
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
                  className="hidden sm:inline-flex text-xs sm:text-sm font-bold text-[#183B32] hover:text-[#C66B4E] px-3 py-2 transition-colors cursor-pointer min-h-[44px] items-center"
                >
                  Log In
                </button>
              )
            }

            <button
              onClick={() => {
                useWizardStore.getState().startNewProject();
                navigate('/calculator');
              }}
              className="bg-[#183B32] hover:bg-[#245747] text-white text-xs sm:text-sm font-bold px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer shadow-xs active:scale-[0.98] flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              <span className="hidden xs:inline">Plan Your Home</span>
              <span className="xs:hidden">Plan</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C66B4E]" />
            </button>

            {/* Mobile Menu Toggle Button (44px min touch target) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl lg:hidden text-[#18211E] hover:bg-[rgba(24,59,50,0.06)] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center border border-[#E5E7EB]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#18211E]" /> : <Menu className="w-5 h-5 text-[#18211E]" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[57px] bottom-0 z-50 bg-[#F8F8F6] flex flex-col border-t border-[#E5E7EB] animate-in fade-in slide-in-from-top-3 duration-200">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {/* Authenticated Customer Card in Mobile Menu */}
              {isAuthenticated ? (
                  <div className="p-4 bg-white rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#183B32] text-white flex items-center justify-center font-bold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-bold text-[#183B32] block truncate">{user?.name}</span>
                        <span className="text-xs text-[#66716B] block truncate">{user?.email}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]/70">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/account?tab=projects');
                        }}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-[#183B32] bg-[#F8F8F6] hover:bg-[#E8EFE9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-[#183B32]" />
                        <span>My Projects</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/account?tab=reports');
                        }}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-[#183B32] bg-[#F8F8F6] hover:bg-[#E8EFE9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#183B32]" />
                        <span>My Reports</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          navigate('/account?tab=profile');
                        }}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-[#183B32] bg-[#F8F8F6] hover:bg-[#E8EFE9] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-[#183B32]" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-red-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E5E7EB] flex items-center justify-between mb-2 shadow-2xs">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-[#183B32] block">Already have an account?</span>
                      <span className="text-[11px] text-[#66716B] block">Access saved plans and unlocked reports</span>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/login');
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-[#183B32] bg-[#E8EFE9] hover:bg-[#D5E5DC] transition-colors cursor-pointer"
                    >
                      Log In
                    </button>
                  </div>
                )
              }

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/calculator') || isCurrent('/planner')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Start Free Estimate</span>
                  <p className={`text-xs ${isCurrent('/calculator') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Plot sizing, rooms &amp; real-time cost calculation (no login required)
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/calculator') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>

              <button
                onClick={() => handleNav('/how-it-works')}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/how-it-works')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">How It Works</span>
                  <p className={`text-xs ${isCurrent('/how-it-works') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Step-by-step home planning and cost estimation
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/how-it-works') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>

              <button
                onClick={() => handleNav('/pricing')}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/pricing')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Pricing &amp; Plans</span>
                  <p className={`text-xs ${isCurrent('/pricing') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Free estimate, ₹499 detailed BOQ, ₹1,499 premium
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/pricing') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>

              <button
                onClick={() => handleNav('/consult')}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/consult')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Consult an Expert</span>
                  <p className={`text-xs ${isCurrent('/consult') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Independent architectural reviews &bull; Flat ₹1,499
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/consult') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>

              <button
                onClick={() => handleNav('/professionals/join')}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/professionals')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">For Professionals</span>
                  <p className={`text-xs ${isCurrent('/professionals') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Join Hutty network &bull; Offer independent consultations
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/professionals') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>

              <button
                onClick={() => handleNav('/dashboard')}
                className={`w-full min-h-[52px] text-left p-4 rounded-xl transition-all border flex items-center justify-between cursor-pointer ${
                  isCurrent('/dashboard')
                    ? 'bg-[#183B32] text-white border-[#183B32] shadow-xs'
                    : 'bg-white text-[#18211E] border-[#E5E7EB] hover:bg-[#F8F8F6]'
                }`}
              >
                <div className="space-y-0.5">
                  <span className="text-base font-bold font-heading block">Estimate Summary</span>
                  <p className={`text-xs ${isCurrent('/dashboard') ? 'text-white/80' : 'text-[#66716B]'}`}>
                    Active residence status, quantities &amp; budget
                  </p>
                </div>
                <ArrowRight className={`w-4 h-4 ${isCurrent('/dashboard') ? 'text-[#C66B4E]' : 'text-[#66716B]'}`} />
              </button>
            </div>

            {/* Bottom Sticky Action inside Mobile Drawer */}
            <div className="p-5 border-t border-[#E5E7EB] bg-white">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  useWizardStore.getState().startNewProject();
                  navigate('/calculator');
                }}
                className="w-full bg-[#183B32] hover:bg-[#245747] text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm min-h-[50px] cursor-pointer"
              >
                <span>Plan Your Home</span>
                <ArrowRight className="w-4 h-4 text-[#C66B4E]" />
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
