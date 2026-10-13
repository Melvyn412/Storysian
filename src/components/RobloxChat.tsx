import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageSquare, Send, ChevronDown, ChevronUp, Terminal, Sparkles } from 'lucide-react';

interface RobloxChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSlashCommand?: (cmd: string, raw: string) => void;
}

interface CommandSuggestion {
  command: string;
  desc: string;
  icon?: string;
}

const COMMAND_SUGGESTIONS: CommandSuggestion[] = [
  { command: '/e dance', desc: 'Perform festive Viking dance', icon: '💃' },
  { command: '/e wave', desc: 'Wave hello to clan members', icon: '👋' },
  { command: '/e cheer', desc: 'Raise horn and cheer Skol!', icon: '🍻' },
  { command: '/e roar', desc: 'Berserker battle roar with fire', icon: '🔥' },
  { command: '/e point', desc: 'Point weapon forward', icon: '👉' },
  { command: '/re', desc: 'Reset Character (Oof & respawn)', icon: '💀' },
  { command: '/reset', desc: 'Reset Character (Oof & respawn)', icon: '💀' },
  { command: '/clear', desc: 'Clear chat message history', icon: '🧹' },
  { command: '/help', desc: 'List all commands and controls', icon: '❓' },
];

export const RobloxChat: React.FC<RobloxChatProps> = ({
  messages,
  onSendMessage,
  onSlashCommand,
}) => {
  const [inputText, setInputText] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickChats = [
    'Skol!',
    'To Valhalla!',
    'Board the Longship!',
    'For Katfjord!',
  ];

  // Filter command suggestions based on current input
  const filteredSuggestions = inputText.startsWith('/')
    ? COMMAND_SUGGESTIONS.filter((s) =>
        s.command.toLowerCase().startsWith(inputText.toLowerCase())
      )
    : [];

  useEffect(() => {
    setShowSuggestions(inputText.startsWith('/') && filteredSuggestions.length > 0);
  }, [inputText, filteredSuggestions.length]);

  const handleSelectSuggestion = (cmd: string) => {
    setInputText(cmd);
    setShowSuggestions(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('/')) {
      const lower = trimmed.toLowerCase();
      if (onSlashCommand) {
        onSlashCommand(lower, trimmed);
      }
    } else {
      onSendMessage(trimmed);
    }

    setInputText('');
    setShowSuggestions(false);
  };

  return (
    <div
      className={`absolute top-12 sm:top-14 right-3 md:right-auto md:left-3 z-30 transition-all select-none font-sans ${
        isCollapsed ? 'w-auto' : 'w-64 sm:w-80'
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-2.5 py-1 bg-neutral-900/90 backdrop-blur-md border border-neutral-700/80 text-neutral-300 text-xs font-bold shadow-md cursor-pointer ${
          isCollapsed ? 'rounded-lg' : 'rounded-t-lg'
        }`}
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
        <div className="relative bg-neutral-950/85 backdrop-blur-md border border-neutral-700/80 rounded-b-lg shadow-xl overflow-visible">
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
                className="px-2 py-0.5 text-[10px] font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 rounded whitespace-nowrap border border-neutral-700 transition cursor-pointer"
              >
                {phrase}
              </button>
            ))}
          </div>

          {/* Slash Command Autocomplete Popover */}
          {showSuggestions && (
            <div className="absolute left-0 bottom-full mb-1 w-full bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl p-1 z-40 space-y-0.5 max-h-48 overflow-y-auto">
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>Commands</span>
              </div>
              {filteredSuggestions.map((s) => (
                <button
                  key={s.command}
                  type="button"
                  onClick={() => handleSelectSuggestion(s.command)}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-neutral-800 flex items-center justify-between text-xs transition cursor-pointer"
                >
                  <span className="font-mono font-bold text-amber-300 flex items-center gap-1.5">
                    <span>{s.icon}</span>
                    <span>{s.command}</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {s.desc}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSend} className="flex items-center gap-1 p-1.5 border-t border-neutral-800">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Chat or type / for commands..."
              maxLength={80}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              className="p-1 bg-amber-600 hover:bg-amber-500 text-white rounded transition cursor-pointer"
              title="Send (Enter)"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
