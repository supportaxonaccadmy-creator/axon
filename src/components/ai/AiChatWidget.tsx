import { memo, useState, useCallback, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';

interface AiChatWidgetProps {
  className?: string | undefined;
  suggestions?: string[] | undefined;
  onSend?: (message: string) => Promise<string | null | undefined> | undefined;
}

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

function AiChatWidgetComponent({ className, suggestions = [], onSend }: AiChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    let response: string | null = null;
    if (onSend) response = (await onSend(userMsg)) ?? null;
    if (!response) {
      const lower = userMsg.toLowerCase();
      if (lower.includes('weak') || lower.includes('struggle')) response = 'Based on your recent activity, I recommend focusing on your weakest topics first. Check the Weak Topics section for personalized study suggestions.';
      else if (lower.includes('plan') || lower.includes('schedule')) response = 'I can help you create a study plan! Visit the Study Planner page to set your daily and weekly goals.';
      else if (lower.includes('recommend') || lower.includes('suggest')) response = 'Check the Recommendations page for AI-curated content suggestions tailored to your learning progress.';
      else if (lower.includes('revision') || lower.includes('review')) response = 'Your revision queue has topics due for review. Visit the Revision Planner to stay on top of spaced repetition.';
      else response = 'I am your AI Learning Assistant. I can help with study planning, weak topic identification, recommendations, and performance predictions. Ask me about your learning progress!';
    }
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  }, [input, loading, onSend]);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}
      {isOpen && (
        <div className={cn('fixed bottom-4 right-4 z-40 flex h-[500px] w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-xl border border-neutral-200 bg-white shadow-xl', className)}>
          <div className="flex items-center justify-between border-b border-neutral-100 p-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50">
                <Sparkles className="h-4 w-4 text-primary-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">AI Assistant</p>
                <p className="text-[10px] text-green-500">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Close"><X className="h-4 w-4" /></button>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.length === 0 && (
              <div className="py-8 text-center">
                <Bot className="mx-auto h-10 w-10 text-primary-300" />
                <p className="mt-2 text-sm text-neutral-500">Hi! I am your AI Learning Assistant. How can I help you today?</p>
                {suggestions.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {suggestions.map((s) => (
                      <button key={s} onClick={() => setInput(s)} className="block w-full rounded-md border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 hover:bg-neutral-50">{s}</button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[80%] rounded-lg px-3 py-2 text-sm', msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700')}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-400">Typing...</div></div>}
          </div>
          <div className="border-t border-neutral-100 p-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleSend(); }}
                placeholder="Ask me anything..."
                className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              />
              <Button size="sm" onClick={handleSend} disabled={!input.trim() || loading}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export const AiChatWidget = memo(AiChatWidgetComponent);
