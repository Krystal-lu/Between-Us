import React, { useState } from 'react';
import { FileText, Search, Trash2, ArrowRight, Clock, Plus, Filter } from 'lucide-react';
import { SavedDraft } from '../types';

interface DraftsPageProps {
  drafts: SavedDraft[];
  onOpenDraft: (draft: SavedDraft) => void;
  onDeleteDraft: (draftId: string) => void;
  onStartNew: () => void;
}

export const DraftsPage: React.FC<DraftsPageProps> = ({
  drafts,
  onOpenDraft,
  onDeleteDraft,
  onStartNew,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRel, setFilterRel] = useState<string>('all');

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.currentDraft.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRel =
      filterRel === 'all' || d.context.relationship === filterRel;
    return matchesSearch && matchesRel;
  });

  const uniqueRelationships = Array.from(
    new Set(drafts.map((d) => d.context.relationship).filter(Boolean))
  );

  return (
    <div id="drafts-page" className="max-w-5xl mx-auto py-10 px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E6E4DE] pb-6 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-[#1C1B18] tracking-tight">
            Saved Drafts
          </h1>
          <p className="text-xs text-[#63615C] mt-1">
            All drafts and revision threads stored locally in this browser.
          </p>
        </div>

        <button
          onClick={onStartNew}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#242A33] hover:bg-black text-white text-xs font-medium transition-colors shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Message</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8E8C86] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, recipient, or draft text..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#D8D6CF] bg-white text-xs text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors"
          />
        </div>

        {uniqueRelationships.length > 0 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0 text-xs">
            <Filter className="w-3.5 h-3.5 text-[#7A7873]" />
            <select
              value={filterRel}
              onChange={(e) => setFilterRel(e.target.value)}
              className="px-2.5 py-2 rounded-lg border border-[#D8D6CF] bg-white text-xs text-[#484642] focus:outline-none focus:border-[#242A33]"
            >
              <option value="all">All Relationships</option>
              {uniqueRelationships.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* List */}
      {filteredDrafts.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[#D8D6CF] bg-white">
          <FileText className="w-8 h-8 text-[#A8A6A0] mx-auto mb-2" />
          <p className="text-sm text-[#484642] font-medium mb-1">No drafts found</p>
          <p className="text-xs text-[#8E8C86] mb-4">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Create a message to get started.'}
          </p>
          <button
            onClick={onStartNew}
            className="px-4 py-2 bg-[#242A33] text-white rounded-lg text-xs font-medium hover:bg-black"
          >
            Start New Message
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDrafts.map((draft) => {
            const timeStr = new Date(draft.lastModified).toLocaleDateString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={draft.id}
                id={`draft-item-${draft.id}`}
                className="p-4 rounded-xl border border-[#E6E4DE] bg-white hover:border-[#CDCBC4] hover:shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => onOpenDraft(draft)}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-[#1C1B18] group-hover:text-[#242A33]">
                      {draft.title}
                    </h3>
                    {draft.context.relationship && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAE8E2] text-[#4F4D48] font-medium">
                        {draft.context.relationship}
                      </span>
                    )}
                    <span className="text-[11px] text-[#8E8C86]">
                      {draft.context.format}
                    </span>
                  </div>

                  <p className="text-xs text-[#63615C] line-clamp-2 font-serif max-w-2xl">
                    {draft.currentDraft}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-[#8E8C86]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeStr}</span>
                    </span>
                    <span>·</span>
                    <span>{draft.revisions.length} revisions</span>
                    <span>·</span>
                    <span className="text-[#546274] font-medium">{draft.activeMode} mode</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => onDeleteDraft(draft.id)}
                    title="Delete draft"
                    className="p-2 rounded-lg text-[#9C9A93] hover:text-[#B34033] hover:bg-[#FDF2F0] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenDraft(draft)}
                    className="px-3 py-1.5 rounded-lg bg-[#F4F3EF] hover:bg-[#242A33] hover:text-white text-xs font-medium text-[#242A33] transition-colors flex items-center gap-1 border border-[#E0DED7]"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
