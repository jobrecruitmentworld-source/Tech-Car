const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'mock_db.json');

// Helper to generate a slug from a title
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Helper to generate unique images
let imageCounter = 1;
function getImageUrl(keywords, width = 1200, height = 800) {
  const url = `https://loremflickr.com/${width}/${height}/${keywords}?lock=${imageCounter}`;
  imageCounter++;
  return url;
}

// Categories and their respective blog topics
const categoriesData = [
  {
    name: 'Cars',
    keywords: 'car,auto',
    blogs: [
      {
        title: 'The Ultimate Guide to Luxury Sedans in 2026',
        short_desc: 'Discover what makes modern luxury sedans the pinnacle of comfort and engineering.',
        topic: 'luxury car'
      },
      {
        title: 'Electric Vehicles vs Petrol Cars: The Final Verdict',
        short_desc: 'A comprehensive comparison between EV and traditional internal combustion engine vehicles.',
        topic: 'electric car'
      },
      {
        title: 'Top 5 Fastest Sports Cars in the World Right Now',
        short_desc: 'Speed, aerodynamics, and pure power. We rank the fastest street-legal sports cars.',
        topic: 'sports car'
      },
      {
        title: 'Choosing the Perfect Family SUV',
        short_desc: 'Safety, space, and comfort. How to pick the best SUV for your growing family.',
        topic: 'suv car'
      },
      {
        title: 'The Rise of Autonomous Driving Technology',
        short_desc: 'How close are we to fully self-driving cars? We explore the latest breakthroughs.',
        topic: 'autonomous car'
      }
    ]
  },
  {
    name: 'AI',
    keywords: 'artificial,intelligence',
    blogs: [
      {
        title: 'How Generative AI is Changing the Creative Industry',
        short_desc: 'From art to copywriting, generative AI tools are reshaping how we create.',
        topic: 'generative AI'
      },
      {
        title: 'The Ethics of Artificial Intelligence in 2026',
        short_desc: 'As AI becomes more advanced, the ethical considerations become more complex.',
        topic: 'AI ethics'
      },
      {
        title: 'Machine Learning Basics for Beginners',
        short_desc: 'A simple, easy-to-understand guide to the core concepts of machine learning.',
        topic: 'machine learning'
      },
      {
        title: 'AI in Healthcare: Saving Lives with Data',
        short_desc: 'How artificial intelligence is being used to diagnose diseases and develop new drugs.',
        topic: 'medical AI'
      },
      {
        title: 'The Future of AI Assistants',
        short_desc: 'Moving beyond simple voice commands to proactive, intelligent personal agents.',
        topic: 'AI robot'
      }
    ]
  },
  {
    name: 'Web Development',
    keywords: 'programming,code',
    blogs: [
      {
        title: 'Mastering React Server Components',
        short_desc: 'A deep dive into how server components work and why they are the future of React.',
        topic: 'react code'
      },
      {
        title: 'Tailwind CSS vs Traditional CSS: Which is Better?',
        short_desc: 'An objective look at the pros and cons of utility-first CSS frameworks.',
        topic: 'css code'
      },
      {
        title: 'The State of Web Performance in 2026',
        short_desc: 'Core Web Vitals, edge caching, and the latest techniques for lightning-fast sites.',
        topic: 'website performance'
      },
      {
        title: 'Building Accessible Web Applications',
        short_desc: 'Why a11y matters and practical steps to ensure everyone can use your website.',
        topic: 'web accessibility'
      },
      {
        title: 'Full-Stack Development with Next.js',
        short_desc: 'How Next.js blurs the line between frontend and backend development.',
        topic: 'nextjs programming'
      }
    ]
  },
  {
    name: 'Technologies',
    keywords: 'technology,tech',
    blogs: [
      {
        title: 'Quantum Computing Explained Simply',
        short_desc: 'Demystifying qubits, superposition, and what quantum computers can actually do.',
        topic: 'quantum computer'
      },
      {
        title: 'The Evolution of 6G Networks',
        short_desc: 'We barely got used to 5G, but 6G is already on the horizon. What will it bring?',
        topic: 'cellular network'
      },
      {
        title: 'Cybersecurity Threats You Need to Know',
        short_desc: 'From ransomware to phishing, learn how to protect yourself online.',
        topic: 'cybersecurity'
      },
      {
        title: 'Augmented Reality in Everyday Life',
        short_desc: 'How AR is moving from gaming into retail, education, and navigation.',
        topic: 'augmented reality'
      },
      {
        title: 'The Rise of Edge Computing',
        short_desc: 'Why processing data closer to the source is becoming critical for IoT devices.',
        topic: 'edge computing server'
      }
    ]
  },
  {
    name: 'Business and Startups',
    keywords: 'business,startup',
    blogs: [
      {
        title: 'How to Secure Seed Funding in 2026',
        short_desc: 'Expert advice on pitching to investors and building a compelling deck.',
        topic: 'startup funding'
      },
      {
        title: 'The Importance of Company Culture',
        short_desc: 'Why a strong, positive culture is your best tool for employee retention.',
        topic: 'office culture'
      },
      {
        title: 'Bootstrapping vs Venture Capital',
        short_desc: 'Weighing the pros and cons of self-funding your startup versus taking investor money.',
        topic: 'business growth'
      },
      {
        title: 'Effective Remote Team Management',
        short_desc: 'Strategies and tools for keeping a distributed team aligned and productive.',
        topic: 'remote team'
      },
      {
        title: 'Growth Hacking Strategies That Actually Work',
        short_desc: 'Low-cost, high-impact marketing tactics for early-stage startups.',
        topic: 'marketing growth'
      }
    ]
  }
];

