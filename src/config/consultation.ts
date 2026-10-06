// ==============================================================================
// Hutty Consultation Configuration (Phase 1 MVP)
// Isolated single source of truth for the launch consultation price
// ==============================================================================

/**
 * Launch consultation price in Indian Rupees (INR)
 * Fixed for launch phase: ₹1,499.
 * The backend remains the authoritative source of truth.
 */
export const LAUNCH_CONSULTATION_PRICE_INR = 1499;

/**
 * Formatted currency label for UI display: "₹1,499"
 */
export const LAUNCH_CONSULTATION_PRICE_DISPLAY = '₹1,499';

export const LAUNCH_CONSULTATION_CATEGORIES = [
  'Architect',
  'Structural Engineer',
  'Contractor',
  'Interior Designer',
  'Approvals Consultant',
  'Quantity Surveyor',
  'Site Supervisor',
] as const;

export const LAUNCH_CONSULTATION_TOPICS = [
  'Plan & Layout Review',
  'Structural Safety & Feasibility',
  'Cost & BOQ Verification',
  'Contractor Quotation Audit',
  'Municipal Approvals & Bylaws',
  'Interior & Finish Consultation',
  'Site Quality & Progress Inspection',
  'General Construction Guidance',
] as const;

export const POPULAR_LOCATIONS = [
  'All Bangalore',
  'Indiranagar',
  'Koramangala',
  'Whitefield',
  'HSR Layout',
  'Jayanagar',
  'Sarjapur Road',
  'Hebbal',
] as const;

