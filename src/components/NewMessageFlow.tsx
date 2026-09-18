import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Info,
  Check,
  Plus,
  X,
  HelpCircle,
} from 'lucide-react';
import {
  MessageContext,
  RelationshipType,
  Tone,
  Length,
  Format,
} from '../types';

interface NewMessageFlowProps {
  initialContext?: Partial<MessageContext>;
  onSubmit: (context: MessageContext) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'Parent / Family',
  'Partner',
  'Friend',
  'Roommate',
  'Professor / Advisor',
  'Manager / Coworker',
  'Other',
];

const SITUATION_OPTIONS = [
  'Apology',
  'Conflict',
  'Misunderstanding',
  'Boundary setting',
  'Relationship repair',
  'Difficult feedback',
  'Asking for support',
  'Saying no',
  'Follow-up after tension',
];

const GOAL_OPTIONS = [
  'Repair the relationship',
  'Be understood',
  'Take responsibility',
  'Keep shared responsibility',
  'Set a clear boundary',
  'Reduce tension',
  'Ask for support',
  'Stay professional',
  'Keep the conversation open',
];

const NOT_IMPLY_PRESETS = [
  'That everything was my fault.',
  'That I don’t want them to have friends over at all.',
  'That I am ready to forgive right now.',
  'That the deadline was unclear or the other party made a mistake.',
  'That I agree with how they handled it.',
];

