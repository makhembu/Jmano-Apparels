import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { geminiClient, AVAILABLE_MODELS } from '../lib/ai/gemini-client';
import { generateSystemPrompt } from '../lib/ai/system-prompt';
import { createFunctionExecutors } from '../lib/ai/function-executors';
import { CopilotContextType, Message, PageContext } from '../lib/ai/types';
import { Chat, Content } from '@google/genai';
import { useShop } from './ShopContext';
import { api } from '../lib/db';

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(AVAILABLE_MODELS[0]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useShop();
  
  const [dbApiKey, setDbApiKey] = useState<string | undefined>(undefined);

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
    else if (path.includes('/analytics')) name = 'Analytics';
    else if (path.includes('/users')) name = 'Users';
    else if (path.includes('/blog')) name = 'Blog';
    else if (path.includes('/newsletter')) name = 'Newsletter';
    else if (path.includes('/contact')) name = 'Contact';
    else if (path.includes('/profile')) name = 'My Profile';

    setPageContext(prev => ({
        ...prev,
        route: path,
        pageName: name,
        pageData: prev.route === path ? prev.pageData : undefined 
    }));
  }, [location.pathname]);

  useEffect(() => {
    const fetchSecureSettings = async () => {
      try {
        const adminSettings = await api.getAdminSettings();
        if (adminSettings?.geminiApiKey) {
          setDbApiKey(adminSettings.geminiApiKey);
        }
      } catch (e) {
        console.warn("Copilot: Could not fetch secure settings.");
      }
    };
    fetchSecureSettings();
  }, []);

  const getHistory = (): Content[] => {
    return messages
        .filter(m => !m.isError)
        .map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));
  };

  const initChat = (modelToUse: string, history: Content[] = []) => {
    const apiKey = dbApiKey || settings.geminiApiKey || process.env.API_KEY;
    if (geminiClient.isAvailable(apiKey)) {
        const prompt = generateSystemPrompt(pageContext);
        chatSession.current = geminiClient.createChat(prompt, apiKey, modelToUse, history);
    }
  };

  useEffect(() => {
    if (settingsLoading) return;
    if (!chatSession.current) {
        initChat(currentModel);
    }
  }, [pageContext.pageName, pageContext.pageData, settings.geminiApiKey, dbApiKey]); 

  useEffect(() => {
      if (chatSession.current) {
          const history = getHistory();
          initChat(currentModel, history);
      }
  }, [currentModel]);

  const executors = createFunctionExecutors({ navigate });

  const sendMessage = useCallback(async (content: string) => {
    const apiKey = dbApiKey || settings.geminiApiKey || process.env.API_KEY;
    
    if (!chatSession.current) {
      if (geminiClient.isAvailable(apiKey)) {
        initChat(currentModel);
      } else {
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            content: "Copilot is not configured. Please add a Gemini API Key in App Settings.",
            timestamp: new Date(),
            isError: true
        }]);
        return;
      }
    }
    
    if (!chatSession.current || !content.trim()) return;

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content, 
        timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const attemptSend = async (model: string): Promise<string> => {
        try {
            if (model !== currentModel) {
                const history = getHistory();
                history.push({ role: 'user', parts: [{ text: content }] }); 
                initChat(model, history);
                setCurrentModel(model);
            }

            let response = await chatSession.current!.sendMessage({ message: content });
            
            while (response.functionCalls && response.functionCalls.length > 0) {
                const functionResponses = await Promise.all(
                    response.functionCalls.map(async (call) => {
                        const executor = (executors as any)[call.name];
                        const result = executor ? await executor(call.args) : { error: `Function ${call.name} not found` };
                        return { 
                            functionResponse: { 
                                name: call.name, 
                                id: call.id, 
                                response: { result } 
                            } 
                        };
                    })
                );
                response = await chatSession.current!.sendMessage({ message: functionResponses });
            }

            return response.text || "I've handled that request for you.";

        } catch (e: any) {
            console.error(`Attempt failed with ${model}:`, e);
            const isQuotaError = e.status === 429 || e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED') || e.status === 'RESOURCE_EXHAUSTED';

            if (isQuotaError) {
                const fallback = geminiClient.getFallbackModel(model);
                if (fallback) {
                    console.log(`Quota exceeded on ${model}. Switching to fallback: ${fallback}`);
                    return attemptSend(fallback);
                } else {
                    throw new Error("All available models are currently overloaded. Please try again later.");
                }
            }
            throw e;
        }
    };

    try {
        const responseText = await attemptSend(currentModel);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: responseText, 
            timestamp: new Date() 
        }]);
    } catch (e: any) {
        console.error("Jambo Copilot Fatal Error:", e);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: e.message || "I'm having trouble processing that right now. Please try again.", 
            timestamp: new Date(), 
            isError: true 
        }]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext, executors, settings.geminiApiKey, dbApiKey, currentModel, messages]);

  const toggleDrawer = () => setIsOpen(prev => !prev);
  
  const clearHistory = () => {
      setMessages([]);
      initChat(currentModel, []);
  };

  const setModel = (model: string) => {
      setCurrentModel(model);
  };

  return (
    <CopilotContext.Provider value={{
        messages, isOpen, isLoading, pageContext, 
        sendMessage, toggleDrawer, clearHistory, 
        updatePageContext: (ctx) => setPageContext(prev => ({...prev, ...ctx})),
        setPageData,
        currentModel,
        availableModels: AVAILABLE_MODELS,
        setModel
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
