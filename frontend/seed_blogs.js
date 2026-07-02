const path = require('path');

const API_URL = 'http://localhost:3000/api/blogs';

// Helper to generate a slug from a title
function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

// Topic-specific image dictionaries
const categoryImages = {
  'Cars': [
    'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80', // Fixed 404
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80',
    'https://images.unsplash.com/photo-1493238792000-8113da705763?w=1200&q=80',
    'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=1200&q=80',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&q=80'
  ],
  'AI': [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1200&q=80',
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=1200&q=80',
    'https://images.unsplash.com/photo-1589254065878-42c9da997008?w=1200&q=80'
  ],
  'Web Development': [
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=1200&q=80',
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'
  ],
  'Technologies': [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80'
  ],
  'Business and Startups': [
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1200&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
    'https://images.unsplash.com/photo-1554200876-56c2f25224fa?w=1200&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80'
  ]
};

function getUniqueImage(categoryName, index) {
  const images = categoryImages[categoryName] || categoryImages['Technologies'];
  return images[index % images.length];
}

const categoriesData = [
  {
    name: 'Cars',
    keywords: 'car,auto',
    blogs: [
      { title: 'The Ultimate Guide to Luxury Sedans in 2026', short_desc: 'Discover what makes modern luxury sedans the pinnacle of comfort and engineering.', topic: 'luxury car' },
      { title: 'Electric Vehicles vs Petrol Cars: The Final Verdict', short_desc: 'A comprehensive comparison between EV and traditional internal combustion engine vehicles.', topic: 'electric car' },
      { title: 'Top 5 Fastest Sports Cars in the World Right Now', short_desc: 'Speed, aerodynamics, and pure power. We rank the fastest street-legal sports cars.', topic: 'sports car' },
      { title: 'Choosing the Perfect Family SUV', short_desc: 'Safety, space, and comfort. How to pick the best SUV for your growing family.', topic: 'suv car' },
      { title: 'The Rise of Autonomous Driving Technology', short_desc: 'How close are we to fully self-driving cars? We explore the latest breakthroughs.', topic: 'autonomous car' }
    ]
  },
  {
    name: 'AI',
    keywords: 'artificial,intelligence',
    blogs: [
      { title: 'How Generative AI is Changing the Creative Industry', short_desc: 'From art to copywriting, generative AI tools are reshaping how we create.', topic: 'generative AI' },
      { title: 'The Ethics of Artificial Intelligence in 2026', short_desc: 'As AI becomes more advanced, the ethical considerations become more complex.', topic: 'AI ethics' },
      { title: 'Machine Learning Basics for Beginners', short_desc: 'A simple, easy-to-understand guide to the core concepts of machine learning.', topic: 'machine learning' },
      { title: 'AI in Healthcare: Saving Lives with Data', short_desc: 'How artificial intelligence is being used to diagnose diseases and develop new drugs.', topic: 'medical AI' },
      { title: 'The Future of AI Assistants', short_desc: 'Moving beyond simple voice commands to proactive, intelligent personal agents.', topic: 'AI robot' }
    ]
  },
  {
    name: 'Web Development',
    keywords: 'programming,code',
    blogs: [
      { title: 'Mastering React Server Components', short_desc: 'A deep dive into how server components work and why they are the future of React.', topic: 'react code' },
      { title: 'Tailwind CSS vs Traditional CSS: Which is Better?', short_desc: 'An objective look at the pros and cons of utility-first CSS frameworks.', topic: 'css code' },
      { title: 'The State of Web Performance in 2026', short_desc: 'Core Web Vitals, edge caching, and the latest techniques for lightning-fast sites.', topic: 'website performance' },
      { title: 'Building Accessible Web Applications', short_desc: 'Why a11y matters and practical steps to ensure everyone can use your website.', topic: 'web accessibility' },
      { title: 'Full-Stack Development with Next.js', short_desc: 'How Next.js blurs the line between frontend and backend development.', topic: 'nextjs programming' }
    ]
  },
  {
    name: 'Technologies',
    keywords: 'technology,tech',
    blogs: [
      { title: 'Quantum Computing Explained Simply', short_desc: 'Demystifying qubits, superposition, and what quantum computers can actually do.', topic: 'quantum computer' },
      { title: 'The Evolution of 6G Networks', short_desc: 'We barely got used to 5G, but 6G is already on the horizon. What will it bring?', topic: 'cellular network' },
      { title: 'Cybersecurity Threats You Need to Know', short_desc: 'From ransomware to phishing, learn how to protect yourself online.', topic: 'cybersecurity' },
      { title: 'Augmented Reality in Everyday Life', short_desc: 'How AR is moving from gaming into retail, education, and navigation.', topic: 'augmented reality' },
      { title: 'The Rise of Edge Computing', short_desc: 'Why processing data closer to the source is becoming critical for IoT devices.', topic: 'edge computing' }
    ]
  },
  {
    name: 'Business and Startups',
    keywords: 'business,startup',
    blogs: [
      { title: 'How to Secure Seed Funding in 2026', short_desc: 'Expert advice on pitching to investors and building a compelling deck.', topic: 'startup funding' },
      { title: 'The Importance of Company Culture', short_desc: 'Why a strong, positive culture is your best tool for employee retention.', topic: 'office culture' },
      { title: 'Bootstrapping vs Venture Capital', short_desc: 'Weighing the pros and cons of self-funding your startup versus taking investor money.', topic: 'business growth' },
      { title: 'Effective Remote Team Management', short_desc: 'Strategies and tools for keeping a distributed team aligned and productive.', topic: 'remote team' },
      { title: 'Growth Hacking Strategies That Actually Work', short_desc: 'Low-cost, high-impact marketing tactics for early-stage startups.', topic: 'marketing growth' }
    ]
  }
];

