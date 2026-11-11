import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  ShieldAlert,
  Trash2,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  PhoneCall,
  Compass,
  Languages,
  Loader2,
  Info,
  CheckCircle,
} from 'lucide-react';
import { chatService } from '../services/chatService';

export default function AIHealthAssistant({ currentTab = 'default', onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [quickChips, setQuickChips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [locale, setLocale] = useState('en'); // 'en' or 'hi'
  const [errorMsg, setErrorMsg] = useState(null);
  const [showSessionDrawer, setShowSessionDrawer] = useState(false);
  const [feedbackSuccessId, setFeedbackSuccessId] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, sending]);

  // Load or initialize active session when widget opens
  useEffect(() => {
    if (isOpen) {
      loadSessionsAndActive();
      fetchQuickActions();
    }
  }, [isOpen, currentTab]);

  // Fetch quick prompt chips based on active tab
  const fetchQuickActions = async () => {
    try {
      const chips = await chatService.getQuickActions(currentTab);
      setQuickChips(chips);
    } catch (err) {
      console.warn('Failed to fetch quick actions:', err.message);
    }
  };

  // Load patient sessions and default to latest or create first
  const loadSessionsAndActive = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const sessionList = await chatService.listSessions();
      setSessions(sessionList);

      if (sessionList.length > 0) {
        const activeId = currentSessionId || sessionList[0]._id;
        setCurrentSessionId(activeId);
        await loadMessagesForSession(activeId);
      } else {
        // Create initial session
        await handleCreateNewSession();
      }
    } catch (err) {
      console.error('Session load failed:', err);
      setErrorMsg('Could not connect to health assistant. Operating in offline mode.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesForSession = async (sessionId) => {
    try {
      const msgs = await chatService.getSessionMessages(sessionId);
      setMessages(msgs);
    } catch (err) {
      console.error('Message load failed:', err);
      setErrorMsg('Failed to load message history.');
    }
  };

  const handleCreateNewSession = async () => {
    try {
      setLoading(true);
      const { session, initialMessage } = await chatService.createSession('New Health Conversation');
      setSessions((prev) => [session, ...prev]);
      setCurrentSessionId(session._id);
      setMessages([initialMessage]);
      setShowSessionDrawer(false);
    } catch (err) {
      console.error('Create session failed:', err);
      setErrorMsg('Failed to create new conversation.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation? This will permanently erase all messages under your Right to Erasure.')) {
      return;
    }

    try {
      await chatService.deleteSession(sessionId);
      const updated = sessions.filter((s) => s._id !== sessionId);
      setSessions(updated);

      if (currentSessionId === sessionId) {
        if (updated.length > 0) {
          setCurrentSessionId(updated[0]._id);
          await loadMessagesForSession(updated[0]._id);
        } else {
          await handleCreateNewSession();
        }
      }
    } catch (err) {
      console.error('Delete session failed:', err);
      alert('Failed to delete session: ' + err.message);
    }
  };

  const handleSelectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    setShowSessionDrawer(false);
    setLoading(true);
    await loadMessagesForSession(sessionId);
    setLoading(false);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || sending) return;

    if (!currentSessionId) {
      await handleCreateNewSession();
    }

    const optimisticUserMsg = {
      _id: `temp_${Date.now()}`,
      sender: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInputMessage('');
    setSending(true);
    setErrorMsg(null);

    try {
      const result = await chatService.sendMessage(currentSessionId, text, locale);
      // Replace optimistic message and append assistant message
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m._id !== optimisticUserMsg._id);
        return [...withoutTemp, result.userMessage, result.assistantMessage];
      });

      // Update session title in list if applicable
      setSessions((prev) =>
        prev.map((s) => (s._id === currentSessionId ? { ...s, lastMessageAt: new Date().toISOString() } : s))
      );
    } catch (err) {
      console.error('Send message failed:', err);
      setErrorMsg(err.message || 'Failed to receive response. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    try {
      await chatService.submitFeedback(messageId, rating);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, feedback: { rating, submittedAt: new Date() } } : m))
      );
      setFeedbackSuccessId(messageId);
      setTimeout(() => setFeedbackSuccessId(null), 2500);
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const handleActionClick = (action) => {
    if (!action) return;
    if (action.type === 'EMERGENCY_MODAL') {
      window.open(action.target || 'tel:112', '_self');
    } else if (action.type === 'NAVIGATE_TAB' || action.type === 'CONFIRM_BOOKING' || action.type === 'ESCALATE_DOCTOR') {
      if (onNavigate && action.target) {
        onNavigate(action.target);
      }
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-full shadow-2xl hover:shadow-teal-500/25 transition-all duration-200 transform hover:-translate-y-0.5 border border-teal-400/30 group"
          title="SwasthyaCare AI Health Assistant"
        >
          <div className="relative">
            <Bot size={24} className="text-white group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold tracking-wide">AI Health Assistant</div>
            <div className="text-[10px] text-teal-100 flex items-center gap-1">
              <span>Grounded Decision Support</span>
            </div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[420px] h-[640px] max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden font-sans animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* 1. Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-sm leading-tight flex items-center gap-2">
              <span>SwasthyaCare Assistant</span>
              <span className="text-[10px] bg-teal-500/40 border border-teal-300/40 px-1.5 py-0.5 rounded text-teal-100 font-mono">
                RAG v1.0
              </span>
            </div>
            <div className="text-[11px] text-teal-100/90 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>ICMR & WHO Guideline Grounded</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Language Selector */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'hi' : 'en')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              locale === 'hi' ? 'bg-amber-400 text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Toggle English / Hindi Query Mode"
          >
            <Languages size={14} />
            <span>{locale === 'hi' ? 'हिंदी' : 'EN'}</span>
          </button>

          {/* New Chat Button */}
          <button
            onClick={handleCreateNewSession}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Start New Conversation"
          >
            <Plus size={16} />
          </button>

          {/* Sessions Drawer Toggle */}
          <button
            onClick={() => setShowSessionDrawer(!showSessionDrawer)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSessionDrawer ? 'bg-white text-teal-800' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Conversation History"
          >
            <MessageSquare size={16} />
          </button>

          {/* Close Window */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
            title="Close Assistant"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Educational Safety Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200/80 px-3 py-1.5 text-[11px] text-amber-900 flex items-center gap-2">
        <ShieldAlert size={14} className="text-amber-700 flex-shrink-0" />
        <span className="leading-tight">
          <strong>Decision Support Only:</strong> Non-diagnostic health navigation. Not for acute emergencies.
        </span>
      </div>

      {/* 3. Session Drawer Overlay (When Active) */}
      {showSessionDrawer && (
        <div className="absolute inset-x-0 top-[88px] bottom-0 bg-slate-900/95 z-20 text-white p-4 flex flex-col backdrop-blur-sm animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Your Conversations ({sessions.length})
            </span>
            <button
              onClick={() => setShowSessionDrawer(false)}
              className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
            >
              <span>Back</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-1.5">
            {sessions.map((sess) => (
              <div
                key={sess._id}
                onClick={() => handleSelectSession(sess._id)}
                className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between cursor-pointer transition-all ${
                  sess._id === currentSessionId
                    ? 'bg-teal-600/30 border border-teal-500/50 text-white'
                    : 'bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 text-slate-300'
                }`}
              >
                <div className="truncate pr-2">
                  <div className="text-xs font-semibold truncate">{sess.title || 'Conversation'}</div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(sess.lastMessageAt || sess.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(sess._id, e)}
                  className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Erase conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-700">
            <button
              onClick={handleCreateNewSession}
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2"
            >
              <Plus size={14} />
              <span>Start Fresh Conversation</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Chat Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Loader2 size={24} className="animate-spin text-teal-600 mb-2" />
            <span>Loading conversation...</span>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              const isAssistant = msg.sender === 'assistant';
              const isEmergency = msg.isEmergency;

              return (
                <div key={msg._id || index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-teal-600 text-white rounded-br-xs'
                        : isEmergency
                        ? 'bg-rose-50 border-2 border-rose-500 text-rose-950 rounded-bl-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Header badge for emergency or clinical scope */}
                    {isEmergency && (
                      <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs pb-1.5 mb-1.5 border-b border-rose-200">
                        <AlertTriangle size={15} />
                        <span>CRITICAL MEDICAL ALERT</span>
                      </div>
                    )}

                    {/* Content text */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Action Cards (Tasks S11-04, S11-08, S11-10) */}
                    {msg.actionSuggestion && msg.actionSuggestion.type !== 'NONE' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        {msg.actionSuggestion.type === 'EMERGENCY_MODAL' ? (
                          <div className="flex flex-col gap-1.5">
                            <a
                              href="tel:112"
                              className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 text-xs shadow-md transition-colors"
                            >
                              <PhoneCall size={14} />
                              <span>Call National Emergency (112)</span>
                            </a>
                            <a
                              href="tel:108"
                              className="w-full py-1.5 px-3 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                            >
                              <span>Call Ambulance Hotline (108)</span>
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleActionClick(msg.actionSuggestion)}
                            className="w-full py-1.5 px-3 bg-teal-50 hover:bg-teal-100 border border-teal-300 text-teal-800 font-semibold rounded-lg flex items-center justify-between text-xs transition-colors group"
                          >
                            <span className="flex items-center gap-1.5">
                              <Compass size={14} className="text-teal-600" />
                              <span>{msg.actionSuggestion.label || 'Navigate in App'}</span>
                            </span>
                            <ChevronRight size={14} className="text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Citations Badges (Scope A & Scope B) */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex flex-wrap gap-1">
                        {msg.citations.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600 border border-slate-200 font-mono"
                            title={c.title}
                          >
                            <Info size={10} className="text-teal-600" />
                            <span>{c.sourceId}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback & Timestamp row for Assistant messages */}
                  {isAssistant && msg._id && !msg._id.startsWith('temp_') && (
                    <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      {feedbackSuccessId === msg._id ? (
                        <span className="text-emerald-600 flex items-center gap-0.5">
                          <CheckCircle size={10} />
                          <span>Thank you!</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span>Helpful?</span>
                          <button
                            onClick={() => handleFeedback(msg._id, 'helpful')}
                            className={`p-0.5 rounded hover:text-teal-700 transition-colors ${
                              msg.feedback?.rating === 'helpful' ? 'text-teal-600 font-bold' : ''
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp size={11} />
                          </button>
                          <button
                            onClick={() => handleFeedback(msg._id, 'unhelpful')}
                            className={`p-0.5 rounded hover:text-rose-700 transition-colors ${
                              msg.feedback?.rating === 'unhelpful' ? 'text-rose-600 font-bold' : ''
                            }`}
                            title="Unhelpful"
                          >
                            <ThumbsDown size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Sending / Typing Indicator */}
            {sending && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs flex items-center gap-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-teal-600 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-slate-400 text-[11px]">Searching guidelines & app models...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 5. Contextual Quick Prompt Chips (Task S11-04) */}
      {quickChips.length > 0 && (
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              disabled={sending}
              className="flex-shrink-0 px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-full text-[11px] text-slate-700 hover:text-teal-800 transition-colors shadow-xs"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {/* 6. Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={locale === 'hi' ? 'स्वास्थ्य या अपॉइंटमेंट से संबंधित पूछें...' : 'Ask about risk factors, booking, or guidelines...'}
          disabled={sending}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="p-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors shadow-xs"
          title="Send message"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </form>
    </div>
  );
}
