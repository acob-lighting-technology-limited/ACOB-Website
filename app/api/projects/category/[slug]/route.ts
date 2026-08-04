import { NextRequest, NextResponse } from 'next/server';
import { getProjectsByCategoryPaginated } from '@/sanity/lib/queries';
import { CATEGORY_INFO } from '@/lib/constants/project-categories';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    if (!CATEGORY_INFO[slug]) {
      return NextResponse.json({ error: 'Unknown category' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '9', 10);
    const search = searchParams.get('search') || '';

    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 },
      );
    }

    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 },
      );
    }

    const result = await getProjectsByCategoryPaginated({
      category: slug,
      page,
      limit,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching projects by category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 },
    );
  }
}
