import { motion } from 'framer-motion';
import { suggestedMessages } from '@/lib/data';

interface SuggestedQuestionsProps {
  onSelect: (_message: string) => void;
  isChatting: boolean;
  rateLimitReached: boolean;
}

/**
 * Suggested questions — ERP-style card-chip grid shown just above the input.
 */
export function SuggestedQuestions({
  onSelect,
  isChatting,
  rateLimitReached,
}: SuggestedQuestionsProps) {
  return (
    <div className="border-border bg-background space-y-2 border-t px-3 pt-3">
      <p className="text-muted-foreground px-1 text-xs font-medium">
        Try asking
      </p>
      <div className="grid grid-cols-2 gap-2">
        {suggestedMessages.map((msg, index) => (
          <motion.button
            key={index}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(msg)}
            disabled={isChatting || rateLimitReached}
            className="border-border bg-card hover:border-primary/40 hover:bg-accent text-card-foreground flex items-center rounded-xl border p-2.5 text-left text-xs font-medium leading-tight transition-colors disabled:opacity-50"
          >
            {msg}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
