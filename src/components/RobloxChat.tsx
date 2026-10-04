import React, { useState } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react';

interface RobloxChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
}

export const RobloxChat: React.FC<RobloxChatProps> = ({
  messages,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 768 : false));

  const quickChats = [
    'Skol!',
    'To Valhalla!',
    'Board the Longship!',
    'For Katfjord!',
  ];

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className={`absolute top-12 sm:top-14 right-3 md:right-auto md:left-3 z-30 transition-all select-none font-sans ${isCollapsed ? 'w-auto' : 'w-64 sm:w-80'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-2.5 py-1 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-neutral-300 text-xs font-bold shadow-md cursor-pointer ${isCollapsed ? 'rounded-lg' : 'rounded-t-lg'}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Realm Chat</span>
          <span className="sm:hidden text-[11px]">Chat</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="text-neutral-400 hover:text-white p-0.5 ml-1.5"
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 rounded-b-lg shadow-xl overflow-hidden">
          {/* Messages list */}
          <div className="p-2 max-h-36 overflow-y-auto space-y-1.5 text-xs">
            {messages.map((m) => (
              <div key={m.id} className="leading-snug">
                {m.isSystem ? (
                  <span className="text-amber-400 font-semibold">
                    [SYSTEM] {m.text}
                  </span>
                ) : (
                  <>
                    <span className="text-cyan-400 font-bold">[{m.clan || 'Viking'}] </span>
                    <span className="text-neutral-300 font-semibold">{m.sender}: </span>
                    <span className="text-white">{m.text}</span>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Quick Chat Buttons */}
          <div className="flex items-center gap-1 px-2 py-1 bg-neutral-900/60 border-t border-neutral-800 overflow-x-auto no-scrollbar">
            {quickChats.map((phrase) => (
              <button
                key={phrase}
                onClick={() => onSendMessage(phrase)}
                className="px-2 py-0.5 text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded whitespace-nowrap border border-neutral-700 transition"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex items-center gap-1 p-1.5 border-t border-neutral-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Chat to clan (Enter to send)..."
              maxLength={80}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-1 bg-amber-600 hover:bg-amber-500 text-white rounded transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
