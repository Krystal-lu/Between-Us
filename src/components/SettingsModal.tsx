import React from 'react';
import {
  ShieldCheck,
  Key,
  Database,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface SettingsModalProps {
  onResetDemoData: () => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onResetDemoData,
  onClearAllData,
}) => {
  const coreRules = [
    'Never invent facts, events, emotions, intentions, motivations, or relationship details not provided.',
    'Never assume what the recipient thinks or feels.',
    'Do not automatically make the user accept all responsibility.',
    'Preserve shared responsibility if the user indicates both sides contributed.',
    'Preserve the user’s stated boundaries.',
    'Do not intensify blame or add passive-aggressive subtext.',
    'Do not reinterpret the user’s position without permission.',
    'If important information is missing, ask up to two clarification questions.',
    'Ask no more than two clarification questions total; allow skip.',
    'After two clarification questions, proceed using neutral wording if details are incomplete.',
    'If something remains uncertain, keep it uncertain instead of turning it into a fact.',
    'Help the user communicate; do not decide what the user should believe.',
    'Make the system’s assumptions visible in the Assumption Check panel.',
    'Reflect the selected relationship, situation, goals, tone, length, and format without becoming formulaic.',
  ];

  return (
    <div id="settings-page" className="max-w-4xl mx-auto py-10 px-8">
      <div className="border-b border-[#E6E4DE] pb-6 mb-8">
        <h1 className="text-2xl font-serif font-semibold text-[#1C1B18] tracking-tight">
          System Settings & Behavioral Architecture
        </h1>
        <p className="text-xs text-[#63615C] mt-1">
          Configuration, grounding rules, and local storage controls for Between Us.
        </p>
      </div>

      <div className="space-y-8">
        {/* Gemini API Key & Server Status */}
        <div className="p-5 rounded-xl border border-[#E6E4DE] bg-white space-y-4">
          <div className="flex items-center gap-2 text-[#242A33]">
            <Key className="w-4 h-4 text-[#546274]" />
            <h2 className="text-sm font-semibold">Gemini AI Integration</h2>
          </div>

          <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E6E4DE] text-xs space-y-2 text-[#484642]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1C1B18]">Environment Variable:</span>
              <code className="px-2 py-0.5 rounded bg-[#EAE8E2] text-[#1C1B18] font-mono text-[11px]">
                GEMINI_API_KEY
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1C1B18]">Recommended Model:</span>
              <span className="font-mono text-[11px] text-[#546274]">gemini-3.8-flash</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#1C1B18]">Architecture:</span>
              <span className="text-[#3E6534] font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Server-side API routes (Express + @google/genai)
              </span>
            </div>
          </div>

          <p className="text-xs text-[#7A7873] leading-relaxed">
            The Gemini API key is securely managed server-side via the environment variable{' '}
            <code className="font-mono text-[#1C1B18]">GEMINI_API_KEY</code>. The client never accesses or exposes the API key. In environments without an active key, the built-in deterministic heuristic engine operates with full fidelity.
          </p>
        </div>

        {/* 14 Core Rules */}
        <div className="p-5 rounded-xl border border-[#E6E4DE] bg-white space-y-4">
          <div className="flex items-center gap-2 text-[#242A33]">
            <ShieldCheck className="w-4 h-4 text-[#5F7F55]" />
            <h2 className="text-sm font-semibold">14 Core AI Behavior Rules</h2>
          </div>
          <p className="text-xs text-[#63615C]">
            These non-negotiable rules govern every generation, assumption check, and rewrite across Between Us:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {coreRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE8E2] text-xs flex items-start gap-2.5"
              >
                <span className="w-4 h-4 rounded-full bg-[#EAE8E2] text-[#55534E] font-medium flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-[#3C3A36] leading-normal">{rule}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Local Storage & Data Management */}
        <div className="p-5 rounded-xl border border-[#E6E4DE] bg-white space-y-4">
          <div className="flex items-center gap-2 text-[#242A33]">
            <Database className="w-4 h-4 text-[#546274]" />
            <h2 className="text-sm font-semibold">Local Storage Management</h2>
          </div>
          <p className="text-xs text-[#63615C]">
            All drafts and revision logs are stored directly in your browser's local storage for privacy. No personal messages are saved on external database servers.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onResetDemoData}
              className="px-4 py-2 rounded-lg border border-[#D8D6CF] bg-[#FAF9F5] hover:bg-[#F2F1EC] text-xs font-medium text-[#242A33] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Sample Scenarios</span>
            </button>

            <button
              onClick={onClearAllData}
              className="px-4 py-2 rounded-lg border border-[#ECD9CE] bg-white hover:bg-[#FDF6F4] text-xs font-medium text-[#B34033] transition-colors"
            >
              Clear All Drafts
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
