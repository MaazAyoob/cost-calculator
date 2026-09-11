import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { containerStaggerVariant, itemFadeUpVariant } from '../../animations/variants';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileText,
  FileSpreadsheet,
  Table2,
  Link2,
  Download,
  Check,
  Loader2,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { getApiUrl } from '../../config/api';

interface DownloadItem {
  id: string;
  title: string;
  description: string;
  format: string;
  size: string;
  icon: React.ReactNode;
  status: 'ready' | 'generating' | 'done';
  colorScheme: 'blue' | 'emerald' | 'amber' | 'indigo';
}

const colorSchemes: Record<string, { bg: string; border: string; iconBg: string; btn: string }> = {
  blue: { bg: 'bg-blue-50/60', border: 'border-blue-200/80', iconBg: 'bg-blue-100 text-blue-700', btn: 'bg-blue-600 hover:bg-blue-500 text-white' },
  emerald: { bg: 'bg-emerald-50/60', border: 'border-emerald-200/80', iconBg: 'bg-emerald-100 text-emerald-700', btn: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
  amber: { bg: 'bg-amber-50/60', border: 'border-amber-200/80', iconBg: 'bg-amber-100 text-amber-700', btn: 'bg-amber-600 hover:bg-amber-500 text-white' },
  indigo: { bg: 'bg-indigo-50/60', border: 'border-indigo-200/80', iconBg: 'bg-indigo-100 text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-500 text-white' },
};

const initialDownloads: DownloadItem[] = [
  {
    id: 'dl-1',
    title: 'Executive Planning Report (PDF)',
    description: 'Comprehensive bank-loan ready specification & financial roadmap with BOQ, payment schedule, and material grades.',
    format: 'PDF',
    size: '~2.4 MB',
    icon: <FileText className="w-5 h-5" />,
    status: 'ready',
    colorScheme: 'blue',
  },
  {
    id: 'dl-2',
    title: 'Full Bill of Quantities (Excel)',
    description: 'Itemized BOQ across all 13 stages with unit rates, quantities, brand specifications, and total amounts.',
    format: 'XLSX',
    size: '~850 KB',
    icon: <FileSpreadsheet className="w-5 h-5" />,
    status: 'ready',
    colorScheme: 'emerald',
  },
  {
    id: 'dl-3',
    title: 'Material Schedule (CSV)',
    description: 'Flat material list with brands, grades, quantities, and cost estimates — compatible with site management tools.',
    format: 'CSV',
    size: '~120 KB',
    icon: <Table2 className="w-5 h-5" />,
    status: 'ready',
    colorScheme: 'amber',
  },
  {
    id: 'dl-4',
    title: 'Shareable Project Link',
    description: 'Generate a read-only shareable link to this project workspace for your architect, contractor or bank manager.',
    format: 'Link',
    size: 'Instant',
    icon: <Link2 className="w-5 h-5" />,
    status: 'ready',
    colorScheme: 'indigo',
  },
];

export const DownloadsTab: React.FC = () => {
  const [downloads, setDownloads] = useState(initialDownloads);
  const [sharedLink, setSharedLink] = useState('');

  const triggerAnchorDownload = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownload = async (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'generating' } : d))
    );

    try {
      if (id === 'dl-1') {
        // PDF Report — opens in new tab (server returns HTML)
        window.open(getApiUrl('/api/v1/download/pdf?name=Dream%20Home%20Villa&city=Bangalore'), '_blank');
      } else if (id === 'dl-2') {
        // Excel — trigger file download
        triggerAnchorDownload(getApiUrl('/api/v1/download/excel'), 'cost_calculator_report.xlsx');
      } else if (id === 'dl-3') {
        // CSV — trigger file download
        triggerAnchorDownload(getApiUrl('/api/v1/download/csv?type=boq'), 'cost_calculator_boq.csv');
      } else if (id === 'dl-4') {
        // Shareable link — simulated (no auth system yet)
        await new Promise((r) => setTimeout(r, 1200));
        setSharedLink('https://costcalculator.app/share/CC-2026-0891-x7f3k');
      }

      // Small delay so user can see the spinner briefly
      await new Promise((r) => setTimeout(r, id === 'dl-4' ? 0 : 800));

      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'done' } : d))
      );
    } catch {
      // On any network error, revert to ready
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: 'ready' } : d))
      );
    }
  };

  const reset = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'ready' } : d))
    );
    if (id === 'dl-4') setSharedLink('');
  };

  return (
    <motion.div
      variants={containerStaggerVariant}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemFadeUpVariant}>
        <div className="p-6 rounded-2xl bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold">
              <Download className="w-3 h-3" /> Download Center
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Export Your Construction Plan
            </h2>
            <p className="text-slate-300 text-sm max-w-xl">
              Download bank-ready reports, full BOQ spreadsheets, material schedules, and shareable project links for your contractor and bank manager.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Preliminary QS Estimate</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Bank Loan Disbursement Friendly</span>
              <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-400" /> Contractor-Ready Format</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Download Cards */}
      <motion.div variants={itemFadeUpVariant} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {downloads.map((item) => {
          const scheme = colorSchemes[item.colorScheme];
          return (
            <Card
              key={item.id}
              className={`border transition-all duration-200 ${item.status === 'done' ? 'border-emerald-300 shadow-soft-md' : scheme.border}`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${scheme.iconBg}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {item.format}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.size}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>

                {/* Shared link display */}
                {item.id === 'dl-4' && sharedLink && (
                  <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-200/60 flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="text-[11px] font-mono text-indigo-700 truncate">{sharedLink}</span>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(sharedLink);
                        } catch {
                          // fallback for browsers without clipboard API
                          const el = document.createElement('textarea');
                          el.value = sharedLink;
                          document.body.appendChild(el);
                          el.select();
                          document.execCommand('copy');
                          document.body.removeChild(el);
                        }
                      }}
                      className="shrink-0 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 border border-indigo-300 px-2 py-0.5 rounded-md transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <StatusBadge
                    status={item.status === 'done' ? 'success' : item.status === 'generating' ? 'warning' : 'neutral'}
                    label={item.status === 'done' ? 'Generated' : item.status === 'generating' ? 'Generating...' : 'Ready to Generate'}
                  />
                  <div className="flex items-center gap-2">
                    {item.status === 'done' && (
                      <button
                        onClick={() => reset(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Reset"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Button
                      size="sm"
                      disabled={item.status === 'generating'}
                      onClick={() => handleDownload(item.id)}
                      leftIcon={
                        item.status === 'generating' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : item.status === 'done' ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : item.id === 'dl-4' ? (
                          <Share2 className="w-3.5 h-3.5" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )
                      }
                      className={item.status === 'done' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : ''}
                    >
                      {item.status === 'generating'
                        ? 'Generating...'
                        : item.status === 'done'
                        ? item.id === 'dl-4'
                          ? 'Link Generated'
                          : 'Download File'
                        : item.id === 'dl-4'
                        ? 'Generate Link'
                        : 'Generate & Download'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Notice */}
      <motion.div variants={itemFadeUpVariant}>
        <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/60 text-xs text-blue-800 flex items-start gap-3">
          <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-0.5">Reports are generated from your configured project data</div>
            <p className="text-blue-700">
              All reports use the specifications from your planning wizard — plot size, house type, quality tier, and material brand selections.
              PDF and Excel outputs are formatted for submission to your bank loan officer or site contractor.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
