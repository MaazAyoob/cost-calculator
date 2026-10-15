// ==============================================================================
// Hutty Project Save Status Badge
// Unobtrusive indicator showing persistent backend sync state
// ==============================================================================

import React from 'react';
import { CheckCircle2, RefreshCw, AlertCircle, Cloud } from 'lucide-react';
import { AutoSaveStatus } from '../../hooks/useProjectAutoSave';

interface ProjectSaveStatusBadgeProps {
  status: AutoSaveStatus;
  lastSaved?: Date | null;
  onRetry?: () => void;
  className?: string;
}

export const ProjectSaveStatusBadge: React.FC<ProjectSaveStatusBadgeProps> = ({
  status,
  lastSaved,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
        status === 'SAVED'
          ? 'bg-[#EBF3EF] text-[#1B3D34] border border-[#D5E5DC]'
          : status === 'SAVING'
          ? 'bg-amber-50 text-amber-800 border border-amber-200'
          : status === 'ERROR'
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200'
      } ${className}`}
      title={
        lastSaved
          ? `Last saved to cloud at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
          : 'Project auto-save'
      }
    >
      {status === 'SAVED' && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1B3D34]" />
          <span>All changes saved</span>
        </>
      )}

      {status === 'SAVING' && (
        <>
          <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
          <span>Saving…</span>
        </>
      )}

      {status === 'ERROR' && (
        <>
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Unable to save</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="underline font-bold ml-1 hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          )}
        </>
      )}

      {status === 'IDLE' && (
        <>
          <Cloud className="w-3.5 h-3.5 text-gray-400" />
          <span>Cloud sync</span>
        </>
      )}
    </div>
  );
};
