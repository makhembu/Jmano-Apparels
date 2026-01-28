
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
// FIX: Ensuring useLocation and useNavigate are correctly imported from react-router-dom
import { useLocation, useNavigate } from 'react-router-dom';
import { geminiClient } from '../lib/ai/gemini-client';
import { generateSystemPrompt } from '../lib/ai/system-prompt';
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
  
  // Track page context
  const [pageContext, setPageContext] = useState<PageContext>({
    route: location.pathname,
    pageName: 'Dashboard',
    availableActions: []
  });

  const chatSession = useRef<Chat | null>(null);

  // Update context on route change
  useEffect(() => {
    const path = location.pathname;
    let name = 'Dashboard';
    let actions: string[] = [];

    if (path.includes('/orders')) {
        name = path.includes('new') ? 'Create Order' : 'Orders';
        actions = ['findOrders', 'navigate'];
    } else if (path.includes('/products')) {
        name = 'Products';
        actions = ['getProducts', 'navigate'];
    } else if (path.includes('/settings')) {
        name = 'Settings';
    }

    setPageContext(prev => ({
        ...prev,
        route: path,
        pageName: name,
        availableActions: actions
    }));
  }, [location.pathname]);

  // Initialize Chat Session
  useEffect(() => {
    if (geminiClient.isAvailable()) {
        const prompt = generateSystemPrompt(pageContext);
        // Re-create chat when context fundamentally changes or on init
        if (!chatSession.current) {
            chatSession.current = geminiClient.createChat(prompt);
        }
    }
  }, [pageContext.pageName]); 

  const executors = createFunctionExecutors({ navigate });

  const sendMessage = useCallback(async (content: string) => {
    if (!chatSession.current || !content.trim()) return;

    // 1. Add User Message
    const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content,
        timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        // 2. Send to Gemini
        let response = await chatSession.current.sendMessage({ message: content });
        
        // 3. Handle Tool Calls Loop
        while (response.functionCalls && response.functionCalls.length > 0) {
            const functionResponses = await Promise.all(
                response.functionCalls.map(async (call) => {
                    const executor = (executors as any)[call.name];
                    let result;
                    if (executor) {
                        result = await executor(call.args);
                    } else {
                        result = { error: `Function ${call.name} not found` };
                    }
                    
                    return {
                        functionResponse: {
                            name: call.name,
                            id: call.id, // Important for @google/genai matching
                            response: { result }
                        }
                    };
                })
            );

            // Send tool outputs back
            response = await chatSession.current.sendMessage({ message: functionResponses });
        }

        // 4. Add Model Response
        const text = response.text || "I processed that for you.";
        const botMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            content: text,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (e: any) {
        console.error("Copilot Error:", e);
        const errorMsg: Message = {
            id: Date.now().toString(),
            role: 'model',
            content: "Sorry, I encountered an error connecting to Gemini.",
            timestamp: new Date(),
            isError: true
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext]); 

  const toggleDrawer = () => setIsOpen(prev => !prev);
  const clearHistory = () => {
      setMessages([]);
      // Reset chat session with current context
      if (geminiClient.isAvailable()) {
          chatSession.current = geminiClient.createChat(generateSystemPrompt(pageContext));
      }
  };
  const updatePageContext = (ctx: Partial<PageContext>) => setPageContext(prev => ({...prev, ...ctx}));

  return (
    <CopilotContext.Provider value={{
        messages, isOpen, isLoading, pageContext, 
        sendMessage, toggleDrawer, clearHistory, updatePageContext
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
