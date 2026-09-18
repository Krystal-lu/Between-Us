import React, { useState } from 'react';
import { HelpCircle, ArrowRight, SkipForward, Sparkles, ShieldCheck } from 'lucide-react';
import { ClarificationQuestion } from '../types';

interface ClarificationPanelProps {
  question: ClarificationQuestion;
  questionNumber: number; // 1 or 2
  totalQuestions: number; // max 2
  onAnswer: (answer: string) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export const ClarificationPanel: React.FC<ClarificationPanelProps> = ({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  onSkip,
  isLoading = false,
}) => {
  const [answerText, setAnswerText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answerText.trim()) {
      onAnswer(answerText.trim());
    } else {
      onSkip();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div
        id="clarification-modal"
        className="w-full max-w-lg bg-[#FAF9F6] border border-[#DDDBCF] rounded-xl shadow-lg p-6 flex flex-col gap-5 text-[#1C1B18]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E6E4DE] pb-4">
          <div className="flex items-center gap-2 text-[#2B3A4C]">
            <HelpCircle className="w-5 h-5 text-[#546274]" />
            <div>
              <h2 className="text-base font-serif font-semibold text-[#1C1B18]">
                Before I draft this, I need one more detail.
              </h2>
              <p className="text-xs text-[#7A7873]">
                Question {questionNumber} of {Math.min(totalQuestions, 2)} · Clarification is optional
              </p>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#EAE8E2] text-[#55534E] font-medium">
            Step {questionNumber}/2
          </span>
        </div>

        {/* Question content */}
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-white border border-[#E4E2DC]">
            <p className="text-sm font-medium text-[#1C1B18] leading-relaxed">
              {question.question}
            </p>
            {question.reason && (
              <p className="text-xs text-[#7A7873] mt-2 pt-2 border-t border-[#F0EFEB] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#697A62] shrink-0" />
                <span>{question.reason}</span>
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#55534E] uppercase tracking-wider mb-1.5">
                Your Answer
              </label>
              <textarea
                id="input-clarification-answer"
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Type your clarification here, or feel free to skip..."
                className="w-full p-3 rounded-lg border border-[#D8D6CF] bg-white text-sm text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                id="btn-skip-clarification"
                onClick={onSkip}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-[#7A7873] hover:text-[#1C1B18] hover:bg-[#EAE8E2] transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Skip (Proceed with neutral wording)</span>
              </button>

              <button
                type="submit"
                id="btn-submit-clarification"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#242A33] hover:bg-[#181D24] text-white text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>{answerText.trim() ? 'Save & Continue' : 'Skip & Continue'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
