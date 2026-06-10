import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  /** Optional status text shown next to the dots (e.g. "Searching ACOB info…") */
  label?: string;
}

/**
 * Typing indicator — Bot avatar + animated dots in a card bubble, matching the
 * ERP ACOBot widget.
 */
export function TypingIndicator({ label }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2"
    >
      <div className="bg-primary text-primary-foreground flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
        <Bot className="h-4 w-4" />
      </div>
      <div className="border-border bg-card flex items-center gap-2 rounded-2xl rounded-bl-sm border px-3 py-2.5 shadow-sm">
        {label && (
          <span className="text-muted-foreground text-xs">{label}</span>
        )}
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="bg-muted-foreground/60 h-1.5 w-1.5 rounded-full"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