export const CURATED_INITIAL_CONSULTANTS = [
  {
    id: 'cons-ar-ramesh',
    slug: 'ar-ramesh-nambiar',
    name: 'Ar. Ramesh Nambiar',
    title: 'Principal Residential Architect',
    category: 'Architect',
    profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    experienceYears: 16,
    city: 'Bangalore',
    serviceAreas: ['Indiranagar', 'Koramangala', 'Whitefield', 'HSR Layout', 'All Bangalore'],
    about:
      'Registered with the Council of Architecture (CoA) with over 16 years leading custom luxury villas and biophilic residential designs across Bangalore. Specializes in maximizing natural ventilation, Vastu compliance, and local BBMP/BMRDA setback adherence.',
    specializations: ['Bespoke Villa Design', 'Vastu-Compliant Space Planning', 'BBMP Setback Optimization', 'Passive Solar Lighting'],
    services: ['Architectural Plan Review', 'Floor Layout Optimization', 'Facade & Elevation Design Review'],
    active: true,
    featured: true,
    displayOrder: 1,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-eng-sneha',
    slug: 'er-sneha-kulkarni',
    name: 'Er. Sneha Kulkarni',
    title: 'Senior Chartered Structural Engineer',
    category: 'Structural Engineer',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    experienceYears: 14,
    city: 'Bangalore',
    serviceAreas: ['All Bangalore', 'Electronic City', 'Sarjapur Road', 'Hebbal'],
    about:
      'M.Tech in Structural Engineering from IISc Bangalore. Independent structural auditor for over 250+ G+2 through G+5 residences. Expert in soil-bearing capacity assessments, earthquake-resistant RCC frame detailing, and steel/cement BOQ audits.',
    specializations: ['RCC Frame & Slab Audit', 'Steel & Cement Quantity Optimization', 'Soil Feasibility & Foundation Design', 'Structural Defect Diagnostics'],
    services: ['Structural Drawing Vetting', 'Steel Factor Review (kg/sqft)', 'Crack & Settlement Risk Assessment'],
    active: true,
    featured: true,
    displayOrder: 2,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-ctr-anand',
    slug: 'anand-vardhan',
    name: 'Anand Vardhan',
    title: 'Class-1 General Contractor & Builder',
    category: 'Contractor',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    experienceYears: 20,
    city: 'Bangalore',
    serviceAreas: ['Jayanagar', 'JP Nagar', 'Kanakapura Road', 'Banashankari'],
    about:
      'Veteran turnkey civil contractor with 20+ years of on-ground residential execution in South Bangalore. Provides objective third-party quote reviews to safeguard homeowners from contractor hidden clauses, inflated item rates, and milestone traps.',
    specializations: ['Contractor Quote Review', 'Turnkey Milestone Verification', 'Labour Rate Audits', 'Site Quality Checklists'],
    services: ['Contractor Quote & Rate Audit', 'Milestone Payment Sanity Check', 'Material Takeoff Verification'],
    active: true,
    featured: true,
    displayOrder: 3,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-int-priya',
    slug: 'priya-sharma',
    name: 'Priya Sharma',
    title: 'Lead Interior Architect & Spatial Consultant',
    category: 'Interior Designer',
    profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    experienceYears: 11,
    city: 'Bangalore',
    serviceAreas: ['North Bangalore', 'Whitefield', 'Indiranagar', 'Bellandur'],
    about:
      'Specialist in modern contemporary residential interiors and modular kitchen efficiency. Helps homeowners evaluate interior quotes, optimize joinery specifications, and avoid excessive vendor markups.',
    specializations: ['Modular Kitchen Ergonomics', 'Joinery & Wardrobe Cost Optimization', 'Lighting & False Ceiling Plans', 'Material Selection Guides'],
    services: ['Interior Quote Audit', 'Electrical & Plumbing Point Alignment', 'Woodwork & Finish Vetting'],
    active: true,
    featured: false,
    displayOrder: 4,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-app-krishna',
    slug: 'm-krishna-murthy',
    name: 'M. Krishna Murthy',
    title: 'Senior Sanction & Approvals Liaison Officer',
    category: 'Approvals Consultant',
    profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    experienceYears: 22,
    city: 'Bangalore',
    serviceAreas: ['BBMP Zones', 'BDA Layouts', 'BMRDA', 'Gram Panchayat'],
    about:
      'Former municipal liaison consultant with in-depth command of Bangalore Revised Master Plan (RMP 2015/2031), BBMP building bylaws, FAR calculations, setback rules, and occupancy certificate (OC/CC) procedures.',
    specializations: ['BBMP Plan Sanction Guidance', 'FAR & Premium FAR Calculation', 'BDA Khata Bifurcation / Transfer', 'NOC & Utility Approvals'],
    services: ['Building Plan Sanction Feasibility', 'Violation & Setback Advisory', 'Bylaw Compliance Review'],
    active: true,
    featured: false,
    displayOrder: 5,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-qs-vinay',
    slug: 'vinay-sundaram',
    name: 'Vinay Sundaram',
    title: 'Certified Quantity Surveyor (MRICS)',
    category: 'Quantity Surveyor',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    experienceYears: 13,
    city: 'Bangalore',
    serviceAreas: ['All Bangalore', 'Mysore', 'Hosur Belt'],
    about:
      'Chartered Quantity Surveyor providing independent Bill of Quantities (BOQ) preparation, rate analysis, and financial cost control to prevent budget overruns during house construction.',
    specializations: ['Detailed BOQ Preparation', 'Rate Analysis & Variance Control', 'Contract Dispute Resolution', 'Material Takeoff (MTO) Audits'],
    services: ['Comprehensive BOQ Verification', 'Material Wastage Audit', 'Budget Cap Feasibility'],
    active: true,
    featured: false,
    displayOrder: 6,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'cons-sup-manjunath',
    slug: 'manjunath-gowda',
    name: 'Manjunath Gowda',
    title: 'Senior Resident Site Supervisor',
    category: 'Site Supervisor',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    experienceYears: 18,
    city: 'Bangalore',
    serviceAreas: ['West Bangalore', 'Rajajinagar', 'Malleshwaram', 'Yeshwanthpur'],
    about:
      'Hands-on construction quality supervisor with expertise in shuttering inspection, slump testing, rebar cover block verification, and curing schedules for residential builds.',
    specializations: ['Shuttering & Rebar Inspection', 'Concrete Slump & Cube Test Verification', 'Waterproofing Application Audit', 'Daily Progress Tracking'],
    services: ['Site Stage Inspection Planning', 'Construction Workmanship Audit', 'Curing & Concrete Quality Review'],
    active: true,
    featured: false,
    displayOrder: 7,
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
];
