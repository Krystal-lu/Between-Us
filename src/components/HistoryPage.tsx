import React, { useState } from 'react';
import { History, Eye, ArrowRight, RotateCcw, Clock, FileText } from 'lucide-react';
import { SavedDraft, Revision } from '../types';

interface HistoryPageProps {
  drafts: SavedDraft[];
  onOpenDraft: (draft: SavedDraft) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ drafts, onOpenDraft }) => {
  const [selectedRevision, setSelectedRevision] = useState<{
    draft: SavedDraft;
    revision: Revision;
  } | null>(null);

  // Flatten all revisions with their draft context
  const allRevisions = drafts.flatMap((d) =>
    d.revisions.map((rev) => ({
      draft: d,
      revision: rev,
    }))
  ).sort((a, b) => b.revision.timestamp - a.revision.timestamp);

  return (
    <div id="history-page" className="max-w-5xl mx-auto py-10 px-8">
      <div className="border-b border-[#E6E4DE] pb-6 mb-6">
        <h1 className="text-2xl font-serif font-semibold text-[#1C1B18] tracking-tight">
          Writing History & Timeline
        </h1>
        <p className="text-xs text-[#63615C] mt-1">
          Chronological timeline of all draft versions, tone iterations, and surgical rewrites.
        </p>
      </div>

      {allRevisions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#D8D6CF] bg-white text-xs text-[#7A7873]">
          No revisions recorded yet. Revisions are created automatically whenever you draft, switch modes, or rewrite.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline list */}
          <div className="lg:col-span-2 space-y-3">
            {allRevisions.map(({ draft, revision }) => {
              const isSelected = selectedRevision?.revision.id === revision.id;
              const dateStr = new Date(revision.timestamp).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
              });
              const timeStr = new Date(revision.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={revision.id}
                  id={`history-rev-${revision.id}`}
                  onClick={() => setSelectedRevision({ draft, revision })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#242A33] bg-white shadow-2xs'
                      : 'border-[#E6E4DE] bg-white/80 hover:border-[#CDCBC4]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#1C1B18]">
                        {draft.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F0EFEB] text-[#55534E]">
                        v{revision.versionNumber} · {revision.mode}
                      </span>
                    </div>

                    <span className="text-[11px] text-[#8E8C86]">
                      {dateStr}, {timeStr}
                    </span>
                  </div>

                  {revision.label && (
                    <div className="text-[11px] text-[#546274] mb-1 font-medium">
                      ↳ {revision.label}
                    </div>
                  )}

                  <p className="text-xs text-[#63615C] line-clamp-2 font-serif">
                    {revision.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Detailed Preview Column */}
          <div className="sticky top-6 self-start">
            <div className="p-5 rounded-xl border border-[#E6E4DE] bg-white">
              <h2 className="text-xs font-semibold text-[#484642] uppercase tracking-wider mb-3">
                Version Preview
              </h2>

              {selectedRevision ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs font-medium text-[#1C1B18] mb-0.5">
                      {selectedRevision.draft.title} (v{selectedRevision.revision.versionNumber})
                    </div>
                    <div className="text-[11px] text-[#7A7873]">
                      Mode: {selectedRevision.revision.mode} · {selectedRevision.draft.context.format}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] text-xs font-serif leading-relaxed text-[#1C1B18] whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {selectedRevision.revision.content}
                  </div>

                  <button
                    onClick={() => onOpenDraft(selectedRevision.draft)}
                    className="w-full py-2 px-3 rounded-lg bg-[#242A33] hover:bg-black text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Open in Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-[#8E8C86]">
                  Select any version on the left to inspect its full text.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
