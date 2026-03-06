import React, { useState, useEffect } from 'react';
import { X, Lock, Save, Plus, Trash2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ADMIN_PASSWORD = "SiemensAI2026";

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [knowledge, setKnowledge] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newGeneralFact, setNewGeneralFact] = useState('');

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      fetchKnowledge();
    }
  }, [isAuthenticated, isOpen]);

  const fetchKnowledge = async () => {
    try {
      const response = await fetch('/api/knowledge');
      const data = await response.json();
      setKnowledge(data);
    } catch (err) {
      console.error("Failed to fetch knowledge:", err);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Ungültiges Passwort');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(knowledge),
      });
      if (response.ok) {
        alert('Wissensbasis erfolgreich aktualisiert!');
      }
    } catch (err) {
      alert('Fehler beim Speichern der Wissensbasis');
    } finally {
      setIsSaving(false);
    }
  };

  const addGeneralFact = () => {
    if (!newGeneralFact.trim()) return;
    setKnowledge({
      ...knowledge,
      generalKnowledge: [...knowledge.generalKnowledge, newGeneralFact.trim()]
    });
    setNewGeneralFact('');
  };

  const removeGeneralFact = (index: number) => {
    const updated = [...knowledge.generalKnowledge];
    updated.splice(index, 1);
    setKnowledge({ ...knowledge, generalKnowledge: updated });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-zinc-900 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Admin-Einstellungen</h2>
              <p className="text-xs text-white/60">Wissensbasis & Konfiguration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!isAuthenticated ? (
            <div className="max-w-sm mx-auto py-12 text-center">
              <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Passwort erforderlich</h3>
              <p className="text-sm text-gray-500 mb-6">Dies ist ein geschützter Bereich. Bitte geben Sie das Admin-Passwort ein.</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Passwort eingeben"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-zinc-900 focus:border-transparent outline-none transition-all"
                  autoFocus
                />
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button 
                  type="submit"
                  className="w-full bg-zinc-900 text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all"
                >
                  Anmelden
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {knowledge ? (
                <>
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-5 h-5 text-zinc-900" />
                      <h3 className="font-bold text-lg">Lernfunktion: Allgemeines Wissen</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Erweitern Sie das Wissen des Chatbots durch zusätzliche Vorgaben und Fakten.
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      {knowledge.generalKnowledge.map((fact: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-50 rounded-xl group">
                          <div className="flex-1 text-sm text-zinc-700">{fact}</div>
                          <button 
                            onClick={() => removeGeneralFact(idx)}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={newGeneralFact}
                        onChange={(e) => setNewGeneralFact(e.target.value)}
                        placeholder="Neues Wissen hinzufügen..."
                        className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-zinc-900 outline-none text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && addGeneralFact()}
                      />
                      <button 
                        onClick={addGeneralFact}
                        className="bg-zinc-900 text-white px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </section>

                  <div className="pt-6 border-t border-gray-100">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isSaving ? 'Speichert...' : 'Wissensbasis speichern'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-400">Lade Wissensbasis...</div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
