import { type NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { rateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  const isRateLimited = rateLimit(request, {
    interval: 60 * 1000, // 1 minute window
    uniqueTokenPerInterval: 3, // max 3 comments per minute per IP
  });

  if (isRateLimited) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  try {
    const body = await request.json();
    const { name, email, comment, postId } = body;

    if (!name || !email || !comment || !postId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Basic type and length checks to prevent abuse
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof comment !== 'string' ||
      typeof postId !== 'string' ||
      name.length > 100 ||
      email.length > 200 ||
      comment.length > 5000 ||
      postId.length > 100
    ) {
      return NextResponse.json(
        { error: 'Invalid field values' },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    const doc = {
      _type: 'comment',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      comment: comment.trim(),
      updatePost: {
        _type: 'reference',
        _ref: postId,
      },
      approved: false, // All new comments require moderation
      createdAt: new Date().toISOString(),
    };

    const result = await client.create(doc);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating comment:', error);
    }
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 },
    );
  }
}
