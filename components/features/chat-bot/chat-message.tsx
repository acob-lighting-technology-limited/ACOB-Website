import type { Message } from 'ai';
import { ExternalLink, Bot, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { formatMessage, getPageName } from './chat-utils';

interface ChatMessageProps {
  message: Message;
  navigationRoute?: string;
  onNavigate?: (_route: string) => void;
}

/**
 * Individual chat message bubble — avatar + clean card style, matching the ERP
 * ACOBot widget. Assistant messages render markdown (via formatMessage) and can
 * surface a navigation button.
 */
export function ChatMessage({
  message,
  navigationRoute,
  onNavigate,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex w-full items-end gap-2 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {!isUser && (
          <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm">
            <Bot className="h-4 w-4" />
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'border-border bg-card text-foreground rounded-bl-sm border'
          }`}
        >
          <div
            className="leading-relaxed [overflow-wrap:anywhere]"
            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
          />
        </div>

        {isUser && (
          <div className="bg-muted text-muted-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
            <User className="h-4 w-4" />
          </div>
        )}
      </motion.div>

      {/* Navigation Button */}
      {navigationRoute && !isUser && onNavigate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 ml-9 mt-1 flex justify-start"
        >
          <Button
            onClick={() => onNavigate(navigationRoute)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 rounded-full px-4 py-2 text-xs shadow-sm"
          >
            <ExternalLink className="h-3 w-3" />
            Navigate to {getPageName(navigationRoute)}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
