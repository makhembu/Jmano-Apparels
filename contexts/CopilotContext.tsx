
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { geminiClient } from '../lib/ai/gemini-client';
import { buildSystemPrompt } from '../lib/ai/system-prompt';
import { createFunctionExecutors } from '../lib/ai/function-executors';
import { CopilotContextType, Message, PageContext } from '../lib/ai/types';
import { Chat } from '@google/genai';

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [pageContext, setPageContext] = useState<PageContext>({
    route: location.pathname,
    pageName: 'Dashboard',
    availableActions: []
  });

  const chatSession = useRef<Chat | null>(null);

  const setPageData = useCallback((data: Record<string, unknown> | undefined) => {
    setPageContext(prev => ({ ...prev, pageData: data }));
  }, []);

  useEffect(() => {
    const path = location.pathname;
    let name = 'Dashboard';
    if (path.includes('/orders')) name = path.includes('new') ? 'Create Order' : 'Orders';
    else if (path.includes('/products')) name = 'Products';
    else if (path.includes('/app-settings')) name = 'App Settings';
    else if (path.includes('/shop-settings')) name = 'Shop Settings';

    setPageContext(prev => ({
        ...prev,
        route: path,
        pageName: name,
        pageData: prev.route === path ? prev.pageData : undefined 
    }));
  }, [location.pathname]);

  useEffect(() => {
    if (geminiClient.isAvailable()) {
        const prompt = buildSystemPrompt(pageContext);
        chatSession.current = geminiClient.createChat(prompt);
    }
  }, [pageContext.pageName, pageContext.pageData]); 

  const executors = createFunctionExecutors({ navigate });

  const sendMessage = useCallback(async (content: string) => {
    if (!chatSession.current) {
      const prompt = buildSystemPrompt(pageContext);
      chatSession.current = geminiClient.createChat(prompt);
    }
    
    if (!chatSession.current || !content.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        let response = await chatSession.current.sendMessage({ message: content });
        
        while (response.functionCalls && response.functionCalls.length > 0) {
            const functionResponses = await Promise.all(
                response.functionCalls.map(async (call) => {
                    const executor = (executors as any)[call.name];
                    const result = executor ? await executor(call.args) : { error: `Function ${call.name} not found` };
                    return { functionResponse: { name: call.name, id: call.id, response: { result } } };
                })
            );
            response = await chatSession.current.sendMessage({ message: functionResponses });
        }

        const text = response.text || "I've handled that request for you.";
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: text, timestamp: new Date() }]);

    } catch (e: any) {
        console.error("Jambo Copilot Error:", e);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: "I'm having trouble processing that right now.", timestamp: new Date(), isError: true }]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext, executors]);

  const toggleDrawer = () => setIsOpen(prev => !prev);
  const clearHistory = () => {
      setMessages([]);
      if (geminiClient.isAvailable()) {
        chatSession.current = geminiClient.createChat(buildSystemPrompt(pageContext));
      }
  };

  return (
    <CopilotContext.Provider value={{
        messages, isOpen, isLoading, pageContext, 
        sendMessage, toggleDrawer, clearHistory, 
        updatePageContext: (ctx) => setPageContext(prev => ({...prev, ...ctx})),
        setPageData
    }}>
        {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
    const context = useContext(CopilotContext);
    if (!context) throw new Error("useCopilot must be used within CopilotProvider");
    return context;
};
