import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  ShieldAlert,
  AlertTriangle,
  FileText,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Plus,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  PhoneCall,
  Loader2,
  Sparkles,
} from 'lucide-react';
import chatService from '../services/chatService.js';
import { getAuthToken } from '../services/authService.js';

export default function AIHealthAssistant({ isOpen, setIsOpen }) {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showSessionsDropdown, setShowSessionsDropdown] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    'What foods help lower high blood pressure?',
    'What are normal fasting blood glucose ranges per ICMR?',
    'How does the live OPD digital token queue work?',
    'Book an appointment with a cardiologist tomorrow',
    'How do I submit my post-discharge recovery check-in?',
  ];

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Load user sessions when chat widget opens
  useEffect(() => {
    if (isOpen && getAuthToken()) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    try {
      setIsInitializing(true);
      const res = await chatService.getSessions(1, 10);
      const userSessions = res.data?.sessions || [];
      setSessions(userSessions);

      if (userSessions.length > 0) {
        // Select most recent session
        const latest = userSessions[0];
        setActiveSessionId(latest._id);
        await loadSessionMessages(latest._id);
      } else {
        // Create initial session
        await handleCreateNewSession();
      }
    } catch (err) {
      console.warn('Could not load user chat sessions, falling back to local mode:', err.message);
      // Fallback message for unauthenticated or local mock
      setMessages([
        {
          _id: 'local-init',
          role: 'assistant',
          content:
            'Namaste! I am your SwasthyaCare Assistant. I provide evidence-based guidance from ICMR & WHO and assist with OPD appointments. How can I help you today?',
          citations: [],
          intent: 'INTENT_GENERAL_CHITCHAT',
        },
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const loadSessionMessages = async (sessionId) => {
    try {
      setIsLoading(true);
      const res = await chatService.getSession(sessionId);
      setMessages(res.data?.messages || []);
    } catch (err) {
      console.error('Failed to load session messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewSession = async () => {
    try {
      setIsLoading(true);
      const res = await chatService.createSession({
        title: `Health Consultation (${new Date().toLocaleDateString()})`,
      });
      const newSession = res.data?.session;
      if (newSession) {
        setSessions((prev) => [newSession, ...prev]);
        setActiveSessionId(newSession._id);
        setMessages([
          {
            _id: `welcome-${newSession._id}`,
            role: 'assistant',
            content:
              'Namaste! I am your SwasthyaCare Assistant. I provide evidence-based guidance from ICMR & WHO and assist with OPD appointments. How can I help you today?',
            citations: [],
            intent: 'INTENT_GENERAL_CHITCHAT',
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to create new session:', err);
    } finally {
      setIsLoading(false);
      setShowSessionsDropdown(false);
    }
  };

  const handleSelectSession = async (sId) => {
    setActiveSessionId(sId);
    setShowSessionsDropdown(false);
    await loadSessionMessages(sId);
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');

    // Optimistic user message addition
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      let currentSessionId = activeSessionId;
      if (!currentSessionId) {
        const newSessionRes = await chatService.createSession();
        currentSessionId = newSessionRes.data?.session?._id;
        setActiveSessionId(currentSessionId);
      }

      const res = await chatService.sendMessage(currentSessionId, text);
      const { assistantMessage } = res.data || {};

      if (assistantMessage) {
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      const fallbackMsg = {
        _id: `fallback-${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I am unable to connect to the healthcare service at the moment. ' +
          'For acute symptoms, please call 112 or 108. Please try again shortly.',
        citations: [],
        isEmergency: false,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, rating) => {
    try {
      await chatService.submitFeedback(messageId, rating);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, feedback: { ...(m.feedback || {}), rating } }
            : m
        )
      );
    } catch (err) {
      console.error('Feedback submission failed:', err);
    }
  };

  const handleActionConfirm = async (messageId, confirmed) => {
    try {
      setActionLoading((prev) => ({ ...prev, [messageId]: true }));
      const res = await chatService.confirmAction(messageId, confirmed);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
                ...m,
                actionProposal: {
                  ...m.actionProposal,
                  status: res.data?.actionStatus || (confirmed ? 'confirmed' : 'rejected'),
                },
              }
            : m
        )
      );
    } catch (err) {
      console.error('Action confirmation failed:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [messageId]: false }));
    }
  };

  const toggleCitations = (messageId) => {
    setExpandedCitations((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // Trigger floating pill when closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-900 text-white font-medium rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group border border-teal-500/30"
          title="SwasthyaCare AI Health Assistant"
        >
          <div className="relative">
            <Bot size={22} className="text-teal-200 group-hover:rotate-6 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide">AI Health Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-[440px] h-[640px] max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden font-sans animate-in slide-in-from-bottom-5 duration-300">
      {/* 1. Header */}
      <div className="px-4 py-3.5 bg-gradient-to-r from-teal-800 to-teal-950 text-white flex items-center justify-between border-b border-teal-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-teal-600/50 flex items-center justify-center border border-teal-400/30">
            <Bot size={20} className="text-teal-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm tracking-tight text-white">SwasthyaCare Assistant</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Dual-RAG
              </span>
            </div>
            <p className="text-[11px] text-teal-200/80 font-normal">Grounded in ICMR & WHO Guidelines</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* New Session Button */}
          <button
            onClick={handleCreateNewSession}
            disabled={isLoading}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-700/50 rounded-lg transition-colors"
            title="Start New Consultation"
          >
            <Plus size={18} />
          </button>

          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-700/50 rounded-lg transition-colors"
            title="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 2. Global Safety Disclaimer Banner */}
      <div className="px-3.5 py-1.5 bg-amber-50/90 border-b border-amber-200/60 flex items-center gap-2 text-[11px] text-amber-900">
        <ShieldAlert size={14} className="text-amber-700 shrink-0" />
        <span className="line-clamp-1">Decision Support Only — Not a Substitute for Medical Advice</span>
      </div>

      {/* 3. Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60">
        {isInitializing && (
          <div className="flex items-center justify-center h-32 text-slate-400 text-xs gap-2">
            <Loader2 size={16} className="animate-spin text-teal-600" />
            <span>Loading health assistant...</span>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          const citations = msg.citations || [];
          const hasCitations = citations.length > 0;
          const isCitationOpen = expandedCitations[msg._id];
          const actionProposal = msg.actionProposal;

          return (
            <div
              key={msg._id || index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm max-w-[88%] ${
                  isUser
                    ? 'bg-teal-700 text-white rounded-br-xs'
                    : msg.isEmergency
                    ? 'bg-rose-50 border-2 border-rose-300 text-rose-950 rounded-bl-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                }`}
              >
                {/* Emergency Header if Red-Flag */}
                {msg.isEmergency && (
                  <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs mb-2 pb-1.5 border-b border-rose-200">
                    <AlertTriangle size={15} className="text-rose-600" />
                    <span>PRIORITY 0 EMERGENCY ALERT</span>
                  </div>
                )}

                {/* Message Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Emergency Helplines Callout Buttons */}
                {msg.isEmergency && (
                  <div className="mt-3 pt-2 border-t border-rose-200/80 flex flex-wrap gap-2">
                    <a
                      href="tel:112"
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-xs"
                    >
                      <PhoneCall size={12} />
                      <span>Call 112 (Emergency)</span>
                    </a>
                    <a
                      href="tel:108"
                      className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-xs"
                    >
                      <PhoneCall size={12} />
                      <span>Call 108 (Ambulance)</span>
                    </a>
                    <a
                      href="tel:14416"
                      className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 bg-white text-rose-700 border border-rose-300 rounded-md hover:bg-rose-50"
                    >
                      <PhoneCall size={12} />
                      <span>Tele-MANAS (14416)</span>
                    </a>
                  </div>
                )}

                {/* Interactive Action Proposal Card (Sprint 11 Two-Step Confirmation) */}
                {actionProposal && actionProposal.actionType !== 'NONE' && (
                  <div className="mt-3 p-3 bg-teal-50/80 border border-teal-200 rounded-xl text-xs space-y-2 text-slate-800">
                    <div className="flex items-center justify-between font-semibold text-teal-900">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-teal-700" />
                        <span>Proposed Action: {actionProposal.actionType.replace('_', ' ')}</span>
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          actionProposal.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : actionProposal.status === 'rejected'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {actionProposal.status}
                      </span>
                    </div>

                    {/* Parameters Preview */}
                    {actionProposal.parameters && (
                      <div className="bg-white/80 p-2 rounded border border-teal-100 text-[11px] space-y-1 text-slate-700">
                        {actionProposal.parameters.doctor_name && (
                          <div className="flex items-center gap-1">
                            <User size={12} className="text-teal-600" />
                            <span>Doctor: <strong>{actionProposal.parameters.doctor_name}</strong></span>
                          </div>
                        )}
                        {actionProposal.parameters.preferred_time && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-teal-600" />
                            <span>Time: {actionProposal.parameters.preferred_time}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirmation Buttons (Only if status is 'proposed') */}
                    {actionProposal.status === 'proposed' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleActionConfirm(msg._id, true)}
                          disabled={actionLoading[msg._id]}
                          className="flex-1 py-1.5 px-3 bg-teal-700 text-white rounded-lg text-xs font-semibold hover:bg-teal-800 transition-colors flex items-center justify-center gap-1"
                        >
                          {actionLoading[msg._id] ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          <span>Confirm Request</span>
                        </button>
                        <button
                          onClick={() => handleActionConfirm(msg._id, false)}
                          disabled={actionLoading[msg._id]}
                          className="py-1.5 px-3 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}

                    {actionProposal.status === 'confirmed' && (
                      <p className="text-[11px] text-emerald-800 font-medium">
                        ✓ Action confirmed and recorded in your SwasthyaCare account.
                      </p>
                    )}
                  </div>
                )}

                {/* Collapsible Citations Accordion */}
                {hasCitations && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => toggleCitations(msg._id)}
                      className="flex items-center justify-between w-full text-[11px] text-teal-800 font-medium hover:text-teal-900"
                    >
                      <span className="flex items-center gap-1">
                        <FileText size={12} className="text-teal-600" />
                        <span>Sources & Citations ({citations.length})</span>
                      </span>
                      {isCitationOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {isCitationOpen && (
                      <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-teal-300">
                        {citations.map((c, cIdx) => (
                          <div key={cIdx} className="text-[11px] bg-slate-50 p-2 rounded border border-slate-200/70">
                            <div className="flex items-center justify-between text-slate-800 font-semibold">
                              <span>{c.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                                {c.docId || c.doc_id}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Source: {c.sourceOrganization || c.source_organization}
                            </div>
                            {c.snippet && (
                              <p className="text-[10px] text-slate-600 italic mt-1 line-clamp-2">
                                "{c.snippet}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assistant Message Footer: Feedback Buttons & Latency */}
              {!isUser && !msg.isEmergency && (
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleFeedback(msg._id, 'helpful')}
                      className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                        msg.feedback?.rating === 'helpful' ? 'text-teal-700 font-bold' : ''
                      }`}
                      title="Helpful"
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button
                      onClick={() => handleFeedback(msg._id, 'unhelpful')}
                      className={`p-1 rounded hover:bg-slate-200 transition-colors ${
                        msg.feedback?.rating === 'unhelpful' ? 'text-rose-600 font-bold' : ''
                      }`}
                      title="Not helpful"
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                  {msg.latencyMs > 0 && <span>• {msg.latencyMs}ms</span>}
                  {msg.provider && <span>• {msg.provider}</span>}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs bg-white px-3.5 py-2.5 rounded-2xl rounded-bl-xs border border-slate-200 w-fit shadow-xs">
            <Loader2 size={14} className="animate-spin text-teal-600" />
            <span>Consulting clinical & platform guidelines...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Quick Prompts Carousel (Shown when few messages exist) */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] bg-white border border-slate-300/80 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-teal-50 hover:border-teal-400 hover:text-teal-900 transition-colors shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 5. Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about symptoms, ICMR guidelines, OPD queue..."
          disabled={isLoading}
          maxLength={1000}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="p-2.5 bg-teal-700 text-white rounded-xl hover:bg-teal-800 disabled:opacity-40 disabled:hover:bg-teal-700 transition-colors shadow-xs"
          title="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
