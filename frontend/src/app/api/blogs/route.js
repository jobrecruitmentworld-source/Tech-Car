import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Get the path to our persistent mock database
const dbPath = path.join(process.cwd(), 'mock_db.json');

// Initialize the database with default blogs if it doesn't exist
const defaultBlogs = [
  {
    id: 1,
    title: 'Audi Cars in India 2026',
    slug: 'audi-cars-in-india-2026',
    short_description: 'Discover the latest Audi models hitting the Indian market in 2026. From powerful EVs to luxurious sedans, Audi is redefining the driving experience.',
    featured_image: 'https://placehold.co/1200x600/png',
    category_name: 'Automotive',
    status: 'Published',
    views: 1240,
    published_at: '2026-07-01 10:00:00',
    created_at: '2026-07-01 10:00:00',
    seo: { meta_title: 'Audi Cars in India 2026', meta_description: 'Discover the latest Audi models hitting the Indian market in 2026. Explore EVs, sedans, and SUVs.' }
  },
  {
    id: 2,
    title: 'Future of Web Development',
    slug: 'future-of-web-development',
    short_description: 'How AI is shaping the future of web frameworks and developer experiences in the coming years.',
    featured_image: 'https://placehold.co/1200x600/png',
    category_name: 'Technology',
    status: 'Draft',
    views: 0,
    published_at: null,
    created_at: '2026-07-01 12:00:00',
    seo: { meta_title: 'Future of Web Development', meta_description: 'How AI is shaping the future of web frameworks.' }
  }
];

function getBlogsData() {
  if (fs.existsSync(dbPath)) {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && Array.isArray(parsed.blogs)) {
        return parsed.blogs;
      }
      return Array.isArray(parsed) ? parsed : defaultBlogs;
    } catch (err) {
      console.error("Error parsing DB:", err);
      return defaultBlogs;
    }
  }
  return defaultBlogs;
}

function saveBlogsData(blogs) {
  fs.writeFileSync(dbPath, JSON.stringify(blogs, null, 2), 'utf-8');
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const isAdmin = searchParams.get('admin') === 'true';
  const id = searchParams.get('id');
  const slug = searchParams.get('slug');
  const mockBlogs = getBlogsData();

  if (id) {
    const blog = mockBlogs.find(b => b.id === parseInt(id));
    if (blog) return NextResponse.json(blog);
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  if (slug) {
    // Dynamically match any slug to prevent 404s during testing
    let blog = mockBlogs.find(b => b.slug === slug);
    
    // If it's a completely new slug (e.g. from a user test), generate a dummy blog on the fly
    if (!blog) {
      blog = {
        id: 999,
        title: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: slug,
        short_description: 'This is a dynamically generated blog post for testing purposes.',
        featured_image: 'https://placehold.co/1200x600/png',
        category_name: 'General',
        status: 'Published',
        views: 100,
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        seo: { meta_title: slug, meta_description: 'Dynamic post' }
      };
    }

    // Add rich sections and images for detailed view ONLY if they don't already exist on the blog
    return NextResponse.json({
      ...blog,
      sections: blog.sections || [
        {
          id: 1,
          heading: 'Introduction to ' + blog.title,
          content: '<div style="margin-bottom:1rem;font-size:1.1rem;line-height:1.8;">Welcome to this detailed overview. We are thrilled to share the latest updates and comprehensive insights. Whether you are a seasoned expert or just getting started, this information is curated just for you.</div><div style="margin-bottom:1rem;font-size:1.1rem;line-height:1.8;">The landscape is changing rapidly, and staying ahead of the curve is more important than ever.</div>',
          image_url: 'https://placehold.co/800x400/png',
          sort_order: 1
        },
        {
          id: 2,
          heading: 'In-Depth Analysis',
          content: '<div style="margin-bottom:1rem;font-size:1.1rem;line-height:1.8;">Diving deeper into the core mechanics, we can observe significant trends. The integration of cutting-edge technology has streamlined processes incredibly.</div><ul><li>First key observation and metric</li><li>Second fundamental change in the ecosystem</li><li>Third point of interest regarding upcoming updates</li></ul>',
          image_url: 'https://placehold.co/800x400/png',
          sort_order: 2
        }
      ],
      tags: blog.tags || [{ id: 1, tag: 'Testing' }, { id: 2, tag: 'Dynamic' }],
      keywords: blog.keywords || [{ id: 1, keyword: 'test' }]
    });
  }

  const blogs = isAdmin ? mockBlogs : mockBlogs.filter(b => b.status === 'Published');
  return NextResponse.json(blogs);
}

export async function PUT(request) {
  const data = await request.json();
  const { id } = data;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  const mockBlogs = getBlogsData();
  const index = mockBlogs.findIndex(b => b.id === parseInt(id));
  
  if (index === -1) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  mockBlogs[index] = {
    ...mockBlogs[index],
    ...data,
    updated_at: new Date().toISOString()
  };
  
  saveBlogsData(mockBlogs);
  return NextResponse.json({ success: true, blog_id: id });
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  let mockBlogs = getBlogsData();
  const initialLength = mockBlogs.length;
  mockBlogs = mockBlogs.filter(b => b.id !== parseInt(id));
  
  if (mockBlogs.length === initialLength) {
    return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
  }

  saveBlogsData(mockBlogs);
  return NextResponse.json({ success: true, deleted_id: id });
}

export async function POST(request) {
  const data = await request.json();
  const mockBlogs = getBlogsData();
  
  // Support bulk creation if data is an array
  if (Array.isArray(data)) {
    const newBlogs = data.map((blogData, index) => ({
      id: mockBlogs.length + index + 1,
      ...blogData,
      created_at: new Date().toISOString(),
      views: 0
    }));
    
    mockBlogs.push(...newBlogs);
    saveBlogsData(mockBlogs);
    return NextResponse.json({ success: true, count: newBlogs.length }, { status: 201 });
  } else {
    const newBlog = {
      id: mockBlogs.length + 1,
      ...data,
      created_at: new Date().toISOString(),
      views: 0
    };
    
    mockBlogs.push(newBlog);
    saveBlogsData(mockBlogs);
    return NextResponse.json({ success: true, blog_id: newBlog.id }, { status: 201 });
  }
}
