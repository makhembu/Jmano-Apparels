
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AVAILABLE_MODELS } from '../lib/ai/opencode-client';
import { createFunctionExecutors } from '../lib/ai/function-executors';
import { CopilotContextType, Message, PageContext } from '../lib/ai/types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(AVAILABLE_MODELS[0]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth(); // We need to pass the auth token

  const [pageContext, setPageContext] = useState<PageContext>({
    route: location.pathname,
    pageName: 'Dashboard',
    availableActions: []
  });

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

  const executors = createFunctionExecutors({ navigate });

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // 1. Optimistic UI update
    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content, 
        timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        // 2. Get Auth Token for Security
        const { data: { session } } = await (supabase.auth as any).getSession();
        if (!session?.access_token) {
            throw new Error("Unauthorized. Please log in.");
        }

        // 3. Prepare History for Context
        // Filter out error messages or system messages if needed
        const historyForApi = messages.map(m => ({
            role: m.role,
            content: m.content
        }));

        // 4. Call Secure API
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                message: content,
                history: historyForApi,
                pageContext: pageContext,
                model: currentModel
            })
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || "Failed to communicate with Copilot.");
        }

        const data = await response.json();
        
        // 5. Handle Function Calls
        // The API returns { text, functionCalls }
        if (data.functionCalls && data.functionCalls.length > 0) {
            // Note: In a full implementation, you would execute the functions locally here
            // then send the result BACK to the API.
            // For this prototype, we execute and just show the final text result or a success message.
            
            await Promise.all(
                data.functionCalls.map(async (call: any) => {
                    const executor = (executors as any)[call.name];
                    if (executor) {
                        await executor(call.args);
                    }
                })
            );
        }

        // 6. Add Model Response
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: data.text || "Action completed.", 
            timestamp: new Date() 
        }]);

    } catch (e: any) {
        console.error("Jambo Copilot Error:", e);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: e.message || "I'm having trouble processing that right now.", 
            timestamp: new Date(), 
            isError: true 
        }]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext, executors, currentModel, messages]);

  const toggleDrawer = () => setIsOpen(prev => !prev);
  
  const clearHistory = () => {
      setMessages([]);
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
