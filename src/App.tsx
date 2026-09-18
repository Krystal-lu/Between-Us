/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { NewMessageFlow } from './components/NewMessageFlow';
import { ClarificationPanel } from './components/ClarificationPanel';
import { WritingWorkspace } from './components/WritingWorkspace';
import { DraftsPage } from './components/DraftsPage';
import { HistoryPage } from './components/HistoryPage';
import { SettingsModal } from './components/SettingsModal';
import {
  ActiveTab,
  SavedDraft,
  MessageContext,
  ClarificationQuestion,
  Revision,
} from './types';
import { INITIAL_RECENT_DRAFTS, DEMO_SCENARIOS } from './data/sampleData';

const STORAGE_KEY = 'between_us_saved_drafts_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to read from localStorage:', e);
    }
    return INITIAL_RECENT_DRAFTS;
  });

  const [activeDraft, setActiveDraft] = useState<SavedDraft | null>(() => {
    return savedDrafts[0] || null;
  });

  // Flow State
  const [editingContext, setEditingContext] = useState<Partial<MessageContext> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Clarification state
  const [clarificationQuestions, setClarificationQuestions] = useState<ClarificationQuestion[]>([]);
  const [clarificationIndex, setClarificationIndex] = useState(0);
  const [clarificationAnswers, setClarificationAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [isClarifying, setIsClarifying] = useState(false);
  const [pendingDraftContext, setPendingDraftContext] = useState<MessageContext | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedDrafts));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [savedDrafts]);

  // Navigate handler
  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab(tab);
  };

  // Start a new message
  const handleStartNew = () => {
    setEditingContext(null);
    setActiveTab('new-message');
  };

  // Open existing draft in workspace
  const handleOpenDraft = (draft: SavedDraft) => {
    setActiveDraft(draft);
    setActiveTab('workspace');
  };

  // Load a demo scenario
  const handleLoadScenario = (scenarioId: string) => {
    const scenario = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    const draftId = `draft-${Date.now()}`;
    const newDraft: SavedDraft = {
      id: draftId,
      title: `${scenario.recipient ? `Message to ${scenario.recipient}` : 'New Message'}`,
      recipientName: scenario.recipient,
      context: {
        id: `ctx-${Date.now()}`,
        recipientName: scenario.recipient,
        relationship: scenario.relationship,
        situations: scenario.situations,
        customSituation: scenario.customSituation,
        goals: scenario.goals,
        customGoal: scenario.customGoal,
        userContext: scenario.userContext,
        shouldNotImply: scenario.shouldNotImply,
        tone: scenario.tone,
        length: scenario.length,
        format: scenario.format,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      currentDraft: scenario.prebuiltDraft,
      activeMode: 'Balanced',
      revisions: [
        {
          id: `rev-${Date.now()}`,
          versionNumber: 1,
          content: scenario.prebuiltDraft,
          mode: 'Balanced',
          timestamp: Date.now(),
          label: 'Initial Scenario Draft',
        },
      ],
      assumptionCheckResult: scenario.prebuiltAssumptions,
      lastModified: Date.now(),
    };

    setSavedDrafts((prev) => [newDraft, ...prev.filter((d) => d.id !== draftId)]);
    setActiveDraft(newDraft);
    setActiveTab('workspace');
  };

  // User completes New Message form
  const handleNewMessageSubmit = async (context: MessageContext) => {
    setPendingDraftContext(context);
    setIsGenerating(true);

    try {
      // Step 1: Clarification check (max 2 questions total)
      const clarifyRes = await fetch('/api/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: context.recipientName,
          relationship: context.relationship,
          situations: context.situations,
          goals: context.goals,
          userContext: context.userContext,
          shouldNotImply: context.shouldNotImply,
          previousQuestionCount: 0,
        }),
      });

      if (clarifyRes.ok) {
        const clarifyData = await clarifyRes.json();
        if (clarifyData?.questions && clarifyData.questions.length > 0) {
          setClarificationQuestions(clarifyData.questions.slice(0, 2));
          setClarificationIndex(0);
          setClarificationAnswers([]);
          setIsClarifying(true);
          setIsGenerating(false);
          return;
        }
      }

      // If no clarification needed or API responded without questions, proceed directly
      await generateDraftAndOpenWorkspace(context, []);
    } catch (err) {
      console.warn('Clarification check bypassed, proceeding directly to draft generation:', err);
      // Fallback: proceed to generate
      await generateDraftAndOpenWorkspace(context, []);
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate draft and open workspace
  const generateDraftAndOpenWorkspace = async (
    context: MessageContext,
    clarificationQA: Array<{ question: string; answer: string }>
  ) => {
    setIsGenerating(true);
    let generatedText = '';

    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: context.recipientName,
          relationship: context.relationship,
          situations: context.situations,
          customSituation: context.customSituation,
          goals: context.goals,
          customGoal: context.customGoal,
          userContext: context.userContext,
          shouldNotImply: context.shouldNotImply,
          tone: context.tone,
          length: context.length,
          format: context.format,
          mode: 'Balanced',
          clarificationQA,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.draft) {
          generatedText = data.draft;
        }
      }
    } catch (err) {
      console.warn('API draft call encountered an issue, applying grounded generator:', err);
    }

    // High-fidelity deterministic fallback if API is unreachable or returns empty
    if (!generatedText) {
      const greeting =
        context.format === 'Text Message'
          ? context.recipientName
            ? `Hey ${context.recipientName}, `
            : 'Hey, '
          : context.format === 'Email'
          ? context.recipientName
            ? `Dear ${context.recipientName},\n\n`
            : 'Hello,\n\n'
          : context.recipientName
          ? `Dear ${context.recipientName},\n\n`
          : 'To whom it may concern,\n\n';

      const closing =
        context.format === 'Text Message'
          ? '\nLet me know when you have a chance to talk.'
          : context.format === 'Email'
          ? '\n\nBest regards,\nAlex'
          : '\n\nSincerely,\nAlex';

      const cleanContext = (context.userContext || '').trim();
      generatedText = `${greeting}I’ve been reflecting on our situation. ${cleanContext} I wanted to share this openly so we can move forward with mutual clarity.${closing}`;
    }

    try {
      const title = context.recipientName
        ? `Message to ${context.recipientName}`
        : context.situations[0]
        ? `${context.situations[0]} Draft`
        : 'Interpersonal Draft';

      const newDraft: SavedDraft = {
        id: `draft-${Date.now()}`,
        title,
        recipientName: context.recipientName,
        context,
        currentDraft: generatedText,
        activeMode: 'Balanced',
        revisions: [
          {
            id: `rev-${Date.now()}`,
            versionNumber: 1,
            content: generatedText,
            mode: 'Balanced',
            timestamp: Date.now(),
            label: 'Initial Balanced Draft',
          },
        ],
        assumptionCheckResult: null,
        lastModified: Date.now(),
      };

      setSavedDrafts((prev) => [newDraft, ...prev]);
      setActiveDraft(newDraft);
      setActiveTab('workspace');
      setIsClarifying(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Clarification answered
  const handleClarificationAnswer = async (answer: string) => {
    if (!pendingDraftContext) return;

    const currentQ = clarificationQuestions[clarificationIndex];
    const updatedAnswers = [
      ...clarificationAnswers,
      { question: currentQ.question, answer },
    ];
    setClarificationAnswers(updatedAnswers);

    const nextIndex = clarificationIndex + 1;
    if (nextIndex < clarificationQuestions.length && nextIndex < 2) {
      setClarificationIndex(nextIndex);
    } else {
      // Completed clarification
      setIsClarifying(false);
      await generateDraftAndOpenWorkspace(pendingDraftContext, updatedAnswers);
    }
  };

  // Clarification skipped
  const handleClarificationSkip = async () => {
    if (!pendingDraftContext) return;

    const nextIndex = clarificationIndex + 1;
    if (nextIndex < clarificationQuestions.length && nextIndex < 2) {
      setClarificationIndex(nextIndex);
    } else {
      // Skip all and proceed with neutral wording
      setIsClarifying(false);
      await generateDraftAndOpenWorkspace(pendingDraftContext, clarificationAnswers);
    }
  };

  // Update draft in workspace
  const handleUpdateDraft = (updated: SavedDraft) => {
    setActiveDraft(updated);
    setSavedDrafts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  // Delete draft
  const handleDeleteDraft = (draftId: string) => {
    setSavedDrafts((prev) => prev.filter((d) => d.id !== draftId));
    if (activeDraft?.id === draftId) {
      setActiveDraft(savedDrafts.find((d) => d.id !== draftId) || null);
    }
  };

  // Edit context from workspace
  const handleEditContextFromWorkspace = (context: MessageContext) => {
    setEditingContext(context);
    setActiveTab('new-message');
  };

  // Settings resets
  const handleResetDemoData = () => {
    setSavedDrafts(INITIAL_RECENT_DRAFTS);
    setActiveDraft(INITIAL_RECENT_DRAFTS[0]);
    alert('Restored sample scenarios and drafts.');
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all locally saved drafts?')) {
      setSavedDrafts([]);
      setActiveDraft(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div id="between-us-app" className="flex min-h-screen bg-[#FAF9F6] font-sans antialiased text-[#1C1B18]">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        savedDraftsCount={savedDrafts.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-y-auto min-h-screen">
        {activeTab === 'home' && (
          <HomePage
            onStartNew={handleStartNew}
            recentDrafts={savedDrafts}
            onOpenDraft={handleOpenDraft}
            onLoadScenario={handleLoadScenario}
          />
        )}

        {activeTab === 'new-message' && (
          <NewMessageFlow
            initialContext={editingContext || undefined}
            onSubmit={handleNewMessageSubmit}
            onCancel={() => setActiveTab('home')}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'workspace' && activeDraft && (
          <WritingWorkspace
            draftData={activeDraft}
            onUpdateDraft={handleUpdateDraft}
            onBackToHome={() => setActiveTab('home')}
            onEditContext={handleEditContextFromWorkspace}
          />
        )}

        {activeTab === 'workspace' && !activeDraft && (
          <div className="max-w-md mx-auto py-24 text-center">
            <p className="text-sm text-[#7A7873] mb-4">No active draft selected.</p>
            <button
              onClick={handleStartNew}
              className="px-4 py-2 bg-[#242A33] text-white rounded-lg text-xs font-medium"
            >
              Start a new message
            </button>
          </div>
        )}

        {activeTab === 'drafts' && (
          <DraftsPage
            drafts={savedDrafts}
            onOpenDraft={handleOpenDraft}
            onDeleteDraft={handleDeleteDraft}
            onStartNew={handleStartNew}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            drafts={savedDrafts}
            onOpenDraft={handleOpenDraft}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            onResetDemoData={handleResetDemoData}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>

      {/* Clarification Dialog Modal */}
      {isClarifying && clarificationQuestions[clarificationIndex] && (
        <ClarificationPanel
          question={clarificationQuestions[clarificationIndex]}
          questionNumber={clarificationIndex + 1}
          totalQuestions={clarificationQuestions.length}
          onAnswer={handleClarificationAnswer}
          onSkip={handleClarificationSkip}
          isLoading={isGenerating}
        />
      )}
    </div>
  );
}