function generateContent(title, topic) {
  return `
    <h2>Introduction</h2>
    <p>Welcome to our deep dive into <strong>${title}</strong>. In this article, we will explore the fascinating world of ${topic} and uncover insights that will shape the future.</p>
    
    <h2>Key Trends in ${topic}</h2>
    <p>The landscape of ${topic} is evolving rapidly. Industry leaders are investing heavily in new methodologies and research.</p>
    <ul>
      <li><strong>Innovation:</strong> Pushing the boundaries of what is possible.</li>
      <li><strong>Sustainability:</strong> Ensuring long-term viability and eco-friendly approaches.</li>
      <li><strong>Efficiency:</strong> Doing more with less through optimization.</li>
    </ul>

    <h2>Detailed Analysis</h2>
    <p>When analyzing the trajectory of ${topic}, it becomes clear that early adopters gain a massive advantage. We have seen a 40% increase in productivity across sectors that implement these modern solutions.</p>
    <blockquote>"The future belongs to those who prepare for it today." - Industry Expert</blockquote>
    
    <p>As we continue to monitor these developments, staying informed is crucial. We expect to see major breakthroughs in the coming months that will redefine the standards for ${topic}.</p>
    
    <h2>Conclusion</h2>
    <p>In summary, the advancements in ${topic} present both exciting opportunities and unique challenges. By staying ahead of the curve, businesses and individuals can leverage these trends for incredible success.</p>
  `;
}

function generateSection(topic) {
  return [
    {
      id: Date.now() + Math.random(),
      heading: `The Impact of ${topic}`,
      content: `<p>Understanding the broader impact is essential. As adoption grows, the ripple effects are felt across the entire ecosystem. We are witnessing a paradigm shift in how we interact with technology and business.</p>`,
      image_url: getImageUrl(topic.replace(' ', ','), 800, 400),
      sort_order: 1
    }
  ];
}

function generateGallery(topic) {
  return [
    {
      image_url: getImageUrl(topic.replace(' ', ','), 800, 600),
      alt_text: `${topic} view 1`,
      caption: `A beautiful perspective on ${topic}`,
      sort_order: 1
    },
    {
      image_url: getImageUrl(topic.replace(' ', ','), 800, 600),
      alt_text: `${topic} view 2`,
      caption: `Detailed look at ${topic}`,
      sort_order: 2
    },
    {
      image_url: getImageUrl(topic.replace(' ', ','), 800, 600),
      alt_text: `${topic} view 3`,
      caption: `The future of ${topic}`,
      sort_order: 3
    }
  ];
}

const blogs = [];
let idCounter = 100;

categoriesData.forEach(cat => {
  cat.blogs.forEach(b => {
    blogs.push({
      id: idCounter++,
      title: b.title,
      slug: slugify(b.title),
      short_description: b.short_desc,
      long_description: generateContent(b.title, b.topic),
      featured_image: getImageUrl(cat.keywords),
      category_name: cat.name,
      status: 'Published',
      views: Math.floor(Math.random() * 5000),
      published_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      created_at: new Date().toISOString(),
      tags: [
        { id: 1, tag: cat.name.toLowerCase() },
        { id: 2, tag: b.topic.split(' ')[0] },
        { id: 3, tag: '2026' }
      ],
      keywords: [
        { id: 1, keyword: b.topic },
        { id: 2, keyword: cat.name },
        { id: 3, keyword: 'trends' }
      ],
      seo: {
        meta_title: `${b.title} | Premium Insights`,
        meta_description: b.short_desc,
        focus_keyword: b.topic,
        canonical_url: `https://example.com/blog/${slugify(b.title)}`,
        og_title: b.title,
        og_description: b.short_desc,
        og_image: getImageUrl(cat.keywords),
        twitter_card: 'summary_large_image',
        schema_jsonld: `{"@context": "https://schema.org", "@type": "BlogPosting", "headline": "${b.title}"}`
      },
      sections: generateSection(b.topic),
      gallery: generateGallery(b.topic)
    });
  });
});

fs.writeFileSync(dbPath, JSON.stringify({ blogs }, null, 2));
console.log(`Successfully generated 25 premium blogs with unique images and SEO in ${dbPath}`);
