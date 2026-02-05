
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Button } from '../../ui/Button';
import { isAbortError } from '../../../lib/utils';

interface AIAnalystProps {
  apiKey?: string;
  contextData: any;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ apiKey, contextData }) => {
  const [aiReport, setAiReport] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);

  const generateAiInsights = async () => {
    if (!apiKey) {
        setAiReport("⚠️ AI features require a Gemini API Key. Please configure it in App Settings.");
        return;
    }

    setAnalyzing(true);
    try {
        const ai = new GoogleGenAI({ apiKey });
        // Standard model for text tasks
        const model = 'gemini-3-flash-preview';

        const prompt = `
        You are a strict Data Analyst for "Jambo Apparels".
        Analyze the following JSON metrics.
        
        DATA:
        ${JSON.stringify(contextData)}

        BENCHMARKS:
        - Healthy E-commerce Conversion Rate: 1.5% - 3.0%
        - Good Average Time on Page: > 45 seconds
        
        RULES:
        1. DO NOT Hallucinate data. If a metric is 0 or missing, state "Insufficient data".
        2. Identify days with 0 traffic and suggest technical checks.
        3. Analyze the conversion rate against the benchmark.
        4. Analyze the exit pages. Where are users dropping off?
        5. Provide 3 specific, actionable steps to improve based ONLY on this data.
        
        Format as a clean markdown report.
        `;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        setAiReport(response.text || "Could not generate insights.");
    } catch (e: any) {
        if (!isAbortError(e)) {
            console.error("AI Error:", e);
            setAiReport(`Error generating report: ${e.message}`);
        }
    } finally {
        setAnalyzing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-brand-light/30 p-6 rounded-xl border border-brand-green/20 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-brand-dark flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI Data Analyst
            </h3>
            {analyzing && <span className="text-xs text-brand-green font-bold animate-pulse">Analyzing...</span>}
        </div>
        
        <div className="flex-1 bg-white/50 rounded-xl border border-white/50 p-4 mb-4 overflow-y-auto max-h-[300px] text-sm text-slate-700 leading-relaxed shadow-inner scrollbar-thin">
            {aiReport ? (
                <div className="prose prose-sm prose-green max-w-none">
                <ReactMarkdown>
                    {aiReport}
                </ReactMarkdown>
                </div>
            ) : (
                <div className="text-center text-gray-400 py-10 flex flex-col items-center justify-center h-full">
                    <p className="text-sm font-medium">Ready to analyze your store performance.</p>
                    <p className="text-xs mt-2 opacity-70">I will check conversion health, geo-trends, and drop-off points.</p>
                </div>
            )}
        </div>
        
        <div className="mt-auto">
            <Button 
                onClick={generateAiInsights} 
                isLoading={analyzing} 
                variant="primary" 
                fullWidth
                className="shadow-lg shadow-brand-green/20"
            >
                {aiReport ? 'Regenerate Analysis' : 'Run Analysis'}
            </Button>
            {aiReport && <p className="text-[10px] text-center text-slate-400 mt-2">AI-generated insights. Verify before acting.</p>}
        </div>
    </div>
  );
};
