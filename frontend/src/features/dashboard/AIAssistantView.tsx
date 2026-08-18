import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, Bot, Send, Bookmark, BookmarkCheck, Star
} from 'lucide-react';

export const AIAssistantView: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async (selectLatest = false) => {
    try {
      setHistoryLoading(true);
      const res = await api.get('/assistant/sessions');
      if (res.data.status === 'success') {
        const list = res.data.sessions || [];
        setSessions(list);
        if (selectLatest && list.length > 0) {
          setCurrentSession(list[0]);
        }
      }
    } catch (err: any) {
      toast('Failed to load chat history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSendMessage = async (forcedText?: string) => {
    const textToSend = forcedText || inputMessage;
    if (!textToSend.trim()) return;

    try {
      setLoading(true);
      setInputMessage('');
      
      const payload = {
        content: textToSend,
        sessionId: currentSession?._id || undefined
      };

      const res = await api.post('/assistant/chat', payload);
      if (res.data.status === 'success') {
        setCurrentSession(res.data.session);
        fetchHistory(false); // refresh background history list
      }
    } catch (err: any) {
      toast('AI assistant connection timeout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSession = () => {
    setCurrentSession(null);
    setInputMessage('');
  };

  const handleToggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/assistant/sessions/${id}/save`);
      if (res.data.status === 'success') {
        toast(res.data.message, 'success');
        fetchHistory();
        if (currentSession?._id === id) {
          setCurrentSession(res.data.session);
        }
      }
    } catch (err) {
      toast('Save action failed.', 'error');
    }
  };

  const handleAddFavorite = async (message: any) => {
    if (!currentSession) return;
    try {
      const res = await api.post(`/assistant/sessions/${currentSession._id}/favorite`, {
        messageId: message._id || new Date().getTime().toString(),
        content: message.content
      });
      if (res.data.status === 'success') {
        toast(res.data.message, 'success');
        setCurrentSession(res.data.session);
      }
    } catch (err) {
      toast('Failed to bookmark message response.', 'error');
    }
  };

  // Safe custom Markdown and Code renderer to support premium styling without heavy parsing packages
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    let isCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      // Handle Code Block wrapper toggles
      if (line.trim().startsWith('```')) {
        if (isCodeBlock) {
          isCodeBlock = false;
          const codeString = codeContent.join('\n');
          codeContent = [];
          return (
            <pre key={idx} className="bg-[#070514] border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed my-2.5">
              {codeString}
            </pre>
          );
        } else {
          isCodeBlock = true;
          return null;
        }
      }

      if (isCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Handle Headers
      if (line.trim().startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-black text-white mt-4 mb-2">{line.replace('### ', '')}</h4>;
      }
      if (line.trim().startsWith('## ')) {
        return <h3 key={idx} className="text-base font-extrabold text-white mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }

      // Handle bullet lists
      if (line.trim().startsWith('- ')) {
        return (
          <li key={idx} className="list-disc pl-5 text-[11px] text-slate-400 mt-1">
            {line.replace('- ', '')}
          </li>
        );
      }
      if (line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="list-disc pl-5 text-[11px] text-slate-400 mt-1">
            {line.replace('* ', '')}
          </li>
        );
      }

      // Default text mapping with basic bold check
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      
      return (
        <p key={idx} className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">
          {line.split('**').map((part, i) => (
            i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
          ))}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          AI Chat Assistant <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Intelligent context-aware conversation helper to explain algorithm syntax and resolve debugging challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch min-h-[550px]">
        
        {/* Left sidebar: saved sessions index */}
        <Card className="lg:col-span-1 border-white/5 bg-card/10 p-4 flex flex-col gap-4">
          <Button 
            variant="primary" 
            onClick={handleCreateNewSession}
            className="w-full text-xs h-9 bg-gradient-to-r from-violet-600 to-indigo-600 border-none"
            leftIcon={<Bot className="h-4 w-4" />}
          >
            New Conversation
          </Button>

          <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Previous Conversations</span>
            {historyLoading ? (
              <div className="py-8 flex justify-center">
                <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                </svg>
              </div>
            ) : sessions.length === 0 ? (
              <span className="text-[10px] text-slate-500 italic block py-4 text-center">No chat logs recorded.</span>
            ) : (
              sessions.map((sess) => (
                <button
                  key={sess._id}
                  onClick={() => setCurrentSession(sess)}
                  className={`w-full text-left p-3 rounded-lg border text-xs flex justify-between items-center cursor-pointer transition-all ${
                    currentSession?._id === sess._id 
                      ? 'border-primary bg-primary/10 text-white' 
                      : 'border-white/5 bg-white/2 text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate max-w-[120px]">{sess.title}</span>
                  <button 
                    onClick={(e) => handleToggleSave(sess._id, e)}
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {sess.isSaved ? (
                      <BookmarkCheck className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>
                </button>
              ))
            )}
          </div>
        </Card>

        {/* Chat Thread Panel */}
        <Card className="lg:col-span-3 border-white/5 bg-card/10 flex flex-col justify-between max-h-[600px] overflow-hidden">
          
          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
            
            {/* Seed starting message if empty */}
            {!currentSession ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-12">
                <Bot className="h-12 w-12 text-primary animate-pulse" />
                <div>
                  <h3 className="text-base font-bold text-white">Ask your AI Mentor</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                    Query DSA structures, paste compiler warning logs to optimize variables runtime, or fetch quick flashcards reviews.
                  </p>
                </div>
                
                {/* Suggestions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                  {[
                    { text: 'Explain DSA Binary Search tree algorithms' },
                    { text: 'Optimize nested loop code patterns' },
                    { text: 'Generate SQL flashcards for database revision' },
                    { text: 'Generate checkpoint quiz for CS fundamentals' }
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s.text)}
                      className="text-left text-[11px] p-3 rounded-lg border border-white/5 bg-white/2 text-slate-400 hover:text-white hover:border-primary/20 cursor-pointer transition-all"
                    >
                      {s.text}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              currentSession.messages?.map((msg: any, index: number) => (
                <div 
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'self-end flex-row-reverse text-right' : 'self-start text-left'}`}
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary/20 text-primary' : 'bg-violet-600 text-white'}`}>
                    {msg.role === 'user' ? 'ME' : <Bot className="h-4.5 w-4.5" />}
                  </div>

                  <div className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    msg.role === 'user' 
                      ? 'bg-primary/5 border-primary/20 text-slate-200' 
                      : 'bg-slate-950/40 border-white/5 text-slate-300'
                  }`}>
                    <div className="text-xs leading-relaxed">
                      {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                    </div>
                    
                    {msg.role === 'assistant' && (
                      <div className="flex gap-2 justify-end border-t border-white/5 pt-2 mt-1">
                        <button
                          onClick={() => handleAddFavorite(msg)}
                          className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer flex items-center gap-1 text-[9px] uppercase font-bold"
                          title="Favorite response"
                        >
                          <Star className="h-3.5 w-3.5" /> Favorite
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {loading && (
              <div className="self-start flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 animate-bounce">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="p-4 rounded-xl border bg-slate-950/40 border-white/5 text-slate-500 text-xs">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message form Input */}
          <div className="border-t border-white/5 p-4 bg-slate-900/30 flex gap-3 shrink-0">
            <textarea
              placeholder="Ask anything (e.g. explain trees complexity or optimize variables scope)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg p-3 text-xs text-foreground focus:outline-none focus:border-primary/45 resize-none h-11"
            />
            <Button
              variant="primary"
              onClick={() => handleSendMessage()}
              disabled={loading || !inputMessage.trim()}
              className="h-11 px-4 cursor-pointer shrink-0"
              rightIcon={<Send className="h-4 w-4" />}
            >
              Ask
            </Button>
          </div>

        </Card>

      </div>

    </div>
  );
};
export default AIAssistantView;
