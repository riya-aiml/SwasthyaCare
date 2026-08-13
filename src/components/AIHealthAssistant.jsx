import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, ShieldAlert } from 'lucide-react';
import { mockRAGKnowledgeBase, mockPatient } from '../data/mockData';

export default function AIHealthAssistant({ isOpen, setIsOpen }) {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${mockPatient.name}! 👋 I am your SwasthyaCare AI Health Assistant. I can help you navigate the platform, explain your calculated risk score factors, or check appointment details.\n\n*Note: I provide navigation and summary support — I do not give medical diagnoses.*`
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputMessage('');

    // RAG Pipeline Keyword Retrieval Simulation
    setTimeout(() => {
      const lowerText = userText.toLowerCase();
      let botResponse = "I can help you navigate your appointments, explain your risk scores, or check your live OPD queue position. For diagnostic concerns, please complete the formal Symptom Intake form or consult Dr. Amanda Vance.";

      for (const item of mockRAGKnowledgeBase) {
        if (item.keywords.some(kw => lowerText.includes(kw))) {
          botResponse = item.response;
          break;
        }
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 600);
  };

  if (!isOpen) {
    return (
      <div className="chat-widget-container">
        <button className="chat-trigger-btn" onClick={() => setIsOpen(true)} title="AI Health Assistant">
          <MessageSquare size={26} color="white" />
        </button>
      </div>
    );
  }

  return (
    <div className="chat-widget-container">
      <div className="chat-window">
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '0.4rem', borderRadius: '50%' }}>
              <Bot size={20} color="white" />
            </div>
            <div>
              <div className="font-patient-heading" style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Health Assistant</div>
              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>Grounded RAG Pipeline</div>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div style={{ background: 'var(--accent-coral-light)', borderBottom: '1px solid rgba(242, 164, 136, 0.3)', padding: '0.4rem 0.85rem', fontSize: '0.75rem', color: '#8A4832', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={14} color="#8A4832" />
          <span>Decision Support Only — Not a Substitute for Medical Advice</span>
        </div>

        {/* Message History */}
        <div className="chat-messages">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat-message ${m.sender}`}>
              {m.text}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input 
            type="text" 
            className="form-input" 
            placeholder="Ask about risk scores, appointments..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{ flex: 1, fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
          />
          <button type="submit" className="btn btn-coral" style={{ padding: '0.55rem 0.85rem' }}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
