import React from 'react';
import {
  X,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Scale,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AssumptionCheckResult, AssumptionItem } from '../types';

interface AssumptionCheckPanelProps {
  result: AssumptionCheckResult | null;
  isLoading: boolean;
  onClose: () => void;
  onMakeNeutral: (item: AssumptionItem) => void;
  onReanalyze: () => void;
}

export const AssumptionCheckPanel: React.FC<AssumptionCheckPanelProps> = ({
  result,
  isLoading,
  onClose,
  onMakeNeutral,
  onReanalyze,
}) => {
  return (
    <div
      id="assumption-check-panel"
      className="w-96 shrink-0 border-l border-[#E6E4DE] bg-[#FAF9F6] h-full overflow-y-auto flex flex-col justify-between select-text animate-fadeIn"
    >
      <div>
        {/* Header */}
        <div className="p-4 border-b border-[#E6E4DE] flex items-center justify-between sticky top-0 bg-[#FAF9F6]/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2 text-[#242A33]">
            <ShieldCheck className="w-4 h-4 text-[#546274]" />
            <h3 className="text-sm font-semibold tracking-tight">
              Assumption & Responsibility Check
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onReanalyze}
              disabled={isLoading}
              title="Re-run analysis"
              className="p-1 rounded text-[#7A7873] hover:text-[#1C1B18] hover:bg-[#EAE8E2] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title="Close panel"
              className="p-1 rounded text-[#7A7873] hover:text-[#1C1B18] hover:bg-[#EAE8E2] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-6 h-6 border-2 border-[#242A33] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#7A7873]">
                Inspecting message grounding, boundaries, and assumptions...
              </p>
            </div>
          ) : !result ? (
            <div className="py-10 text-center text-xs text-[#7A7873]">
              Click "Check Assumptions" to inspect grounding and responsibility balance.
            </div>
          ) : (
            <>
              {/* SECTION 1: RESPONSIBILITY BALANCE CHECK */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#484642] uppercase tracking-wider">
                  <Scale className="w-3.5 h-3.5 text-[#546274]" />
                  <span>Responsibility Balance</span>
                </div>

                {/* Dimensions */}
                <div className="space-y-2 bg-white rounded-lg border border-[#E6E4DE] p-3">
                  {/* Accountability */}
                  <div className="border-b border-[#F0EFEB] pb-2">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-semibold text-[#1C1B18]">1. Accountability</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded font-medium bg-[#EAF2E8] text-[#3F6335]">
                        {result.responsibilityBalance.accountability.scoreLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#63615C]">
                      {result.responsibilityBalance.accountability.description}
                    </p>
                  </div>

                  {/* Boundary */}
                  <div className="border-b border-[#F0EFEB] pb-2">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-semibold text-[#1C1B18]">2. Boundary</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded font-medium bg-[#EBF0F5] text-[#2C5282]">
                        {result.responsibilityBalance.boundary.scoreLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#63615C]">
                      {result.responsibilityBalance.boundary.description}
                    </p>
                  </div>

                  {/* Responsibility Balance */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="font-semibold text-[#1C1B18]">3. Responsibility Balance</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded font-medium bg-[#F5F2EB] text-[#7A5B2E]">
                        {result.responsibilityBalance.balance.scoreLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#63615C]">
                      {result.responsibilityBalance.balance.description}
                    </p>
                  </div>
                </div>

                {/* Summary badge */}
                <div className="p-3 rounded-lg bg-[#F4F3EF] border border-[#E6E4DE] text-xs text-[#484642] font-serif italic">
                  “{result.responsibilityBalance.summary}”
                </div>
              </div>

              {/* SECTION 2: POSSIBLE ASSUMPTIONS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-[#484642] uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#A8644A]" />
                    <span>Possible Assumptions</span>
                  </div>
                  <span className="text-[11px] font-normal text-[#7A7873]">
                    {result.possibleAssumptions.length} found
                  </span>
                </div>

                {result.possibleAssumptions.length === 0 ? (
                  <div className="p-3.5 rounded-lg border border-[#D5E3D2] bg-[#F4F8F3] flex items-center gap-2 text-xs text-[#3E6534]">
                    <CheckCircle className="w-4 h-4 shrink-0 text-[#4E8443]" />
                    <span>No unsupported assumptions found. The draft remains strictly grounded.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {result.possibleAssumptions.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border border-[#ECD9CE] bg-[#FDF9F7] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A85B3D]">
                            {item.categoryLabel || 'Assumption'}
                          </span>
                        </div>

                        <div>
                          <p className="text-[#1C1B18] font-medium bg-[#F9EBE5] px-1.5 py-0.5 rounded inline">
                            "{item.originalText}"
                          </p>
                          <p className="text-[#63615C] text-[11px] mt-1.5 leading-normal">
                            {item.explanation}
                          </p>
                        </div>

                        <div className="pt-1.5 border-t border-[#F2E5DC] flex items-center justify-between">
                          <span className="text-[10px] text-[#7A7873] truncate max-w-[150px]">
                            → {item.neutralReplacement}
                          </span>
                          <button
                            onClick={() => onMakeNeutral(item)}
                            className="px-2 py-1 rounded bg-[#242A33] hover:bg-black text-white text-[10px] font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <span>Make Neutral</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: SUPPORTED BY YOUR INPUT */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#484642] uppercase tracking-wider">
                  <CheckCircle className="w-3.5 h-3.5 text-[#5F7F55]" />
                  <span>Supported By Your Input</span>
                </div>

                <div className="space-y-2">
                  {result.supportedByInput.map((fact) => (
                    <div
                      key={fact.id}
                      className="p-2.5 rounded-lg border border-[#E6E4DE] bg-white text-xs space-y-1"
                    >
                      <p className="font-medium text-[#1C1B18] leading-tight">
                        {fact.statement}
                      </p>
                      <p className="text-[10px] text-[#7A7873] font-serif italic truncate">
                        Source: {fact.sourceContext}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-[#E6E4DE] bg-[#FAF9F6] text-[11px] text-[#8C8A84] text-center">
        Between Us Grounding Engine v2.1
      </div>
    </div>
  );
};
