'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/lib/query-keys';

interface CommentFormProps {
  postId: string;
}

interface CommentPayload {
  name: string;
  email: string;
  comment: string;
  postId: string;
}

async function submitComment(payload: CommentPayload) {
  const response = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit comment');
  }

  return response.json();
}

export function CommentForm({ postId }: CommentFormProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');

  const { mutate, isPending, isSuccess } = useMutation({
    mutationFn: submitComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.comments(postId) });
      toast.success('Comment submitted! It will appear after moderation.');
      setName('');
      setEmail('');
      setComment('');
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Something went wrong');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, email, comment, postId });
  };

  return (
    <Card className="mt-8 sm:mt-12">
      <CardContent className="p-4 sm:p-6 xl:p-8">
        <h3 className="text-xl xl:text-2xl font-bold mb-4 sm:mb-6">
          Leave A Reply
        </h3>
        {isSuccess ? (
          <p className="text-green-600 dark:text-green-400 text-sm py-4">
            Comment submitted successfully! It will appear after moderation.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="update-comment-name">Name</Label>
                <Input
                  id="update-comment-name"
                  name="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-transparent border border-zinc-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 focus-visible:outline-none rounded-lg placeholder:text-zinc-400 transition-colors"
                  required
                />
              </div>
              <div>
                <Label htmlFor="update-comment-email">Email</Label>
                <Input
                  id="update-comment-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-transparent border border-zinc-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 focus-visible:outline-none rounded-lg placeholder:text-zinc-400 transition-colors"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="update-comment-text">Comment</Label>
              <Textarea
                id="update-comment-text"
                name="comment"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={6}
                placeholder="Write your comment..."
                className="bg-transparent border border-zinc-300 dark:border-white/10 focus-visible:ring-1 focus-visible:ring-primary/50 focus:border-primary/50 focus-visible:outline-none rounded-lg placeholder:text-zinc-400 transition-colors"
                required
              />
            </div>

            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : 'Post Comment'}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