export const NewMessageFlow: React.FC<NewMessageFlowProps> = ({
  initialContext,
  onSubmit,
  onCancel,
  isGenerating = false,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [recipientName, setRecipientName] = useState(initialContext?.recipientName || '');
  const [relationship, setRelationship] = useState<string>(initialContext?.relationship || '');
  const [situations, setSituations] = useState<string[]>(initialContext?.situations || []);
  const [customSituation, setCustomSituation] = useState(initialContext?.customSituation || '');
  const [goals, setGoals] = useState<string[]>(initialContext?.goals || []);
  const [customGoal, setCustomGoal] = useState(initialContext?.customGoal || '');
  const [userContext, setUserContext] = useState(initialContext?.userContext || '');
  const [shouldNotImply, setShouldNotImply] = useState(initialContext?.shouldNotImply || '');
  const [tone, setTone] = useState<Tone>(initialContext?.tone || 'Calm');
  const [length, setLength] = useState<Length>(initialContext?.length || 'Medium');
  const [format, setFormat] = useState<Format>(initialContext?.format || 'Text Message');

  const totalSteps = 5;

  const toggleSituation = (item: string) => {
    setSituations((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const toggleGoal = (item: string) => {
    setGoals((prev) =>
      prev.includes(item) ? prev.filter((g) => g !== item) : [...prev, item]
    );
  };

  const handleFinalSubmit = () => {
    const fullContext: MessageContext = {
      id: initialContext?.id || `ctx-${Date.now()}`,
      recipientName: recipientName.trim(),
      relationship,
      situations,
      customSituation: customSituation.trim(),
      goals,
      customGoal: customGoal.trim(),
      userContext: userContext.trim(),
      shouldNotImply: shouldNotImply.trim(),
      tone,
      length,
      format,
      createdAt: initialContext?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    onSubmit(fullContext);
  };

  return (
    <div id="new-message-workflow" className="max-w-3xl mx-auto py-10 px-6">
      {/* Header bar with step progress */}
      <div className="flex items-center justify-between border-b border-[#E6E4DE] pb-5 mb-8">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-[#7A7873] hover:text-[#1C1B18] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <h1 className="text-xl font-serif font-semibold text-[#1C1B18] tracking-tight">
            New Message
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => {
            const stepNum = idx + 1;
            const isDone = stepNum < step;
            const isCurrent = stepNum === step;
            return (
              <button
                key={stepNum}
                onClick={() => setStep(stepNum)}
                className={`flex items-center justify-center text-xs font-medium transition-all rounded-md px-2.5 py-1 ${
                  isCurrent
                    ? 'bg-[#242A33] text-white'
                    : isDone
                    ? 'bg-[#EAE8E2] text-[#484642] hover:bg-[#DDDBCF]'
                    : 'text-[#9A9892] hover:bg-[#F0EFEB]'
                }`}
              >
                <span>Step {stepNum}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: WHO ARE YOU WRITING TO */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7A7873] font-semibold">
              Step 1 of 5
            </span>
            <h2 className="text-2xl font-serif text-[#1C1B18] mt-1 mb-1">
              Who are you writing to?
            </h2>
            <p className="text-sm text-[#63615C]">
              Optional — choose a category or type their name/title to calibrate the dynamic.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#484642] uppercase tracking-wider mb-2">
                Recipient Name or Role (Optional)
              </label>
              <input
                id="input-recipient-name"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Dad, My thesis advisor, Sam, Roommate"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D8D6CF] bg-white text-sm text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484642] uppercase tracking-wider mb-2">
                Relationship Type (Optional)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RELATIONSHIP_OPTIONS.map((opt) => {
                  const isSelected = relationship === opt;
                  return (
                    <button
                      key={opt}
                      id={`chip-rel-${opt.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                      type="button"
                      onClick={() => setRelationship(isSelected ? '' : opt)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium text-left border transition-all ${
                        isSelected
                          ? 'border-[#242A33] bg-[#242A33] text-white shadow-2xs'
                          : 'border-[#E0DED7] bg-white text-[#484642] hover:border-[#CDCBC4] hover:bg-[#FAF9F6]'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: SITUATION */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7A7873] font-semibold">
              Step 2 of 5
            </span>
            <h2 className="text-2xl font-serif text-[#1C1B18] mt-1 mb-1">
              What kind of situation are you dealing with?
            </h2>
            <p className="text-sm text-[#63615C]">
              Optional — choose any that apply, or choose none.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {SITUATION_OPTIONS.map((item) => {
                const isSelected = situations.includes(item);
                return (
                  <button
                    key={item}
                    id={`chip-sit-${item.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => toggleSituation(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#242A33] bg-[#242A33] text-white shadow-2xs'
                        : 'border-[#D8D6CF] bg-white text-[#484642] hover:border-[#B8B6AF] hover:bg-[#F9F8F5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E6E4DE]">
              <label className="block text-xs font-semibold text-[#484642] uppercase tracking-wider mb-2">
                Add your own situation
              </label>
              <textarea
                id="input-custom-situation"
                rows={2}
                value={customSituation}
                onChange={(e) => setCustomSituation(e.target.value)}
                placeholder="Describe anything unique that preset options do not cover..."
                className="w-full px-4 py-2.5 rounded-lg border border-[#D8D6CF] bg-white text-sm text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: COMMUNICATION GOAL */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7A7873] font-semibold">
              Step 3 of 5
            </span>
            <h2 className="text-2xl font-serif text-[#1C1B18] mt-1 mb-1">
              What do you want this message to achieve?
            </h2>
            <p className="text-sm text-[#63615C]">
              Optional — choose any that apply, or choose none.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {GOAL_OPTIONS.map((item) => {
                const isSelected = goals.includes(item);
                return (
                  <button
                    key={item}
                    id={`chip-goal-${item.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => toggleGoal(item)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#242A33] bg-[#242A33] text-white shadow-2xs'
                        : 'border-[#D8D6CF] bg-white text-[#484642] hover:border-[#B8B6AF] hover:bg-[#F9F8F5]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E6E4DE]">
              <label className="block text-xs font-semibold text-[#484642] uppercase tracking-wider mb-2">
                Add your own goal
              </label>
              <input
                id="input-custom-goal"
                type="text"
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="e.g. Clarify why I declined without sounding defensive"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D8D6CF] bg-white text-sm text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: USER CONTEXT */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7A7873] font-semibold">
              Step 4 of 5
            </span>
            <h2 className="text-2xl font-serif text-[#1C1B18] mt-1 mb-1">
              What do you want to say?
            </h2>
            <p className="text-sm text-[#63615C]">
              Share your raw thoughts, what happened, or what you are struggling to express clearly.
            </p>
          </div>

          <div>
            <textarea
              id="input-user-context"
              rows={6}
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              placeholder="I regret the way I reacted, but I still want them to understand why I was frustrated..."
              className="w-full p-4 rounded-lg border border-[#D8D6CF] bg-white text-sm text-[#1C1B18] placeholder-[#9C9A93] focus:outline-none focus:border-[#242A33] transition-colors leading-relaxed font-sans"
            />
            <div className="flex items-center justify-between text-xs text-[#7A7873] mt-2">
              <span>Write freely. The system will respect your stated facts and boundaries.</span>
              <span>{userContext.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: PROTECT INTENT & MESSAGE SETTINGS */}
      {step === 5 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#7A7873] font-semibold">
              Step 5 of 5
            </span>
            <h2 className="text-2xl font-serif text-[#1C1B18] mt-1 mb-1">
              Protect Your Intent & Tone
            </h2>
            <p className="text-sm text-[#63615C]">
              Establish boundaries and output parameters before the AI generates your draft.
            </p>
          </div>

          {/* Prominent but calm field: What should this message NOT imply? */}
          <div className="p-5 rounded-xl border border-[#E0D4C5] bg-[#FAF8F5]">
            <div className="flex items-center gap-2 mb-2 text-[#7F4E34]">
              <ShieldAlert className="w-4 h-4" />
              <label className="text-xs font-semibold uppercase tracking-wider">
                What should this message NOT imply? (Core Feature)
              </label>
            </div>
            <p className="text-xs text-[#6B5A50] mb-3">
              This protects you from unearned apologies, accidental concessions, or unintended aggression.
            </p>

            <textarea
              id="input-should-not-imply"
              rows={3}
              value={shouldNotImply}
              onChange={(e) => setShouldNotImply(e.target.value)}
              placeholder="e.g. I don’t want it to sound like everything was my fault, or promise that I agree."
              className="w-full p-3 rounded-lg border border-[#D8CCBD] bg-white text-sm text-[#1C1B18] placeholder-[#A09387] focus:outline-none focus:border-[#7F4E34] transition-colors mb-2.5"
            />

            {/* Presets to click */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-[#8C7A70] self-center mr-1">Quick examples:</span>
              {NOT_IMPLY_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    setShouldNotImply((prev) =>
                      prev ? `${prev} Also: ${preset}` : preset
                    )
                  }
                  className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#DDD4C8] text-[#5D5047] hover:bg-[#F2ECE4] transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Message Settings Controls */}
          <div className="p-4 rounded-xl border border-[#E6E4DE] bg-white">
            <h3 className="text-xs font-semibold text-[#484642] uppercase tracking-wider mb-4">
              Message Format & Tone Controls
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Tone */}
              <div>
                <label className="block text-xs font-medium text-[#63615C] mb-1.5">Tone</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(['Warm', 'Calm', 'Direct', 'Formal'] as Tone[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      id={`btn-tone-${t.toLowerCase()}`}
                      onClick={() => setTone(t)}
                      className={`py-1.5 px-2 rounded text-xs font-medium border text-center transition-all ${
                        tone === t
                          ? 'border-[#242A33] bg-[#242A33] text-white'
                          : 'border-[#E0DED7] text-[#55534E] hover:bg-[#F7F6F2]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-xs font-medium text-[#63615C] mb-1.5">Length</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Short', 'Medium', 'Detailed'] as Length[]).map((l) => (
                    <button
                      key={l}
                      type="button"
                      id={`btn-length-${l.toLowerCase()}`}
                      onClick={() => setLength(l)}
                      className={`py-1.5 px-1 rounded text-xs font-medium border text-center transition-all ${
                        length === l
                          ? 'border-[#242A33] bg-[#242A33] text-white'
                          : 'border-[#E0DED7] text-[#55534E] hover:bg-[#F7F6F2]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-xs font-medium text-[#63615C] mb-1.5">Format</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['Text Message', 'Email', 'Letter'] as Format[]).map((f) => (
                    <button
                      key={f}
                      type="button"
                      id={`btn-format-${f.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setFormat(f)}
                      className={`py-1.5 px-1 rounded text-[11px] font-medium border text-center transition-all truncate ${
                        format === f
                          ? 'border-[#242A33] bg-[#242A33] text-white'
                          : 'border-[#E0DED7] text-[#55534E] hover:bg-[#F7F6F2]'
                      }`}
                    >
                      {f.replace(' Message', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-8 mt-8 border-t border-[#E6E4DE]">
        <div>
          {step > 1 ? (
            <button
              id="btn-step-prev"
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#D8D6CF] text-xs font-medium text-[#484642] hover:bg-[#F4F3EF] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-xs text-[#7A7873] hover:text-[#1C1B18]"
            >
              Cancel
            </button>
          )}
        </div>

        <div>
          {step < totalSteps ? (
            <button
              id="btn-step-next"
              type="button"
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#242A33] hover:bg-[#181D24] text-white text-xs font-medium transition-colors shadow-2xs"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              id="btn-create-draft-cta"
              type="button"
              disabled={isGenerating}
              onClick={handleFinalSubmit}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#242A33] hover:bg-[#181D24] text-white text-sm font-medium transition-all shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#E6C280]" />
              <span>{isGenerating ? 'Preparing Draft...' : 'Create Draft'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
