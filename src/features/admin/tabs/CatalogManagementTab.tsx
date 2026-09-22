import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Eye,
  Check,
  Building,
} from 'lucide-react';
import { useAdminStore } from '../../../store/useAdminStore';
import { Brand, MaterialProduct, TileMetadata, CatalogDisplayType } from '../../../types/catalog';
import { cn, formatCurrency } from '../../../utils/cn';
import { resolveImageUrl } from '../../../utils/imageUrl';
import { rateService } from '../../../calculation-engine/data/rateService';

export const CatalogManagementTab: React.FC = () => {
  const {
    catalogBrands,
    catalogProducts,
    isLoadingCatalog,
    catalogError,
    saveBrand,
    deleteBrand,
    saveProduct,
    deleteProduct,
    uploadCatalogImage,
    rates,
  } = useAdminStore();

  const [activeSubTab, setActiveSubTab] = useState<'products' | 'brands'>('products');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrandId, setSelectedBrandId] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [selectedDisplayType, setSelectedDisplayType] = useState<'ALL' | 'compact' | 'visual'>('ALL');

  // Modal states
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<MaterialProduct> | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Available categories
  const categories = [
    { id: 'steel', label: 'Steel (TMT Rebar)' },
    { id: 'cement', label: 'Cement (OPC / PPC)' },
    { id: 'masonry', label: 'Masonry (AAC Blocks / Bricks)' },
    { id: 'flooring', label: 'Flooring & Tiles' },
    { id: 'wall-tiles', label: 'Wall & Dado Tiles' },
    { id: 'doors', label: 'Doors' },
    { id: 'windows', label: 'Windows' },
    { id: 'paint', label: 'Paint & Finishes' },
    { id: 'electrical', label: 'Electrical (Wires & Switches)' },
    { id: 'bathroom', label: 'Bathroom Fixtures' },
  ];

  // Filtered products
  const filteredProducts = useMemo(() => {
    return catalogProducts.filter((p) => {
      if (selectedCategory !== 'ALL' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedBrandId !== 'ALL' && p.brandId !== selectedBrandId) return false;
      if (selectedStatus === 'ACTIVE' && !p.active) return false;
      if (selectedStatus === 'INACTIVE' && p.active) return false;
      if (selectedDisplayType !== 'ALL') {
        const visualCategories = ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'];
        const pType = p.displayType || (visualCategories.includes((p.category || '').toLowerCase().trim()) ? 'visual' : 'compact');
        if (pType !== selectedDisplayType) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchCode = (p.productCode || '').toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchCode) return false;
      }
      return true;
    });
  }, [catalogProducts, selectedCategory, selectedBrandId, selectedStatus, selectedDisplayType, searchQuery]);

  // Handle Image Upload file reader
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'brand' | 'product') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File size exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const uploadedUrl = await uploadCatalogImage(base64, file.name);
      setIsUploading(false);
      if (uploadedUrl) {
        if (target === 'brand') {
          setEditingBrand((prev) => ({ ...prev, logoUrl: uploadedUrl }));
        } else {
          setEditingProduct((prev) => ({ ...prev, imageUrl: uploadedUrl }));
        }
      } else {
        setFormError('Image upload failed. Check image format.');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Brand
  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name || !editingBrand.name.trim()) {
      setFormError('Brand name is required.');
      return;
    }

    const success = await saveBrand(editingBrand);
    if (success) {
      setIsBrandModalOpen(false);
      setEditingBrand(null);
      setFormError(null);
    }
  };

  // Submit Product
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (!editingProduct?.category) {
      setFormError('Category is required.');
      return;
    }

    const success = await saveProduct(editingProduct);
    if (success) {
      setIsProductModalOpen(false);
      setEditingProduct(null);
      setFormError(null);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* ── HEADER & NAVIGATION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1B3D34] font-heading tracking-tight">
            Visual Catalog & Brand Management
          </h2>
          <p className="text-xs sm:text-sm text-[#4B5563]">
            Manage manufacturer brand logos, visual product images, tile aesthetics, and Rate Master links.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => setActiveSubTab('products')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubTab === 'products'
                ? 'bg-white text-[#1B3D34] shadow-xs'
                : 'text-[#4B5563] hover:text-[#1B3D34]'
            )}
          >
            Products ({catalogProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('brands')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
              activeSubTab === 'brands'
                ? 'bg-white text-[#1B3D34] shadow-xs'
                : 'text-[#4B5563] hover:text-[#1B3D34]'
            )}
          >
            Brands ({catalogBrands.length})
          </button>
        </div>
      </div>

      {catalogError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-medium">
          {catalogError}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1. PRODUCTS & TILES VIEW                                            */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'products' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, SKU, or brand..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl text-[#1B3D34] focus:outline-hidden focus:ring-2 focus:ring-[#1B3D34]/20"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[#1B3D34] font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[#1B3D34] font-medium"
              >
                <option value="ALL">All Brands</option>
                {catalogBrands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedDisplayType}
                onChange={(e) => setSelectedDisplayType(e.target.value as any)}
                className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[#1B3D34] font-medium"
              >
                <option value="ALL">All Display Types</option>
                <option value="compact">Compact Material</option>
                <option value="visual">Visual Product</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="text-xs bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-2.5 py-1.5 text-[#1B3D34] font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  const defaultCat = selectedCategory !== 'ALL' ? selectedCategory : 'flooring';
                  const isVisual = ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'].includes(defaultCat);
                  setEditingProduct({
                    name: '',
                    category: defaultCat,
                    displayType: isVisual ? 'visual' : 'compact',
                    brandId: selectedBrandId !== 'ALL' ? selectedBrandId : (catalogBrands[0]?.id || null),
                    unit: defaultCat === 'steel' ? 'kg' : defaultCat === 'cement' ? 'Bag' : defaultCat === 'masonry' ? 'Block' : 'sq.ft',
                    rate: 100,
                    active: true,
                    displayOrder: catalogProducts.length + 1,
                    metadataJson: isVisual ? { size: '600 × 600 mm', finish: 'Matt', material: 'Vitrified', thickness: '9 mm' } : undefined,
                  });
                  setIsProductModalOpen(true);
                  setFormError(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-[#1B3D34] text-white text-xs font-bold shadow-xs hover:bg-[#153029] transition-all flex items-center gap-1.5 ml-auto md:ml-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Material / Product</span>
              </button>
            </div>
          </div>

          {/* Product Cards Table / Grid */}
          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider font-semibold">
                    <th className="p-3 w-16">Visual</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Display Type</th>
                    <th className="p-3">Specification / Tile Attributes</th>
                    <th className="p-3 text-right">Unit Rate</th>
                    <th className="p-3">Rate Link</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3F4F6]">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-[#6B7280]">
                        No catalog products match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const brand = catalogBrands.find((b) => b.id === p.brandId);
                      const tileMeta = p.metadataJson;
                      const visualCategories = ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'];
                      const pDisplayType = p.displayType || (visualCategories.includes((p.category || '').toLowerCase().trim()) ? 'visual' : 'compact');

                      return (
                        <tr key={p.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="p-3">
                            <div className="w-12 h-12 rounded-lg bg-[#F3F4F6] border border-[#E5E7EB] overflow-hidden flex items-center justify-center">
                              {p.imageUrl ? (
                                <img
                                  src={resolveImageUrl(p.imageUrl)}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-[#9CA3AF]" />
                              )}
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="font-extrabold text-[#1B3D34] block">
                              {p.name}
                            </span>
                            {p.productCode && (
                              <span className="text-[10px] font-mono text-[#6B7280]">
                                SKU: {p.productCode}
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              {brand?.logoUrl && (
                                <img
                                  src={resolveImageUrl(brand.logoUrl)}
                                  alt=""
                                  className="w-4 h-4 object-contain"
                                />
                              )}
                              <span className="font-semibold text-[#1B3D34]">
                                {brand?.name || p.brand || '—'}
                              </span>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#374151] font-mono text-[10px] border border-[#E5E7EB]">
                              {p.category}
                            </span>
                          </td>

                          <td className="p-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                pDisplayType === 'visual'
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              )}
                            >
                              {pDisplayType === 'visual' ? 'Visual Product' : 'Compact'}
                            </span>
                          </td>

                          <td className="p-3">
                            <span className="text-[#374151] block font-medium">
                              {p.specification || 'Standard'}
                            </span>
                            {tileMeta && (
                              <span className="text-[10px] text-[#6B7280] block">
                                {[tileMeta.size, tileMeta.finish, tileMeta.material]
                                  .filter(Boolean)
                                  .join(' • ')}
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <span className="font-bold text-[#1B3D34] font-mono block">
                              ₹{p.rate}
                            </span>
                            <span className="text-[10px] text-[#6B7280]">
                              /{p.unit}
                            </span>
                          </td>

                          <td className="p-3">
                            {p.rateId ? (
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-mono rounded border border-emerald-200">
                                {p.rateId}
                              </span>
                            ) : (
                              <span className="text-[10px] text-[#9CA3AF] italic">
                                Base Rate
                              </span>
                            )}
                          </td>

                          <td className="p-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                                p.active
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                              )}
                            >
                              {p.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(p);
                                  setIsProductModalOpen(true);
                                  setFormError(null);
                                }}
                                className="p-1 rounded-lg hover:bg-[#E5E7EB] text-[#4B5563]"
                                title="Edit Product"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Deactivate product "${p.name}"?`)) {
                                    deleteProduct(p.id);
                                  }
                                }}
                                className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                                title="Deactivate / Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2. BRANDS VIEW                                                      */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'brands' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
            <span className="text-xs text-[#4B5563] font-medium">
              Configured Brands: <strong>{catalogBrands.length}</strong>
            </span>

            <button
              type="button"
              onClick={() => {
                setEditingBrand({
                  name: '',
                  active: true,
                  displayOrder: catalogBrands.length + 1,
                });
                setIsBrandModalOpen(true);
                setFormError(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#1B3D34] text-white text-xs font-bold shadow-xs hover:bg-[#153029] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Brand</span>
            </button>
          </div>

          <div className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[#4B5563] uppercase tracking-wider font-semibold">
                  <th className="p-3 w-16">Logo</th>
                  <th className="p-3">Brand Name</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-center">Order</th>
                  <th className="p-3 text-center">Products</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {catalogBrands.map((b) => {
                  const brandProductsCount = catalogProducts.filter((p) => p.brandId === b.id).length;

                  return (
                    <tr key={b.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="p-3">
                        <div className="w-12 h-8 rounded bg-white border border-[#E5E7EB] p-1 flex items-center justify-center overflow-hidden">
                          {b.logoUrl ? (
                            <img
                              src={resolveImageUrl(b.logoUrl)}
                              alt={b.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Building className="w-4 h-4 text-[#9CA3AF]" />
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-extrabold text-[#1B3D34] block">{b.name}</span>
                        {b.website && (
                          <a
                            href={b.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#1B3D34] hover:underline flex items-center gap-1"
                          >
                            <span>Website</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="p-3">
                        <span className="text-[#6B7280] line-clamp-1 max-w-sm">
                          {b.description || 'No description provided.'}
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-[#1B3D34]">
                        {b.displayOrder}
                      </td>

                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#1B3D34] font-bold text-[10px]">
                          {brandProductsCount}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
                            b.active
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                          )}
                        >
                          {b.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingBrand(b);
                              setIsBrandModalOpen(true);
                              setFormError(null);
                            }}
                            className="p-1 rounded-lg hover:bg-[#E5E7EB] text-[#4B5563]"
                            title="Edit Brand"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Delete brand "${b.name}"?`)) {
                                deleteBrand(b.id);
                              }
                            }}
                            className="p-1 rounded-lg hover:bg-rose-100 text-rose-600"
                            title="Delete Brand"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* BRAND MODAL                                                         */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isBrandModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <h3 className="text-lg font-black text-[#1B3D34]">
                {editingBrand.id ? 'Edit Brand' : 'Add Brand'}
              </h3>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="text-[#6B7280] hover:text-[#1B3D34]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleBrandSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  placeholder="e.g. Kajaria, Tata Tiscon"
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#1B3D34]/20"
                />
              </div>

              {/* Logo Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1B3D34]">
                    Brand Company Logo
                  </label>
                  {editingBrand.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingBrand({ ...editingBrand, logoUrl: null })}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-xl bg-white border border-[#E5E7EB] flex items-center justify-center overflow-hidden p-1 shadow-2xs">
                    {editingBrand.logoUrl ? (
                      <img
                        src={resolveImageUrl(editingBrand.logoUrl)}
                        alt="Logo preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <Building className="w-5 h-5 text-[#9CA3AF]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] text-[#1B3D34] hover:bg-[#E5E7EB] text-xs font-bold transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Logo File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'brand')}
                      />
                    </label>
                    <input
                      type="url"
                      value={editingBrand.logoUrl || ''}
                      onChange={(e) => setEditingBrand({ ...editingBrand, logoUrl: e.target.value })}
                      placeholder="Or paste company logo URL"
                      className="w-full px-2.5 py-1 text-[11px] border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingBrand.description || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, description: e.target.value })}
                  placeholder="Brand details & quality standard..."
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#1B3D34]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Website (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingBrand.website || ''}
                    onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingBrand.displayOrder || 1}
                    onChange={(e) => setEditingBrand({ ...editingBrand, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="brandActive"
                  checked={editingBrand.active !== false}
                  onChange={(e) => setEditingBrand({ ...editingBrand, active: e.target.checked })}
                  className="rounded text-[#1B3D34]"
                />
                <label htmlFor="brandActive" className="text-xs font-bold text-[#1B3D34] cursor-pointer">
                  Active in Customer Calculator
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1B3D34] text-white hover:bg-[#153029] shadow-sm"
                >
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* PRODUCT MODAL WITH TILE-SPECIFIC FIELDS                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div>
                <h3 className="text-lg font-black text-[#1B3D34]">
                  {editingProduct.id ? 'Edit Material Product' : 'Add Material Product'}
                </h3>
                <span className="text-[11px] text-[#6B7280]">
                  Configure visual attributes, specifications, and calculation engine rate links.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#6B7280] hover:text-[#1B3D34]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="space-y-4 text-left">
              {/* Category and Brand Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={editingProduct.category || 'flooring'}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      const isVisual = ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'].includes(newCat.toLowerCase());
                      setEditingProduct({
                        ...editingProduct,
                        category: newCat,
                        displayType: isVisual ? 'visual' : 'compact',
                        unit: newCat === 'steel' ? 'kg' : newCat === 'cement' ? 'Bag' : newCat === 'masonry' ? 'Block' : 'sq.ft',
                      });
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Manufacturer / Brand
                  </label>
                  <select
                    value={editingProduct.brandId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brandId: e.target.value || null })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl font-medium"
                  >
                    <option value="">No Specific Brand</option>
                    {catalogBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Display Type Presentation Mode */}
              <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB] space-y-1.5">
                <label className="block text-xs font-extrabold text-[#1B3D34]">
                  Presentation Display Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, displayType: 'compact' })}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                      editingProduct.displayType === 'compact'
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', editingProduct.displayType === 'compact' ? 'bg-[#F28C28]' : 'bg-[#CBD5E1]')} />
                    <span>Compact Material</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct({ ...editingProduct, displayType: 'visual' })}
                    className={cn(
                      'p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer',
                      editingProduct.displayType === 'visual'
                        ? 'bg-[#1B3D34] text-white border-[#1B3D34] shadow-xs'
                        : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:bg-[#F3F4F6]'
                    )}
                  >
                    <span className={cn('w-2 h-2 rounded-full', editingProduct.displayType === 'visual' ? 'bg-[#F28C28]' : 'bg-[#CBD5E1]')} />
                    <span>Visual Product</span>
                  </button>
                </div>
                <span className="text-[10px] text-[#6B7280] block">
                  {editingProduct.displayType === 'visual'
                    ? 'Visual Product: displays large product surface photograph with small company logo. Best for tiles, cladding, marble, granite.'
                    : 'Compact Material: displays small company logo, grade/specifications, and unit price (no large product photo). Best for steel, cement, masonry blocks, paint.'}
                </span>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                  Product / Material Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  placeholder="e.g. Kajaria Urban Stone Grey Matt"
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#1B3D34]/20"
                />
              </div>

              {/* Product Image Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#1B3D34]">
                    Product Surface Photograph / Image
                  </label>
                  {editingProduct.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, imageUrl: null })}
                      className="text-[10px] font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      <span>Remove Image</span>
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 aspect-16/10 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center overflow-hidden">
                    {editingProduct.imageUrl ? (
                      <img
                        src={resolveImageUrl(editingProduct.imageUrl)}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-[#9CA3AF]" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F3F4F6] text-[#1B3D34] hover:bg-[#E5E7EB] text-xs font-bold transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'product')}
                      />
                    </label>
                    <input
                      type="url"
                      value={editingProduct.imageUrl || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, imageUrl: e.target.value })}
                      placeholder="Or paste external CDN image URL"
                      className="w-full px-2.5 py-1 text-[11px] border border-[#E5E7EB] rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Specifications, Unit, Base Rate */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Specification / Grade
                  </label>
                  <input
                    type="text"
                    value={editingProduct.specification || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, specification: e.target.value })}
                    placeholder="e.g. Premium Vitrified / Fe 550D"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit || 'sq.ft'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="e.g. sq.ft, kg, Bag, Block"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Catalog Base Rate (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.rate ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, rate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              {/* Authoritative Rate Master Linking Section */}
              <div className="bg-[#F8F9FA] p-3 rounded-2xl border border-[#E5E7EB] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-[#1B3D34]">
                    Rate Master Link (Authoritative Calculation Engine Item)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Source of Truth
                  </span>
                </div>
                <select
                  value={editingProduct.rateId || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, rateId: e.target.value || null })}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E7EB] rounded-xl font-mono"
                >
                  <option value="">No Rate Master Link (Uses Catalog Direct Base Rate)</option>
                  {rates.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.category}] {r.name} &bull; Base ₹{r.rate}/{r.unit} ({r.id})
                    </option>
                  ))}
                </select>

                {/* Real-time Effective Rate Preview */}
                {editingProduct.rateId && (
                  <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                    <div>
                      <span className="font-bold block">Current Effective Rate:</span>
                      <span className="text-[10px] text-emerald-700">
                        Resolved via canonical Rate Master (includes active admin overrides)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-emerald-900">
                        ₹{rateService.getEffectiveRate(editingProduct.rateId, { packageTier: 'PREMIUM', location: 'Bangalore' })}
                      </span>
                      <span className="text-[10px] text-emerald-700"> / {editingProduct.unit || 'unit'}</span>
                    </div>
                  </div>
                )}

                <span className="text-[10px] text-[#6B7280] block">
                  Authoritative pricing continues to resolve through the canonical Rate Master.
                </span>
              </div>

              {/* ── TILE / SURFACE ARCHITECTURAL FIELDS ── */}
              {(editingProduct.displayType === 'visual' ||
                ['flooring', 'wall-tiles', 'cladding', 'granite', 'marble', 'stone'].includes(
                  (editingProduct.category || '').toLowerCase()
                )) && (
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#FDFDFC] p-3.5 space-y-2.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#1B3D34] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F28C28]" />
                    Visual Surface Architectural Specifications
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Tile Dimensions (Size)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.metadataJson?.size || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: { ...editingProduct.metadataJson, size: e.target.value },
                          })
                        }
                        placeholder="e.g. 600 × 600 mm"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Surface Finish
                      </label>
                      <input
                        type="text"
                        value={editingProduct.metadataJson?.finish || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: { ...editingProduct.metadataJson, finish: e.target.value },
                          })
                        }
                        placeholder="e.g. Matt, High-Gloss, Anti-skid"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Material Composition
                      </label>
                      <input
                        type="text"
                        value={editingProduct.metadataJson?.material || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: { ...editingProduct.metadataJson, material: e.target.value },
                          })
                        }
                        placeholder="e.g. Glazed Vitrified, Granite"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Colorway
                      </label>
                      <input
                        type="text"
                        value={editingProduct.metadataJson?.colour || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: { ...editingProduct.metadataJson, colour: e.target.value },
                          })
                        }
                        placeholder="e.g. Stone Grey, Statuario"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Thickness
                      </label>
                      <input
                        type="text"
                        value={editingProduct.metadataJson?.thickness || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: { ...editingProduct.metadataJson, thickness: e.target.value },
                          })
                        }
                        placeholder="e.g. 9 mm, 16 mm"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-[#6B7280] mb-0.5">
                        Box Coverage (sq.ft)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingProduct.metadataJson?.coveragePerBoxSqFt || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            metadataJson: {
                              ...editingProduct.metadataJson,
                              coveragePerBoxSqFt: parseFloat(e.target.value) || undefined,
                            },
                          })
                        }
                        placeholder="e.g. 15.5"
                        className="w-full px-2.5 py-1.5 text-xs border border-[#E5E7EB] rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    SKU / Product Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.productCode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productCode: e.target.value })}
                    placeholder="e.g. KAJ-URB-6060"
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={editingProduct.displayOrder || 1}
                    onChange={(e) => setEditingProduct({ ...editingProduct, displayOrder: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B3D34] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Architectural material description & finish details..."
                  className="w-full px-3 py-2 text-xs border border-[#E5E7EB] rounded-xl focus:ring-2 focus:ring-[#1B3D34]/20"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="productActive"
                  checked={editingProduct.active !== false}
                  onChange={(e) => setEditingProduct({ ...editingProduct, active: e.target.checked })}
                  className="rounded text-[#1B3D34]"
                />
                <label htmlFor="productActive" className="text-xs font-bold text-[#1B3D34] cursor-pointer">
                  Active in Customer Catalog (Visible in Calculator)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#4B5563] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1B3D34] text-white hover:bg-[#153029] shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
