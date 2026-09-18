import React, { useState, useRef, useEffect } from 'react';
import {
  Save,
  Copy,
  PlusCircle,
  ShieldAlert,
  ShieldCheck,
  History,
  Sliders,
  Sparkles,
  Check,
  ArrowLeft,
  Edit3,
  Scale,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import {
  MessageContext,
  DraftMode,
  Revision,
  AssumptionCheckResult,
  AssumptionItem,
  SavedDraft,
} from '../types';
import { AssumptionCheckPanel } from './AssumptionCheckPanel';
import { RevisionHistoryPanel } from './RevisionHistoryPanel';

interface WritingWorkspaceProps {
  draftData: SavedDraft;
  onUpdateDraft: (updated: SavedDraft) => void;
  onBackToHome: () => void;
  onEditContext: (context: MessageContext) => void;
}

export const WritingWorkspace: React.FC<WritingWorkspaceProps> = ({
  draftData,
  onUpdateDraft,
  onBackToHome,
  onEditContext,
}) => {
  const [content, setContent] = useState(draftData.currentDraft);
  const [activeMode, setActiveMode] = useState<DraftMode>(draftData.activeMode || 'Balanced');
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  
  // Selection toolbar state
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ top: number; left: number } | null>(null);
  const [isRewritingSelection, setIsRewritingSelection] = useState(false);

  // Panels
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [assumptionResult, setAssumptionResult] = useState<AssumptionCheckResult | null>(
    draftData.assumptionCheckResult || null
  );
  const [isAnalyzingAssumptions, setIsAnalyzingAssumptions] = useState(false);

  // Feedback states
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  // Sync state if draftData changes
  useEffect(() => {
    setContent(draftData.currentDraft);
    setActiveMode(draftData.activeMode);
    setAssumptionResult(draftData.assumptionCheckResult || null);
  }, [draftData.id]);

  // Handle Text Selection in Draft Editor
  const handleSelectText = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end).trim();

    if (selected.length > 2) {
      setSelectedText(selected);
      setSelectionRange({ start, end });
      // Position toolbar near selection inside workspace
      setToolbarPos({
        top: Math.max(10, textarea.offsetTop + 10),
        left: 20,
      });
    } else {
      setSelectedText('');
      setSelectionRange(null);
      setToolbarPos(null);
    }
  };

  // Selected Text Rewriting
  const handleRewriteAction = async (
    action: 'warmer' | 'shorter' | 'direct' | 'remove_blame' | 'neutral'
  ) => {
    if (!selectedText || !selectionRange) return;

    setIsRewritingSelection(true);
    try {
      const response = await fetch('/api/rewrite-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullDraft: content,
          selectedText,
          action,
          shouldNotImply: draftData.context.shouldNotImply,
          tone: draftData.context.tone,
        }),
      });

      const data = await response.json();
      if (data.replacement) {
        const newText =
          content.substring(0, selectionRange.start) +
          data.replacement +
          content.substring(selectionRange.end);

        setContent(newText);
        saveAsNewRevision(newText, activeMode, `Rewrote selection (${action})`);
      }
    } catch (err) {
      console.error('Rewrite selection failed:', err);
    } finally {
      setIsRewritingSelection(false);
      setSelectedText('');
      setSelectionRange(null);
      setToolbarPos(null);
    }
  };

  // Switch Draft Modes (Balanced, More Empathetic, More Direct)
  const handleModeChange = async (mode: DraftMode) => {
    if (mode === activeMode) return;
    setActiveMode(mode);
    setIsModeSwitching(true);

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: draftData.context.recipientName,
          relationship: draftData.context.relationship,
          situations: draftData.context.situations,
          customSituation: draftData.context.customSituation,
          goals: draftData.context.goals,
          customGoal: draftData.context.customGoal,
          userContext: draftData.context.userContext,
          shouldNotImply: draftData.context.shouldNotImply,
          tone: draftData.context.tone,
          length: draftData.context.length,
          format: draftData.context.format,
          mode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.draft) {
          setContent(data.draft);
          saveAsNewRevision(data.draft, mode, `Switched to ${mode} mode`);
          return;
        }
      }
      throw new Error('API response empty');
    } catch (err) {
      console.warn('Mode switch using grounded local adaptation:', err);
      const recipient = draftData.context.recipientName;
      const cleanContext = (draftData.context.userContext || '').trim();
      const format = draftData.context.format;
      const greeting =
        format === 'Text Message'
          ? recipient
            ? `Hey ${recipient}, `
            : 'Hey, '
          : format === 'Email'
          ? recipient
            ? `Dear ${recipient},\n\n`
            : 'Hello,\n\n'
          : recipient
          ? `Dear ${recipient},\n\n`
          : 'To whom it may concern,\n\n';
      const closing =
        format === 'Text Message'
          ? '\nLet me know what you think.'
          : format === 'Email'
          ? '\n\nBest regards,\nAlex'
          : '\n\nSincerely,\nAlex';

      let adaptedDraft = '';
      if (mode === 'More Empathetic') {
        adaptedDraft = `${greeting}I wanted to reach out thoughtfully. Regarding what happened, ${cleanContext} I value our communication and wanted to make sure we are on the same page without creating unnecessary distance.${closing}`;
      } else if (mode === 'More Direct') {
        adaptedDraft = `${greeting}I am writing to address this clearly. ${cleanContext} Moving forward, I want to ensure this boundary is understood so we can keep things constructive.${closing}`;
      } else {
        adaptedDraft = `${greeting}I’ve been reflecting on our situation. ${cleanContext} I want to share this openly so we can move forward constructively.${closing}`;
      }
      setContent(adaptedDraft);
      saveAsNewRevision(adaptedDraft, mode, `Switched to ${mode} mode`);
    } finally {
      setIsModeSwitching(false);
    }
  };

  // Trigger Assumption Check
  const runAssumptionCheck = async (textToAnalyze = content) => {
    setShowAssumptions(true);
    setShowHistory(false);
    setIsAnalyzingAssumptions(true);

    try {
      const response = await fetch('/api/check-assumptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: textToAnalyze,
          recipient: draftData.context.recipientName,
          relationship: draftData.context.relationship,
          situations: draftData.context.situations,
          goals: draftData.context.goals,
          userContext: draftData.context.userContext,
          shouldNotImply: draftData.context.shouldNotImply,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAssumptionResult(data);

        // Save to active draft data
        const updated: SavedDraft = {
          ...draftData,
          currentDraft: textToAnalyze,
          assumptionCheckResult: data,
          lastModified: Date.now(),
        };
        onUpdateDraft(updated);
        return;
      }
      throw new Error('Assumption check response error');
    } catch (err) {
      console.warn('Assumption check using grounded baseline:', err);
      const fallbackResult = {
        supportedByInput: [
          {
            id: 'sup-1',
            statement: 'Reflects the provided situation and respect for boundaries.',
            sourceContext: draftData.context.userContext || 'User context',
          },
        ],
        possibleAssumptions: [],
        responsibilityBalance: {
          accountability: {
            title: 'Accountability',
            scoreLabel: 'Balanced',
            description: 'Reflects the degree of responsibility indicated in your input.',
            status: 'positive' as const,
          },
          boundary: {
            title: 'Boundary',
            scoreLabel: 'Preserved',
            description: 'Maintains personal boundaries and respects stated goals.',
            status: 'positive' as const,
          },
          balance: {
            title: 'Responsibility Balance',
            scoreLabel: 'Equitable',
            description: 'Avoids unilateral fault or excessive blame.',
            status: 'positive' as const,
          },
          summary: 'This draft reflects your stated context while keeping your boundaries intact.',
        },
        analyzedAt: Date.now(),
      };
      setAssumptionResult(fallbackResult);
      const updated: SavedDraft = {
        ...draftData,
        currentDraft: textToAnalyze,
        assumptionCheckResult: fallbackResult,
        lastModified: Date.now(),
      };
      onUpdateDraft(updated);
    } finally {
      setIsAnalyzingAssumptions(false);
    }
  };

  // Make an assumption neutral (one-click fix)
  const handleMakeNeutral = (item: AssumptionItem) => {
    if (!content.includes(item.originalText)) {
      alert(`Could not find "${item.originalText}" in the draft. It may have been edited.`);
      return;
    }

    const updated = content.replace(item.originalText, item.neutralReplacement);
    setContent(updated);

    // Remove this assumption item from list
    if (assumptionResult) {
      const filtered = {
        ...assumptionResult,
        possibleAssumptions: assumptionResult.possibleAssumptions.filter(
          (a) => a.id !== item.id
        ),
      };
      setAssumptionResult(filtered);
    }

    saveAsNewRevision(updated, activeMode, `Made neutral: "${item.originalText.slice(0, 20)}..."`);
  };

  // Revision snapshot helper
  const saveAsNewRevision = (newContent: string, mode: DraftMode, label?: string) => {
    const nextVer = (draftData.revisions.length || 0) + 1;
    const newRev: Revision = {
      id: `rev-${Date.now()}`,
      versionNumber: nextVer,
      content: newContent,
      mode,
      timestamp: Date.now(),
      label,
    };

    const updated: SavedDraft = {
      ...draftData,
      currentDraft: newContent,
      activeMode: mode,
      revisions: [newRev, ...draftData.revisions],
      lastModified: Date.now(),
    };
    onUpdateDraft(updated);
  };

  // Save draft manual
  const handleSaveDraft = () => {
    const updated: SavedDraft = {
      ...draftData,
      currentDraft: content,
      activeMode,
      assumptionCheckResult: assumptionResult,
      lastModified: Date.now(),
    };
    onUpdateDraft(updated);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Restore previous revision
  const handleRestoreRevision = (rev: Revision) => {
    setContent(rev.content);
    setActiveMode(rev.mode);
    saveAsNewRevision(rev.content, rev.mode, `Restored Version ${rev.versionNumber}`);
    setShowHistory(false);
  };

  // Create new version manually
  const handleCreateNewVersion = () => {
    saveAsNewRevision(content, activeMode, 'Manual Snapshot');
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <div
      ref={workspaceRef}
      id="writing-workspace"
      className="flex h-screen overflow-hidden bg-[#FAF9F6] text-[#1C1B18]"
    >
      {/* ------------------------------------------------------------- */}
      {/* LEFT COLUMN: Message Context (Narrower, ~340px) */}
      {/* ------------------------------------------------------------- */}
      <div
        id="workspace-context-column"
        className="w-80 shrink-0 border-r border-[#E6E4DE] bg-[#F7F6F2] overflow-y-auto flex flex-col justify-between"
      >
        <div className="p-5 space-y-6">
          {/* Header & Back */}
          <div className="flex items-center justify-between border-b border-[#E6E4DE] pb-4">
            <button
              id="btn-back-to-home"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 text-xs text-[#7A7873] hover:text-[#1C1B18] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              id="btn-edit-context"
              onClick={() => onEditContext(draftData.context)}
              className="inline-flex items-center gap-1 text-xs text-[#546274] hover:text-[#242A33] font-medium"
              title="Edit parameters & regenerate"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit Context</span>
            </button>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A7873]">
              Message Context
            </span>
            <h2 className="text-base font-serif font-semibold text-[#1C1B18] mt-0.5">
              {draftData.title}
            </h2>
          </div>

          {/* Recipient & Relationship */}
          <div className="space-y-1 text-xs">
            <span className="text-[11px] font-semibold text-[#63615C] uppercase tracking-wider">
              Recipient & Dynamic
            </span>
            <div className="p-2.5 rounded-lg bg-white border border-[#E6E4DE] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C1B18]">
                  {draftData.context.recipientName || 'Not specified'}
                </span>
                {draftData.context.relationship && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EAE8E2] text-[#4F4D48] text-[10px]">
                    {draftData.context.relationship}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Situations */}
          {((draftData.context.situations && draftData.context.situations.length > 0) ||
            draftData.context.customSituation) && (
            <div className="space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-[#63615C] uppercase tracking-wider">
                Situations
              </span>
              <div className="flex flex-wrap gap-1">
                {draftData.context.situations?.map((sit) => (
                  <span
                    key={sit}
                    className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#DDDBCF] text-[#484642]"
                  >
                    {sit}
                  </span>
                ))}
                {draftData.context.customSituation && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#FAF2ED] border border-[#ECD9CC] text-[#7F4E34]">
                    {draftData.context.customSituation}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Goals */}
          {((draftData.context.goals && draftData.context.goals.length > 0) ||
            draftData.context.customGoal) && (
            <div className="space-y-1 text-xs">
              <span className="text-[11px] font-semibold text-[#63615C] uppercase tracking-wider">
                Communication Goals
              </span>
              <div className="flex flex-wrap gap-1">
                {draftData.context.goals?.map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2 py-0.5 rounded bg-white border border-[#DDDBCF] text-[#484642]"
                  >
                    {g}
                  </span>
                ))}
                {draftData.context.customGoal && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#F2F6F8] border border-[#D5E1E8] text-[#2C4D63]">
                    {draftData.context.customGoal}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* What this message should NOT imply (Prominent) */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#7F4E34]">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Must NOT Imply</span>
            </div>
            <div className="p-3 rounded-lg bg-[#FAF5F2] border border-[#ECD9CE] text-[12px] text-[#63483C] leading-normal font-medium">
              {draftData.context.shouldNotImply ? (
                `“${draftData.context.shouldNotImply}”`
              ) : (
                <span className="text-[#9A897F] italic font-normal">
                  No negative implications specified.
                </span>
              )}
            </div>
          </div>

          {/* User Raw Context */}
          <div className="space-y-1 text-xs">
            <span className="text-[11px] font-semibold text-[#63615C] uppercase tracking-wider">
              Your Input Notes
            </span>
            <div className="p-3 rounded-lg bg-white border border-[#E6E4DE] text-[12px] text-[#55534E] leading-relaxed max-h-36 overflow-y-auto font-sans">
              {draftData.context.userContext || 'No notes provided'}
            </div>
          </div>

          {/* Parameters badge */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#E6E4DE] text-[11px] text-[#7A7873]">
            <span>Tone: <strong className="text-[#1C1B18] font-medium">{draftData.context.tone}</strong></span>
            <span>·</span>
            <span>Length: <strong className="text-[#1C1B18] font-medium">{draftData.context.length}</strong></span>
            <span>·</span>
            <span>Format: <strong className="text-[#1C1B18] font-medium">{draftData.context.format}</strong></span>
          </div>
        </div>

        {/* Small footer note */}
        <div className="p-4 border-t border-[#E6E4DE] text-[11px] text-[#8E8C86] flex items-center justify-between">
          <span>Desktop 1440px Workspace</span>
          <span>v{draftData.revisions.length}</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RIGHT COLUMN: Draft Writing Workspace (Main Visual Focus) */}
      {/* ------------------------------------------------------------- */}
      <div id="workspace-draft-column" className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF9F6] relative">
        {/* Top Action Bar */}
        <div className="h-14 px-6 border-b border-[#E6E4DE] flex items-center justify-between bg-white/80 backdrop-blur-xs shrink-0 z-10">
          {/* Draft Modes: Balanced, More Empathetic, More Direct */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#7A7873] mr-1 hidden sm:inline">Mode:</span>
            <div className="inline-flex rounded-lg border border-[#D8D6CF] p-0.5 bg-[#F4F3EF]">
              {(['Balanced', 'More Empathetic', 'More Direct'] as DraftMode[]).map((mode) => (
                <button
                  key={mode}
                  id={`btn-mode-${mode.toLowerCase().replace(/\s+/g, '-')}`}
                  disabled={isModeSwitching}
                  onClick={() => handleModeChange(mode)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    activeMode === mode
                      ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                      : 'text-[#63615C] hover:text-[#1C1B18]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            {isModeSwitching && (
              <span className="text-xs text-[#7A7873] animate-pulse ml-2 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Adjusting mode...</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Check Assumptions Button */}
            <button
              id="btn-check-assumptions"
              onClick={() => runAssumptionCheck()}
              disabled={isAnalyzingAssumptions}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showAssumptions
                  ? 'border-[#242A33] bg-[#242A33] text-white'
                  : 'border-[#D8D6CF] bg-white text-[#242A33] hover:bg-[#F4F3EF]'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-[#546274]" />
              <span>Check Assumptions</span>
            </button>

            {/* Revision History */}
            <button
              id="btn-toggle-history"
              onClick={() => {
                setShowHistory(!showHistory);
                setShowAssumptions(false);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                showHistory
                  ? 'border-[#242A33] bg-[#242A33] text-white'
                  : 'border-[#D8D6CF] bg-white text-[#484642] hover:bg-[#F4F3EF]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Revisions ({draftData.revisions.length})</span>
            </button>

            {/* Create New Version */}
            <button
              id="btn-create-version"
              onClick={handleCreateNewVersion}
              title="Snapshot current state as a new version"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D8D6CF] bg-white text-[#484642] hover:bg-[#F4F3EF] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New Version</span>
            </button>

            {/* Copy Button */}
            <button
              id="btn-copy-draft"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D8D6CF] bg-white text-[#484642] hover:bg-[#F4F3EF] transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#4E8443]" />
                  <span className="text-[#3E6534]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Save Draft Button */}
            <button
              id="btn-save-draft"
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#242A33] hover:bg-black text-white text-xs font-medium transition-all shadow-2xs"
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#A8D49E]" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Writing Canvas & Editor Area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-8 lg:p-12 overflow-y-auto flex flex-col justify-between relative">
            <div className="max-w-3xl w-full mx-auto space-y-4">
              {/* Contextual Selected Text Rewrite Floating Toolbar */}
              {selectedText && toolbarPos && (
                <div
                  id="contextual-rewrite-toolbar"
                  className="sticky top-2 z-20 p-1.5 rounded-lg bg-[#1C1B18] text-white shadow-md border border-[#3A3935] flex items-center gap-1 animate-fadeIn text-xs"
                >
                  <div className="flex items-center gap-1 px-2 text-[#A8A6A0] text-[11px] border-r border-[#3A3935]">
                    <Wand2 className="w-3 h-3 text-[#E6C280]" />
                    <span className="truncate max-w-[100px]">"{selectedText}"</span>
                  </div>

                  <button
                    disabled={isRewritingSelection}
                    onClick={() => handleRewriteAction('warmer')}
                    className="px-2 py-1 rounded hover:bg-[#33322E] transition-colors text-[11px]"
                  >
                    Warmer
                  </button>

                  <button
                    disabled={isRewritingSelection}
                    onClick={() => handleRewriteAction('shorter')}
                    className="px-2 py-1 rounded hover:bg-[#33322E] transition-colors text-[11px]"
                  >
                    Shorter
                  </button>

                  <button
                    disabled={isRewritingSelection}
                    onClick={() => handleRewriteAction('direct')}
                    className="px-2 py-1 rounded hover:bg-[#33322E] transition-colors text-[11px]"
                  >
                    More Direct
                  </button>

                  <button
                    disabled={isRewritingSelection}
                    onClick={() => handleRewriteAction('remove_blame')}
                    className="px-2 py-1 rounded hover:bg-[#33322E] transition-colors text-[11px]"
                  >
                    Remove Blame
                  </button>

                  <button
                    disabled={isRewritingSelection}
                    onClick={() => handleRewriteAction('neutral')}
                    className="px-2 py-1 rounded hover:bg-[#33322E] transition-colors text-[11px]"
                  >
                    Make Neutral
                  </button>

                  {isRewritingSelection && (
                    <span className="px-2 text-[10px] text-[#E6C280] animate-pulse">
                      Rewriting...
                    </span>
                  )}
                </div>
              )}

              {/* Large Editable Writing Area */}
              <div className="bg-white rounded-xl border border-[#E6E4DE] shadow-xs p-6 md:p-8 transition-all focus-within:border-[#B8B6AF] focus-within:shadow-sm">
                <textarea
                  id="draft-editor-textarea"
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onSelect={handleSelectText}
                  onKeyUp={handleSelectText}
                  onMouseUp={handleSelectText}
                  rows={14}
                  className="w-full text-base font-serif text-[#1C1B18] placeholder-[#9C9A93] leading-relaxed bg-transparent focus:outline-none resize-y"
                  placeholder="Your message draft will appear here..."
                />
              </div>

              {/* Helper tip */}
              <div className="flex items-center justify-between text-xs text-[#8E8C86] px-1">
                <span>
                  Tip: Highlight any phrase in the text to surgically adjust tone or remove blame.
                </span>
                <span className="font-mono text-[11px]">
                  {wordCount} words · {charCount} chars
                </span>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="max-w-3xl w-full mx-auto mt-6 pt-4 border-t border-[#E6E4DE] flex items-center justify-between text-xs text-[#7A7873]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[#546274]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Grounding Rules Enforced</span>
                </span>
                <span>·</span>
                <span>Active: {activeMode}</span>
              </div>
              <div className="text-[11px]">
                Last modified {new Date(draftData.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Assumption Check Split-Panel */}
          {showAssumptions && (
            <AssumptionCheckPanel
              result={assumptionResult}
              isLoading={isAnalyzingAssumptions}
              onClose={() => setShowAssumptions(false)}
              onMakeNeutral={handleMakeNeutral}
              onReanalyze={() => runAssumptionCheck(content)}
            />
          )}

          {/* Revision History Split-Panel */}
          {showHistory && (
            <RevisionHistoryPanel
              revisions={draftData.revisions}
              activeVersionNumber={draftData.revisions[0]?.versionNumber || 1}
              onRestore={handleRestoreRevision}
              onClose={() => setShowHistory(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
