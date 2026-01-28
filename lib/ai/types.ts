
export type MessageRole = 'user' | 'model' | 'system';

export interface FunctionCall {
  name: string;
  args: Record<string, any>;
  result?: any;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  functionCalls?: FunctionCall[];
  isError?: boolean;
}

export interface PageContext {
  route: string;
  pageName: string;
  pageData?: Record<string, unknown>;
  availableActions: string[];
}

export interface CopilotContextType {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  pageContext: PageContext;
  sendMessage: (content: string) => Promise<void>;
  toggleDrawer: () => void;
  clearHistory: () => void;
  updatePageContext: (context: Partial<PageContext>) => void;
  setPageData: (data: Record<string, unknown> | undefined) => void;
}

export interface HighlightTarget {
  elementId: string;
  duration?: number;
  scrollIntoView?: boolean;
}
