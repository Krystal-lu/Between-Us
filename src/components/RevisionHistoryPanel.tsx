import React, { useState } from 'react';
import { History, RotateCcw, Eye, X, Check } from 'lucide-react';
import { Revision } from '../types';

interface RevisionHistoryPanelProps {
  revisions: Revision[];
  activeVersionNumber: number;
  onRestore: (revision: Revision) => void;
  onClose: () => void;
}

export const RevisionHistoryPanel: React.FC<RevisionHistoryPanelProps> = ({
  revisions,
  activeVersionNumber,
  onRestore,
  onClose,
}) => {
  const [previewRevision, setPreviewRevision] = useState<Revision | null>(null);

  // Sort descending by version number
  const sortedRevisions = [...revisions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div
      id="revision-history-panel"
      className="w-80 shrink-0 border-l border-[#E6E4DE] bg-[#FAF9F6] h-full overflow-y-auto flex flex-col justify-between select-text animate-fadeIn"
    >
      <div>
        {/* Header */}
        <div className="p-4 border-b border-[#E6E4DE] flex items-center justify-between sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2 text-[#242A33]">
            <History className="w-4 h-4 text-[#546274]" />
            <h3 className="text-sm font-semibold tracking-tight">Revision History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#7A7873] hover:text-[#1C1B18] hover:bg-[#EAE8E2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of Revisions */}
        <div className="p-4 space-y-3">
          {sortedRevisions.map((rev) => {
            const isCurrent = rev.versionNumber === activeVersionNumber;
            const timeStr = new Date(rev.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            const dateStr = new Date(rev.timestamp).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={rev.id}
                className={`p-3 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'border-[#242A33] bg-white shadow-2xs'
                    : 'border-[#E6E4DE] bg-white/70 hover:border-[#CDCBC4]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C1B18]">
                      Version {rev.versionNumber}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-[#242A33] text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F0EFEB] text-[#63615C]">
                    {rev.mode}
                  </span>
                </div>

                <p className="text-[11px] text-[#7A7873] mb-2">
                  {dateStr} at {timeStr}
                </p>

                <p className="text-xs text-[#55534E] line-clamp-2 font-serif italic mb-3 bg-[#F9F8F5] p-1.5 rounded">
                  "{rev.content}"
                </p>

                <div className="flex items-center gap-2 pt-1 border-t border-[#F0EFEB]">
                  <button
                    onClick={() =>
                      setPreviewRevision(previewRevision?.id === rev.id ? null : rev)
                    }
                    className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-[#F4F3EF] hover:bg-[#EAE8E2] text-[#484642] transition-colors flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{previewRevision?.id === rev.id ? 'Hide' : 'Preview'}</span>
                  </button>

                  {!isCurrent && (
                    <button
                      onClick={() => onRestore(rev)}
                      className="flex-1 py-1 px-2 rounded text-[11px] font-medium bg-[#242A33] hover:bg-black text-white transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restore</span>
                    </button>
                  )}
                </div>

                {/* Inline preview expansion */}
                {previewRevision?.id === rev.id && (
                  <div className="mt-2.5 p-2 rounded bg-[#FAF9F5] border border-[#DDDBCF] text-xs font-serif leading-relaxed text-[#1C1B18] whitespace-pre-wrap">
                    {rev.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