function generateContent(title, topic) {
  return `
    <h2>Introduction to ${title}</h2>
    <p>Welcome to our comprehensive guide on <strong>${title}</strong>. The landscape of ${topic} has experienced a monumental shift in recent years, drastically altering how professionals and enthusiasts alike approach the domain.</p>
    <p>In this article, we will delve deep into the core mechanics, explore future possibilities, and understand the critical nuances of ${topic}. Whether you are a beginner or a seasoned expert, the rapid pace of change means there is always something new to learn.</p>
    
    <h2>The Current State of ${topic}</h2>
    <p>The current environment surrounding ${topic} is vibrant and dynamic. Organizations around the globe are pouring massive investments into research and development. We are seeing an unprecedented level of innovation that is reshaping the boundaries of what is possible.</p>
    <ul>
      <li><strong>Rapid Innovation:</strong> New tools, frameworks, and methodologies are being introduced daily.</li>
      <li><strong>Global Adoption:</strong> The barrier to entry has significantly lowered, allowing global participation.</li>
      <li><strong>Sustainability and Ethics:</strong> As adoption scales, ethical considerations and sustainability have moved to the forefront of the conversation.</li>
      <li><strong>Efficiency and Optimization:</strong> Doing more with less is the new standard across the industry.</li>
    </ul>

    <h2>Detailed Analysis and Future Trajectory</h2>
    <p>When analyzing the trajectory of ${topic}, statistics paint a very clear picture. Early adopters have consistently outperformed their peers by a significant margin. Implementing modern solutions associated with ${topic} has led to a reported 40% increase in baseline productivity for many organizations.</p>
    <blockquote>"The future belongs to those who prepare for it today. The advancements in ${topic} are no longer optional, they are a fundamental requirement for success." - Industry Expert</blockquote>
    
    <p>However, it is not without challenges. Integration complexities, learning curves, and initial overhead costs remain prominent hurdles. Yet, the long-term ROI makes it an indispensable asset. As we monitor these developments, staying informed and agile is crucial.</p>
    
    <h2>Conclusion</h2>
    <p>In summary, the advancements in ${topic} present both exciting opportunities and unique challenges. By staying ahead of the curve, embracing innovation, and preparing for the inevitable shifts, individuals and organizations can position themselves for incredible success in the coming years. The journey of mastering ${topic} is ongoing, and the future is remarkably bright.</p>
  `;
}

function generateSection(topic, categoryName, blogIndex) {
  return [
    {
      id: Date.now() + Math.random(),
      heading: `The Deep Impact of ${topic}`,
      content: `<p>Understanding the broader impact of ${topic} is absolutely essential. As adoption continues to grow at an exponential rate, the ripple effects are felt across the entire ecosystem. We are not just witnessing a minor update; we are witnessing a complete paradigm shift in how we interact with technology, business, and society at large.</p>
      <p>Key stakeholders must align their strategies with these inevitable changes to avoid obsolescence and drive sustainable growth.</p>`,
      image_url: getUniqueImage(categoryName, blogIndex + 1), // offset by 1
      sort_order: 1
    }
  ];
}

function generateGallery(topic, categoryName, blogIndex) {
  return [
    {
      image_url: getUniqueImage(categoryName, blogIndex + 2),
      alt_text: `${topic} visualization 1`,
      caption: `A beautiful perspective on the intricacies of ${topic}`,
      sort_order: 1
    },
    {
      image_url: getUniqueImage(categoryName, blogIndex + 3),
      alt_text: `${topic} visualization 2`,
      caption: `Detailed look at the application of ${topic} in real-world scenarios`,
      sort_order: 2
    },
    {
      image_url: getUniqueImage(categoryName, blogIndex + 4),
      alt_text: `${topic} visualization 3`,
      caption: `Glimpse into the future potential of ${topic}`,
      sort_order: 3
    }
  ];
}

function generateKeywords(topic, categoryName) {
  const words = topic.split(' ').map(w => w.toLowerCase());
  const categoryWords = categoryName.split(' ').map(w => w.toLowerCase());
  
  const baseList = [
    ...words,
    ...categoryWords,
    '2026', 'trends', 'guide', 'tutorial', 'news',
    'future', 'technology', 'innovation', 'business',
    'analysis', 'review', 'insights', 'tips', 'development',
    'growth', 'strategy', 'success'
  ];
  
  // ensure unique keywords
  const uniqueBase = [...new Set(baseList)];
  
  // return top 15 keywords
  return uniqueBase.slice(0, 15).map((kw, i) => ({ id: i + 1, keyword: kw }));
}

async function seed() {
  console.log("Starting to seed database via API...");
  for (const cat of categoriesData) {
    let blogIndex = 0;
    for (const b of cat.blogs) {
      const payload = {
        title: b.title,
        slug: slugify(b.title),
        short_description: b.short_desc,
        long_description: generateContent(b.title, b.topic),
        featured_image: getUniqueImage(cat.name, blogIndex),
        category_name: cat.name,
        status: 'Published',
        tags: [{ id: 1, tag: cat.name.toLowerCase() }, { id: 2, tag: b.topic.split(' ')[0] }],
        keywords: generateKeywords(b.topic, cat.name),
        seo: { meta_title: b.title, meta_description: b.short_desc },
        sections: generateSection(b.topic, cat.name, blogIndex),
        gallery: generateGallery(b.topic, cat.name, blogIndex)
      };

      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          console.log(`Created: ${b.title}`);
        } else {
          console.error(`Failed to create: ${b.title}`);
        }
      } catch (err) {
        console.error("API error:", err.message);
      }
      blogIndex++;
    }
  }
  console.log("Done seeding!");
}

seed();

