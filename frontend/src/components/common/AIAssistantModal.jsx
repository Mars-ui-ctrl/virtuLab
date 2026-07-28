import React, { useState, useEffect } from 'react';
import { useLab } from '../../context/LabContext';
import { AI_ASSISTANT_PROMPTS } from '../../data/mockData';
import { Sparkles, X, Send, Bot, Lightbulb, HelpCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AIAssistantModal = () => {
  const { isAIModalOpen, setIsAIModalOpen, aiCustomQuestion, setAiCustomQuestion, currentExperiment } = useLab();
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello Alex! 👋 I am your VirtuLab AI Assistant. I can help troubleshoot your circuit wiring, titration formulas, or microcontroller code. What would you like to explore?`
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    if (aiCustomQuestion) {
      handleAskQuestion(aiCustomQuestion);
      setAiCustomQuestion('');
    }
  }, [aiCustomQuestion]);

  const subjectPrompts = AI_ASSISTANT_PROMPTS[currentExperiment?.subject || 'physics'] || AI_ASSISTANT_PROMPTS.general;

  const handleAskQuestion = (questionText) => {
    const q = questionText || inputVal;
    if (!q.trim()) return;

    // Add user message
    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    // Formulate intelligent predefined AI response matching query
    setTimeout(() => {
      let aiAnswer = "I've analyzed your current 3D workspace state. Everything looks properly configured! Make sure all components are snapped into valid grid positions before hitting Run Simulation.";
      
      const lowerQ = q.toLowerCase();
      if (lowerQ.includes('bulb') || lowerQ.includes('glow') || lowerQ.includes('circuit')) {
        aiAnswer = "To make the bulb glow: 1. Connect Battery (+) -> Wire -> Switch -> Wire -> Bulb -> Battery (-). 2. Make sure the Switch is toggled to ON. 3. Increasing Voltage above 6V will increase filament brightness!";
      } else if (lowerQ.includes('acid') || lowerQ.includes('base') || lowerQ.includes('ph') || lowerQ.includes('titration')) {
        aiAnswer = "Acid-Base Neutralization Tip: Acid (HCl) has pH ~1.5. Adding base (NaOH) gradually increases volume and pH. Endpoint occurs when pH reaches 7.0 (Neutral), turning the Phenolphthalein indicator light magenta!";
      } else if (lowerQ.includes('led') || lowerQ.includes('arduino') || lowerQ.includes('resistor')) {
        aiAnswer = "Arduino LED Wiring Checklist: 1. Long LED leg (Anode) connects to Digital Pin 13. 2. Short leg (Cathode) connects through 220Ω Resistor to GND. 3. Click Run Simulation to execute loop code!";
      } else if (lowerQ.includes('pendulum') || lowerQ.includes('mass') || lowerQ.includes('gravity')) {
        aiAnswer = "Harmonic Motion Formula: Period T = 2π√(L/g). Notice that altering the Bob Mass does NOT affect period T — only Length (L) and Gravity (g) determine oscillation speed!";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiAnswer }]);
    }, 500);
  };

  if (!isAIModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[540px]"
        >
          {/* Header */}
          <div className="gradient-primary p-4 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center space-x-1.5">
                  <span>AI Lab Assistant</span>
                  <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
                </h3>
                <p className="text-xs text-indigo-100">Instant Virtual Lab Help & Explanations</p>
              </div>
            </div>
            <button
              onClick={() => setIsAIModalOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 flex items-center shrink-0">
              <Lightbulb className="w-3.5 h-3.5 mr-1 text-amber-500" />
              Suggested:
            </span>
            {subjectPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(item.question)}
                className="shrink-0 px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-full text-xs text-slate-700 font-medium transition-all"
              >
                {item.question}
              </button>
            ))}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2.5 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {msg.sender === 'ai' ? (
                  <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0 mt-0.5 font-bold text-xs">
                    You
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[82%] ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
              placeholder="Ask AI about circuit wiring, titrations, or equations..."
              className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
            <button
              onClick={() => handleAskQuestion()}
              className="px-3.5 py-2 gradient-primary hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1 transition-all active:scale-95"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
