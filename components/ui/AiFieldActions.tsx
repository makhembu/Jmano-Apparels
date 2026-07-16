import React, { useState } from 'react';

interface AiFieldActionsProps {
  /** The current value of the field */
  currentValue?: string;
  /** Context sent to AI (e.g. product category, blog topic) */
  context?: string;
  /** AI generation type (maps to SYSTEM_PROMPTS in ai-generate.js) */
  generateType: string;
  /** AI polish type */
  polishType: string;
  /** Extra context to send alongside the prompt */
  extraContext?: string;
  /** Called when AI text is received */
  onApply: (text: string) => void;
  /** Optional label override */
  label?: string;
  /** Disable both buttons */
  disabled?: boolean;
}

export const AiFieldActions: React.FC<AiFieldActionsProps> = ({
  currentValue,
  context,
  generateType,
  polishType,
  extraContext,
  onApply,
  label = 'Content',
  disabled = false,
}) => {
  const [loading, setLoading] = useState<'generate' | 'polish' | null>(null);

  const callAi = async (type: string, prompt: string) => {
    setLoading(type === generateType ? 'generate' : 'polish');
    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      });
      if (!res.ok) throw new Error('AI request failed');
      const data = await res.json();
      if (data.text) onApply(data.text);
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setLoading(null);
    }
  };

  const handleGenerate = () => {
    const parts = [extraContext, context ? `Topic/Context: ${context}` : ''].filter(Boolean);
    callAi(generateType, parts.join('\n'));
  };

  const handlePolish = () => {
    if (!currentValue?.trim()) return;
    callAi(polishType, currentValue);
  };

  const isDisabled = disabled || loading !== null;

  return (
    <span className="inline-flex items-center gap-1.5 ml-2">
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleGenerate}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand-green bg-brand-green/5 hover:bg-brand-green/10 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={`Generate new ${label.toLowerCase()}`}
      >
        {loading === 'generate' ? (
          <span className="animate-pulse">Thinking…</span>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
            Generate
          </>
        )}
      </button>
      <button
        type="button"
        disabled={isDisabled || !currentValue?.trim()}
        onClick={handlePolish}
        className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title={`Polish existing ${label.toLowerCase()}`}
      >
        {loading === 'polish' ? (
          <span className="animate-pulse">Thinking…</span>
        ) : (
          <>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Polish
          </>
        )}
      </button>
    </span>
  );
};
