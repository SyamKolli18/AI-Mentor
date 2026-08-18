import { LearningResource } from '../models/LearningResource';
import { ResourceCategory } from '../models/ResourceCategory';

export const seedDatabase = async () => {
  try {
    const resourceCount = await LearningResource.countDocuments();
    if (resourceCount > 0) {
      console.log('📡 Database already contains resources. Skipping seeder.');
      return;
    }

    console.log('🌱 Seeding learning resources database...');

    // Categories
    const categories = [
      { name: 'HTML & CSS', description: 'Semantic layout, CSS grids, flexbox, and responsive styles.' },
      { name: 'JavaScript', description: 'Core ES6 functions, callbacks, async promises, and DOM.' },
      { name: 'React & Next.js', description: 'Component lifecycles, states, and hooks.' },
      { name: 'Node.js & Express', description: 'HTTP routing, middlewares, and CRUD APIs.' },
      { name: 'Python & Math', description: 'Data operations, linear algebra, and data frameworks.' },
      { name: 'Machine Learning', description: 'Supervised classification models.' },
      { name: 'Cloud & Docker', description: 'Container setups, Linux, and actions.' },
    ];

    await ResourceCategory.insertMany(categories);

    // Resources list
    const resources = [
      // HTML/CSS Beginner
      {
        title: 'MDN Web Docs: HTML & CSS',
        description: 'The definitive guides to semantic layout and styling selectors.',
        difficulty: 'Beginner',
        estimatedTime: 120,
        externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        category: 'HTML & CSS',
        resourceType: 'documentation',
        tags: ['html', 'css', 'layout'],
        careerPaths: ['frontend', 'backend']
      },
      {
        title: 'SuperSimpleDev HTML/CSS Playlist',
        description: 'Complete coding guide to flex columns and grids.',
        difficulty: 'Beginner',
        estimatedTime: 360,
        externalUrl: 'https://youtube.com/playlist?list=PLr6-GrHUlVf8JIgLkir-liK15fdiW1yZa',
        category: 'HTML & CSS',
        resourceType: 'playlist',
        tags: ['html', 'css'],
        careerPaths: ['frontend']
      },
      {
        title: 'CSS Grid Garden',
        description: 'Interactive game to master CSS grid layout placement.',
        difficulty: 'Beginner',
        estimatedTime: 45,
        externalUrl: 'https://cssgridgarden.com/',
        category: 'HTML & CSS',
        resourceType: 'practice',
        tags: ['css', 'grid'],
        careerPaths: ['frontend']
      },

      // JavaScript Beginner
      {
        title: 'MDN JavaScript Reference Guides',
        description: 'Complete guide on event handling, functions, scopes, and promises.',
        difficulty: 'Beginner',
        estimatedTime: 180,
        externalUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        category: 'JavaScript',
        resourceType: 'documentation',
        tags: ['javascript', 'js', 'async'],
        careerPaths: ['frontend', 'backend']
      },
      {
        title: 'JavaScript Info: Modern Tutorial',
        description: 'An excellent intermediate course covering ES6 closures and scopes.',
        difficulty: 'Intermediate',
        estimatedTime: 480,
        externalUrl: 'https://javascript.info/',
        category: 'JavaScript',
        resourceType: 'course',
        tags: ['javascript', 'js', 'es6'],
        careerPaths: ['frontend', 'backend']
      },
      {
        title: 'Eloquent JavaScript Book',
        description: 'Comprehensive guide covering functional programming and DOM.',
        difficulty: 'Advanced',
        estimatedTime: 600,
        externalUrl: 'https://eloquentjavascript.net/',
        category: 'JavaScript',
        resourceType: 'book',
        tags: ['javascript', 'js', 'programming'],
        careerPaths: ['frontend', 'backend']
      },

      // React & Next.js Intermediate
      {
        title: 'Official React Reference Docs',
        description: 'Interactive docs explaining rendering cycles and state hooks.',
        difficulty: 'Intermediate',
        estimatedTime: 240,
        externalUrl: 'https://react.dev/',
        category: 'React & Next.js',
        resourceType: 'documentation',
        tags: ['react', 'next'],
        careerPaths: ['frontend']
      },
      {
        title: 'Next.js Foundations course',
        description: 'Server actions, loaders, and routing in Next.js.',
        difficulty: 'Advanced',
        estimatedTime: 300,
        externalUrl: 'https://nextjs.org/learn',
        category: 'React & Next.js',
        resourceType: 'course',
        tags: ['next', 'nextjs', 'react'],
        careerPaths: ['frontend']
      },
      {
        title: 'Zustand State Cheat Sheet',
        description: 'Quick reference sheet to define global store parameters.',
        difficulty: 'Intermediate',
        estimatedTime: 30,
        externalUrl: 'https://github.com/pmndrs/zustand',
        category: 'React & Next.js',
        resourceType: 'cheat-sheet',
        tags: ['react', 'zustand'],
        careerPaths: ['frontend']
      },

      // Node.js & Databases
      {
        title: 'ExpressJS Routing Guides',
        description: 'How to write Express route parameters and handle request payloads.',
        difficulty: 'Beginner',
        estimatedTime: 90,
        externalUrl: 'https://expressjs.com/',
        category: 'Node.js & Express',
        resourceType: 'documentation',
        tags: ['node', 'express'],
        careerPaths: ['backend']
      },
      {
        title: 'Node.js Crash Course (Net Ninja)',
        description: 'Comprehensive video tutorials on Event loops and writing servers.',
        difficulty: 'Beginner',
        estimatedTime: 180,
        externalUrl: 'https://youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymhLOyfBUw',
        category: 'Node.js & Express',
        resourceType: 'playlist',
        tags: ['node', 'express'],
        careerPaths: ['backend']
      },
      {
        title: 'MongoDB Schema Design Book',
        description: 'Reference book for indexing, subdocuments, and aggregations.',
        difficulty: 'Advanced',
        estimatedTime: 360,
        externalUrl: 'https://www.mongodb.com/docs/manual/',
        category: 'Node.js & Express',
        resourceType: 'book',
        tags: ['mongodb', 'database'],
        careerPaths: ['backend']
      },

      // Python & ML
      {
        title: 'Scikit-Learn Classifier Guides',
        description: 'Official API documentation for Random Forests and precision metrics.',
        difficulty: 'Intermediate',
        estimatedTime: 150,
        externalUrl: 'https://scikit-learn.org/',
        category: 'Machine Learning',
        resourceType: 'documentation',
        tags: ['python', 'ml'],
        careerPaths: ['ai']
      },
      {
        title: 'Kaggle Machine Learning Track',
        description: 'Interactive coding environments to validate regression models.',
        difficulty: 'Intermediate',
        estimatedTime: 240,
        externalUrl: 'https://www.kaggle.com/learn',
        category: 'Machine Learning',
        resourceType: 'practice',
        tags: ['python', 'ml'],
        careerPaths: ['ai']
      },
      {
        title: 'Calculus and Linear Algebra Cheat Sheet',
        description: 'Mathematical references for backpropagation formulas.',
        difficulty: 'Advanced',
        estimatedTime: 60,
        externalUrl: 'https://www.math.uci.edu/~swright/linearalgebra.html',
        category: 'Python & Math',
        resourceType: 'cheat-sheet',
        tags: ['math', 'python'],
        careerPaths: ['ai']
      }
    ];

    // Build resources matching the 10 core tags for fallback schemas in controller logic
    await LearningResource.insertMany(resources);
    console.log('✅ Learning resources successfully seeded!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
};
