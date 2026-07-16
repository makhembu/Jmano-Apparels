
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { openCodeClient, AVAILABLE_MODELS, ChatMessage, ToolDefinition } from '../lib/ai/opencode-client';
import { generateSystemPrompt } from '../lib/ai/system-prompt';
import { createFunctionExecutors } from '../lib/ai/function-executors';
import { functionDeclarations } from '../lib/ai/tools';
import { CopilotContextType, Message, PageContext } from '../lib/ai/types';
import { useShop } from '../context/ShopContext';

const CopilotContext = createContext<CopilotContextType | undefined>(undefined);

export const CopilotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(AVAILABLE_MODELS[0]);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings, loading: settingsLoading } = useShop();
  
  const [pageContext, setPageContext] = useState<PageContext>({
    route: location.pathname,
    pageName: 'Dashboard',
    availableActions: []
  });

  const chatHistory = useRef<ChatMessage[]>([]);

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
    if (settingsLoading) return;
    chatHistory.current = [];
  }, [pageContext.pageName, pageContext.pageData, settings.opencodeApiKey, settingsLoading, currentModel]); 

  const executors = createFunctionExecutors({ navigate });

  const sendMessage = useCallback(async (content: string) => {
    const apiKey = settings.opencodeApiKey || settings.geminiApiKey || undefined;
    
    if (!apiKey) {
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'model', 
        content: "OpenCode API Key not configured. Please add it in App Settings.", 
        timestamp: new Date(), 
        isError: true 
      }]);
      return;
    }
    
    if (!content.trim()) return;

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content, 
        timestamp: new Date() 
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const systemPrompt = generateSystemPrompt(pageContext);
      const apiMessages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.current,
        { role: 'user', content }
      ];

      let response = await openCodeClient.chat(apiMessages, functionDeclarations, apiKey, currentModel);
      
      let assistantMessage = response.choices[0].message;
      
      while (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolResults: ChatMessage[] = [];
        
        for (const call of assistantMessage.tool_calls) {
          const executor = (executors as any)[call.function.name];
          const args = JSON.parse(call.function.arguments);
          const result = executor ? await executor(args) : { error: `Function ${call.function.name} not found` };
          toolResults.push({
            role: 'tool',
            content: JSON.stringify({ result }),
            tool_call_id: call.id
          });
        }

        apiMessages.push(
          { role: 'assistant', content: assistantMessage.content || '', tool_calls: assistantMessage.tool_calls },
          ...toolResults
        );

        response = await openCodeClient.chat(apiMessages, functionDeclarations, apiKey, currentModel);
        assistantMessage = response.choices[0].message;
      }

      const text = assistantMessage.content || "I've handled that request for you.";
      chatHistory.current.push(
        { role: 'user', content },
        { role: 'assistant', content: text }
      );
      
      setMessages(prev => [...prev, { 
          id: Date.now().toString(), 
          role: 'model', 
          content: text, 
          timestamp: new Date() 
      }]);

    } catch (e: any) {
        console.error("Jambo Copilot Error:", e);
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            content: "I'm having trouble processing that right now. Please try again.", 
            timestamp: new Date(), 
            isError: true 
        }]);
    } finally {
        setIsLoading(false);
    }
  }, [pageContext, executors, settings.opencodeApiKey, currentModel]);

  const toggleDrawer = () => setIsOpen(prev => !prev);
  
  const clearHistory = () => {
      setMessages([]);
      chatHistory.current = [];
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
