# Client Setup Commands and File Structure

## Terminal Commands

```bash
# Navigate to client directory
cd client

# Install TypeScript and type definitions
npm install -D typescript @types/node

# Install Tailwind CSS and dependencies
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install React Router, Axios, and Zustand
npm install react-router-dom axios zustand

# Install ESLint TypeScript plugins
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh

# Install Prettier with TypeScript support
npm install -D prettier eslint-config-prettier eslint-plugin-prettier

# Initialize TypeScript config (if not exists)
npx tsc --init
```

## File Tree Structure

```
client/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .prettierrc
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── components/
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── index.tsx
│   └── pages/
│       ├── Landing.tsx
│       ├── Catalog.tsx
│       ├── Course.tsx
│       ├── Dashboard.tsx
│       ├── Instructor.tsx
│       └── Admin.tsx
```

## File Contents

### package.json
```json
{
  "name": "planet-path-client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,scss,md}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-prettier": "^5.1.0",
    "eslint-plugin-react": "^7.33.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### .eslintrc.cjs
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'prettier',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
```

### .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### src/main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
}

body {
  margin: 0;
  min-height: 100vh;
}
```

### src/App.tsx
```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Catalog from './pages/Catalog';
import Course from './pages/Course';
import Dashboard from './pages/Dashboard';
import Instructor from './pages/Instructor';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/course/:id" element={<Course />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
```

### src/components/Layout/index.tsx
```typescript
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
```

### src/components/Layout/Header.tsx
```typescript
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-green-600">
            🌍 Planet Path
          </Link>
          <nav className="flex gap-4 items-center">
            <Link
              to="/catalog"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Courses
            </Link>
            <Link
              to="/dashboard"
              className="text-gray-700 hover:text-green-600 transition-colors"
            >
              Dashboard
            </Link>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
```

### src/components/Layout/Footer.tsx
```typescript
function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Planet Path. All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="#" className="hover:text-green-400 transition-colors">
              About
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Contact
            </a>
            <a href="#" className="hover:text-green-400 transition-colors">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
```

### src/pages/Landing.tsx
```typescript
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Learn Climate Action. Create Impact.
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Join verified projects. Earn certificates. Build green skills.
        </p>
        <Link
          to="/catalog"
          className="inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
        >
          Start Learning
        </Link>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="font-bold mb-2">Courses</h3>
          <p className="text-sm text-gray-600">
            Interactive climate education modules
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">🌱</div>
          <h3 className="font-bold mb-2">Impact Projects</h3>
          <p className="text-sm text-gray-600">
            Verified community climate action
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg text-center">
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-bold mb-2">Certificates</h3>
          <p className="text-sm text-gray-600">Earn badges and credentials</p>
        </div>
      </section>
    </div>
  );
}

export default Landing;
```

### src/pages/Catalog.tsx
```typescript
function Catalog() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Catalog</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search courses..."
          className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <div
            key={id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <h3 className="font-bold mb-2">Course Title {id}</h3>
              <p className="text-sm text-gray-600 mb-3">
                Course description placeholder
              </p>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                Beginner
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalog;
```

### src/pages/Course.tsx
```typescript
import { useParams } from 'react-router-dom';

function Course() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course {id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center text-white">
            Video Player
          </div>
          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Complete Lesson
          </button>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold mb-4">Course Outline</h3>
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((lesson) => (
                <li
                  key={lesson}
                  className="p-2 border-l-4 border-gray-300 hover:border-green-600 cursor-pointer"
                >
                  Lesson {lesson}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Course;
```

### src/pages/Dashboard.tsx
```typescript
function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome back, Grace! 👋</h1>

      {/* Progress Bars */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Learning Progress</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Climate Science Basics</span>
              <span>60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: '60%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-2">
          <div className="p-4 border-l-4 border-green-600 bg-green-50">
            Completed: Introduction to Climate Change
          </div>
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Badges</h2>
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
            🏆
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
```

### src/pages/Instructor.tsx
```typescript
function Instructor() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Course Builder</h1>

      <div className="max-w-2xl">
        <div className="mb-6">
          <label className="block font-semibold mb-2">Course Title</label>
          <input
            type="text"
            placeholder="Enter course title..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            placeholder="Describe your course..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Lessons</h2>
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <input
              type="text"
              placeholder="Lesson title..."
              className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
            />
            <button className="px-4 py-2 bg-gray-200 rounded text-sm">
              Upload Video
            </button>
          </div>
          <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded text-gray-600">
            + Add New Lesson
          </button>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold">
            Save Draft
          </button>
          <button className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
            Publish Course
          </button>
        </div>
      </div>
    </div>
  );
}

export default Instructor;
```

### src/pages/Admin.tsx
```typescript
function Admin() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">1,234</div>
          <div className="text-sm text-gray-600">Users</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">45</div>
          <div className="text-sm text-gray-600">Courses</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">KES 89K</div>
          <div className="text-sm text-gray-600">Revenue</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">67</div>
          <div className="text-sm text-gray-600">Projects</div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2">Grace Akhati</td>
                <td className="p-2">grace@example.com</td>
                <td className="p-2">Learner</td>
                <td className="p-2">
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Active
                  </span>
                </td>
                <td className="p-2">
                  <button className="text-sm text-blue-600">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Admin;
```

