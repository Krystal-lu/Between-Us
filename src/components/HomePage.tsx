import React from 'react';
import {
  PenLine,
  ArrowRight,
  Sparkles,
  Clock,
  Shield,
  Layers,
  CheckCircle2,
  FileEdit,
  Sliders,
} from 'lucide-react';
import { SavedDraft } from '../types';
import { DEMO_SCENARIOS } from '../data/sampleData';

interface HomePageProps {
  onStartNew: () => void;
  recentDrafts: SavedDraft[];
  onOpenDraft: (draft: SavedDraft) => void;
  onLoadScenario: (scenarioId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartNew,
  recentDrafts,
  onOpenDraft,
  onLoadScenario,
}) => {
  return (
    <div id="home-dashboard" className="max-w-5xl mx-auto py-10 px-8">
      {/* Calm Productivity Header */}
      <div className="border-b border-[#E6E4DE] pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE8E2] text-[#4F4D48] text-xs font-medium mb-3">
              <Shield className="w-3.5 h-3.5 text-[#546274]" />
              <span>Context & Boundaries First</span>
            </div>
            <h1 className="text-3xl font-serif tracking-tight text-[#1C1B18] leading-tight mb-2">
              Say what you mean, without losing your intent.
            </h1>
            <p className="text-[15px] text-[#63615C] leading-relaxed">
              AI-assisted writing for difficult conversations. Establish the relationship, situation, and non-negotiables before drafting.
            </p>
          </div>

          <div className="shrink-0">
            <button
              id="cta-start-new-message"
              onClick={onStartNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#242A33] hover:bg-[#181D24] text-white text-[14px] font-medium transition-all shadow-xs hover:shadow-sm"
            >
              <PenLine className="w-4 h-4" />
              <span>Start a new message</span>
              <ArrowRight className="w-4 h-4 opacity-70" />
            </button>
          </div>
        </div>
      </div>

      {/* Core Principle Callout - Minimal & Subdued */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="p-4 rounded-lg border border-[#E6E4DE] bg-white/70">
          <div className="flex items-center gap-2 text-[#242A33] mb-1.5">
            <Layers className="w-4 h-4 text-[#546274]" />
            <h3 className="text-sm font-semibold">The System Doesn't Write First</h3>
          </div>
          <p className="text-xs text-[#63615C] leading-normal">
            It establishes the relationship, goals, and what the message must NOT imply before touching any words.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-[#E6E4DE] bg-white/70">
          <div className="flex items-center gap-2 text-[#242A33] mb-1.5">
            <Sliders className="w-4 h-4 text-[#546274]" />
            <h3 className="text-sm font-semibold">Protected Intent</h3>
          </div>
          <p className="text-xs text-[#63615C] leading-normal">
            Never assume unilateral fault. Shared responsibility is preserved without diluting personal boundaries.
          </p>
        </div>

        <div className="p-4 rounded-lg border border-[#E6E4DE] bg-white/70">
          <div className="flex items-center gap-2 text-[#242A33] mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#697A62]" />
            <h3 className="text-sm font-semibold">Assumption Checking</h3>
          </div>
          <p className="text-xs text-[#63615C] leading-normal">
            Inspects every draft for unstated emotions, commitments, or motives, allowing one-click neutralization.
          </p>
        </div>
      </div>

      {/* Quick-Load Demo Scenarios for Testing */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-semibold text-[#1C1B18]">Demo Scenarios</h2>
            <p className="text-xs text-[#7A7873]">
              Pre-configured test cases from interpersonal communication patterns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {DEMO_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 rounded-lg border border-[#E6E4DE] bg-white hover:border-[#CDCBC4] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#242A33]">{scenario.recipient}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAE8E2] text-[#55534E]">
                    {scenario.relationship}
                  </span>
                </div>
                <p className="text-xs text-[#63615C] line-clamp-2 mb-3">
                  {scenario.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {scenario.situations.map((sit) => (
                    <span
                      key={sit}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[#F2F1EC] text-[#5F5D58] border border-[#E4E2DC]"
                    >
                      {sit}
                    </span>
                  ))}
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FAF2ED] text-[#8C5238] border border-[#ECD9CC]">
                    {scenario.tone}
                  </span>
                </div>
              </div>

              <button
                id={`btn-load-${scenario.id}`}
                onClick={() => onLoadScenario(scenario.id)}
                className="w-full mt-2 py-1.5 px-3 rounded-md text-xs font-medium bg-[#F4F3EF] hover:bg-[#EAE8E2] text-[#242A33] transition-colors flex items-center justify-center gap-1.5 border border-[#E0DED7]"
              >
                <span>Load Scenario & Inspect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Drafts Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#1C1B18]">Recent Drafts</h2>
            <span className="text-xs text-[#8E8C86]">({recentDrafts.length})</span>
          </div>
          <p className="text-xs text-[#8E8C86]">
            Locally saved in your browser
          </p>
        </div>

        {recentDrafts.length === 0 ? (
          <div className="p-8 text-center rounded-lg border border-dashed border-[#DDDBCF] bg-[#FAF9F5]">
            <p className="text-sm text-[#7A7873] mb-3">No drafts created yet.</p>
            <button
              onClick={onStartNew}
              className="text-xs font-medium px-3 py-1.5 bg-[#242A33] text-white rounded-md hover:bg-black"
            >
              Create your first draft
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentDrafts.map((draft) => {
              const formattedDate = new Date(draft.lastModified).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={draft.id}
                  id={`recent-draft-${draft.id}`}
                  onClick={() => onOpenDraft(draft)}
                  className="p-4 rounded-lg border border-[#E6E4DE] bg-white hover:border-[#CDCBC4] hover:shadow-2xs transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 mb-1">
                      <h3 className="text-sm font-semibold text-[#1C1B18] group-hover:text-[#242A33] truncate">
                        {draft.title}
                      </h3>
                      {draft.context.relationship && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#F0EFEB] text-[#55534E] font-medium shrink-0">
                          {draft.context.relationship}
                        </span>
                      )}
                      <span className="text-[11px] text-[#8E8C86] shrink-0">
                        {draft.context.format}
                      </span>
                    </div>

                    <p className="text-xs text-[#63615C] truncate max-w-2xl font-serif">
                      {draft.currentDraft}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs text-[#8E8C86]">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                    <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F4F3EF] text-[#55534E]">
                      v{draft.revisions.length}
                    </span>
                    <button
                      className="px-2.5 py-1 text-xs rounded bg-[#F7F6F2] group-hover:bg-[#242A33] group-hover:text-white transition-colors border border-[#E4E2DC]"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
