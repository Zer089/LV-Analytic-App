import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface ChatBotProps {
  data?: any;
}

export const ChatBot: React.FC<ChatBotProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hallo! Ich bin Ihr Siemens NSHV-Experte. Wie kann ich Ihnen heute helfen?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentKnowledge, setCurrentKnowledge] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/knowledge')
      .then(res => res.json())
      .then(data => setCurrentKnowledge(data))
      .catch(err => console.error("Failed to load knowledge:", err));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Initialize inside handleSend to ensure fresh instance/key
      const aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Filter out messages and format for Gemini API
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'model')
        .map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

      // Add context about the current analysis if available
      const analysisContext = data ? `\n\nAktuelle Analyse-Ergebnisse:\n${JSON.stringify(data, null, 2)}` : '';

      // Helper for retrying with delay and model fallback
      const generateWithRetry = async (maxRetries = 2) => {
        let lastError;
        
        // Try models in order: 3.1 Flash Lite (High Quota) -> 3 Flash (Better Reasoning)
        const models = ["gemini-3.1-flash-lite-preview", "gemini-3-flash-preview"];
        
        const kb = currentKnowledge || { 
          expertRole: "Experte für Siemens Niederspannungshauptverteilungen (NSHV)",
          systems: ["SIVACON S8", "ALPHA 3200 classic", "ALPHA 3200 eco"],
          recommendationLogic: { SIVACON_S8: { conditions: [] }, ALPHA_3200_classic: { conditions: [] } },
          generalKnowledge: []
        };

        for (const modelName of models) {
          for (let i = 0; i <= maxRetries; i++) {
            try {
              return await aiInstance.models.generateContent({
                model: modelName,
                contents: [
                  ...history,
                  { role: 'user', parts: [{ text: userMessage + analysisContext }] }
                ],
                config: {
                  systemInstruction: `Du bist ein ${kb.expertRole}, insbesondere für die Systeme ${kb.systems.join(', ')}. 
                  Beantworte Fragen präzise, professionell und hilfreich auf Deutsch.
                  
                  Du hast Zugriff auf die aktuellen Analyse-Ergebnisse des Dashboards und sollst diese nutzen, um spezifische Fragen zum extrahierten Leistungsverzeichnis zu beantworten.
                  
                  Hier ist deine Tool-Logik zur Systemempfehlung:
                  - SIVACON S8 ist erforderlich, wenn:
                    ${kb.recommendationLogic.SIVACON_S8.conditions.map((c: any) => `* ${c}`).join('\n                    ')}
                  - ALPHA 3200 classic ist erforderlich (schließt eco aus), wenn:
                    ${kb.recommendationLogic.ALPHA_3200_classic.conditions.map((c: any) => `* ${c}`).join('\n                    ')}
                  - ALPHA 3200 eco ist die Standardlösung für einfache Anwendungen bis 3200A, wenn keine der obigen Bedingungen für S8 oder classic zutreffen.
                  
                  Zusätzliches Wissen:
                  ${kb.generalKnowledge.map((k: any) => `- ${k}`).join('\n                  ')}`,
                },
              });
            } catch (error: any) {
              lastError = error;
              const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
              if (isQuotaError && i < maxRetries) {
                const delay = (i + 1) * 2000;
                console.warn(`Chat quota exceeded for ${modelName}, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              } else if (isQuotaError && i === maxRetries) {
                console.warn(`Quota exhausted for ${modelName}, trying next model...`);
                break; // Try next model in the list
              } else {
                throw error;
              }
            }
          }
        }
        throw lastError;
      };

      const response = await generateWithRetry();
      const botResponse = response.text || "Entschuldigung, ich konnte keine Antwort generieren.";
      
      setMessages(prev => [...prev, { role: 'model', text: botResponse }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
      const errorMessage = isQuotaError 
        ? "Die KI-Quote ist derzeit erschöpft. Bitte versuchen Sie es in einer Minute erneut."
        : "Es gab einen Fehler bei der Verbindung zum KI-Dienst. Bitte versuchen Sie es später erneut.";
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
              isMaximized 
                ? 'fixed inset-12 w-auto h-auto z-[60] mb-0 shadow-2xl overflow-hidden flex flex-col' 
                : 'w-[500px] max-w-[calc(100vw-48px)] h-[750px] max-h-[calc(100vh-120px)] mb-4'
            } selection:bg-[#00cccc] selection:text-white`}
          >
            {/* Header */}
            <div className="bg-[#009999] p-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Siemens NSHV Experte</h3>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-[10px] text-white/80 uppercase tracking-wider font-medium">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title={isMaximized ? "Verkleinern" : "Vergrößern"}
                >
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setIsMaximized(false);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                    <div className={`p-2 rounded-lg shrink-0 ${msg.role === 'user' ? 'bg-[#009999]/10 text-[#009999]' : 'bg-white border border-slate-200 text-slate-400'}`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div 
                      className={`p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-[#009999]/70 text-white rounded-br-none backdrop-blur-sm' 
                          : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                      }`}
                    >
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#009999]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Fragen Sie etwas..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#009999]/20 focus:border-[#009999] transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#009999] text-white rounded-lg hover:bg-[#007777] disabled:opacity-50 disabled:hover:bg-[#009999] transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center flex items-center justify-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Gemini 3.1 Pro
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-[#009999] text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        
        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="absolute right-full mr-3 px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none"
            >
              Chatbot
              <div className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};
