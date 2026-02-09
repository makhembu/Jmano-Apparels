
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createFunctionExecutors } from '../lib/ai/function-executors';
import { CopilotContextType, Message, PageContext } from '../lib/ai/types';
import { useShop } from './ShopContext';

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useShop(); // We still use settings to check if AI enabled generally, but key is on backend if possible

  const [pageContext, setPageContext] = useState<PageContext>({
    route: location.pathname,
    pageName: 'Dashboard',
    availableActions: []
  });

  const setPageData = useCallback((data: Record<string, unknown> | undefined) => {
    setPageContext(prev => ({ ...prev, pageData: data }));
  }, []);

  // Update context on route change
  useEffect(() => {
    const path = location.pathname;
    let name = 'Dashboard';
    if (path.includes('/orders')) name = path.includes('new') ? 'Create Order' : 'Orders';
    else if (path.includes('/products')) name = 'Products';
    else if (path.includes('/app-settings')) name = 'App Settings';
    else if (path.includes('/shop-settings')) name = 'Shop Settings';
    else if (path.includes('/analytics')) name = 'Analytics';

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

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content, 
        timestamp: new Date() 
    };
    
    // Optimistic update
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
        // Send to Backend API
        const res = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: content,
                history: messages.map(m => ({ role: m.role, content: m.content })),
                pageContext
            })
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || "Failed to contact Copilot");
        }

        let modelText = data.text;
        const toolCalls = data.functionCalls;

        // Process Tool Calls client-side
        if (toolCalls && toolCalls.length > 0) {
            // We assume for now the model provides a final text response *after* knowing tool results in a real chat session.
            // Since our backend API is single-turn (stateless request), we execute tools here.
            // In a full implementation, we'd send the tool results BACK to the API to get the final text.
            // For simplicity in this fix, we execute and show a generic success message if the model didn't provide text.
            
            for (const call of toolCalls) {
                const executor = (executors as any)[call.name];
                if (executor) {
                    await executor(call.args);
                } else {
                    console.warn(`Tool ${call.name} not found`);
                }
            }
            
            if (!modelText) {
                modelText = "I've processed your request.";
            }
        }

        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: modelText || "Task completed.", 
            timestamp: new Date() 
        }]);

    } catch (e: any) {
        console.error("Jambo Copilot Error:", e);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: "I'm having trouble connecting right now. Please try again later.", 
            timestamp: new Date(), 
            isError: true 
        }]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext, executors, messages]);

  const toggleDrawer = () => setIsOpen(prev => !prev);
  
  const clearHistory = () => {
      setMessages([]);
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