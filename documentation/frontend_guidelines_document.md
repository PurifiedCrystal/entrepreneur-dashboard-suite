# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the Entrepreneur Dashboard Suite. It’s written in everyday language so anyone—technical or not—can understand how the frontend is set up and why.

## 1. Frontend Architecture

### Frameworks and Libraries
- **Next.js (App Router)**: Our main framework. It handles server-side rendering, static site generation, and client-side navigation in one package.
- **React & TypeScript**: We build UI components with React and write them in TypeScript for extra safety and clarity. Types help catch errors early and make the code easier to maintain.
- **Tailwind CSS v4**: A utility-first CSS framework that lets us style components quickly and consistently without writing long custom CSS files.
- **shadcn/ui**: A set of ready-made, accessible UI components (Tables, Cards, Forms, Dialogs) styled with Tailwind.
- **Better Auth**: Manages sign-up, sign-in, and secure session handling via Next.js API routes.

### How It Supports Our Goals
- **Scalability**: Next.js’ file-based routing and API routes let us add new pages and endpoints simply by creating files. TypeScript + Drizzle ORM ensure data models stay in sync. 
- **Maintainability**: Component-based structure (see Section 4) means each UI piece lives in its own folder. Types and interfaces guide developers when changing or extending functionality.
- **Performance**: Next.js optimizes rendering (SSR, SSG, ISR) and bundles only the code your pages use. Tailwind’s JIT mode removes unused CSS, keeping file sizes small.

## 2. Design Principles

### Key Principles
- **Usability**: Interfaces are intuitive—buttons, forms, and dialogs behave as you’d expect. We stick to familiar patterns (modals for forms, tables for lists).
- **Accessibility**: All interactive elements include proper ARIA attributes, focus states, and keyboard navigation. We use shadcn/ui, which is built with accessibility in mind.
- **Responsiveness**: Layouts adapt to mobile, tablet, and desktop. Tailwind’s responsive utilities make it easy to adjust spacing, typography, and grid layouts at different breakpoints.
- **Consistency**: A theme system (light/dark modes, color tokens) keeps UI elements looking and feeling uniform across the app.

### Applying These Principles
- Buttons and form fields follow a single style guide (see Section 3).
- Validation errors appear directly beneath inputs with clear messaging.
- Data tables collapse into card lists on small screens for better readability.

## 3. Styling and Theming

### Styling Approach
- **Utility-First**: Tailwind CSS v4 is our main tool. We rarely write custom CSS—most styling is done with utility classes (e.g., `px-4 py-2 bg-primary text-white`).
- **CSS Variables**: Under the hood, we define color and spacing tokens as CSS variables. Tailwind reads these so we can switch themes easily.

### Theme Handling
- **Light & Dark Modes**: A single toggle (or system preference) switches CSS variables for background, text, and accent colors.
- **Global Updates**: Changing a token in the `:root` or `body.dark` block updates the whole app instantly.

### Visual Style
- Flat, modern design with subtle shadows for layering.
- Clean typography and generous white space for a professional look.

### Color Palette
- **Primary**: #1D4ED8  (Blue)
- **Secondary**: #6B7280 (Gray)
- **Accent**: #10B981  (Teal)
- **Background (Light)**: #F3F4F6 / #FFFFFF
- **Background (Dark)**: #1F2937 / #111827
- **Text (Light)**: #111827
- **Text (Dark)**: #F3F4F6

### Typography
- **Font**: Inter (system-UI fallback)
- **Headings**: 600-weight for clarity
- **Body**: 400-weight, 1.5 line-height for readability

## 4. Component Structure

### Organization
- `/components/ui`: All shadcn/ui building blocks (Buttons, Dialogs, Tables).
- `/components/common` or `/components/shared`: App-specific reusable pieces (e.g., `TaskItem.tsx`, `ProjectCard.tsx`, `ContactForm.tsx`).
- `/app`: Page-level folders (Next.js App Router) with `layout.tsx` and `page.tsx`.

### Reuse and Modularity
- Each component has its own folder with:
  - A `.tsx` file for logic and markup
  - A `.stories.tsx` file (if using Storybook) for isolated previews
  - A test file (`.test.tsx`) for unit tests
- Smaller “atomic” components (Input, Label) get composed into larger molecules (FormRow), which then build organisms (ContactForm).

### Benefits
- Clear ownership: you know exactly where to look for or add a feature.
- Easy refactoring: change a component in one place, and it updates everywhere it’s used.

## 5. State Management

### Local State
- **React Hooks** (`useState`, `useEffect`, `useReducer`) handle most component-level interactions (e.g., form inputs, modal open/close).

### Server State
- Data fetching from our Next.js API routes (e.g., `/api/tasks`, `/api/contacts`) uses React’s built-in `fetch` or libraries like **SWR** or **React Query** for caching and revalidation.

### Global State (Future)
- For cross-component state (user settings, theme mode, current project), we recommend **Zustand** or **Jotai**—lightweight libraries that play well with React and TypeScript.

## 6. Routing and Navigation

### Page Routing
- **Next.js App Router**: File-based routing under `/app`. Create a new folder and `page.tsx` to add a route.
- **Dynamic Routes**: `[id]/page.tsx` for pages that depend on URL parameters (e.g., `/projects/[projectId]`).

### Navigation Components
- **`next/link`**: For internal links—ensures client-side navigation without full page reloads.
- **Sidebar & Topbar**: Shared layout components in `/app/layout.tsx` wrap each page, containing navigation menus.

### API Routes
- Under `/app/api`, each feature gets a folder (e.g., `/app/api/tasks/route.ts`). We follow REST conventions for CRUD:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PATCH /api/tasks/[id]`
  - `DELETE /api/tasks/[id]`

## 7. Performance Optimization

### Code Splitting & Lazy Loading
- Next.js automatically splits pages into separate bundles.
- Use dynamic imports (`next/dynamic`) for rarely used components (e.g., charts, heavy libraries).

### Asset Optimization
- **Image Optimization**: `next/image` resizes and serves images in modern formats (WebP) when possible.
- **CSS Purge**: Tailwind’s JIT removes unused utility classes, keeping CSS payload minimal.

### Caching & Data Fetching
- **Static Generation (SSG)/Incremental Static Regeneration (ISR)** for pages that can be prebuilt or refreshed periodically.
- **Client Caching**: SWR or React Query caches API results, minimizing network calls for repeated views.

## 8. Testing and Quality Assurance

### Unit & Integration Tests
- **Jest** with **React Testing Library**:
  - Test components render correctly with different props.
  - Mock API calls to validate data flows.

### End-to-End Tests
- **Cypress** or **Playwright**:
  - Simulate user flows (sign-in, create task, edit contact).
  - Run tests on CI (GitHub Actions, GitLab CI) to catch regressions early.

### Linters & Formatters
- **ESLint** with TypeScript rules enforces code quality and consistency.
- **Prettier** auto-formats code on save or commit.
- **Type Checking**: `tsc --noEmit` runs in CI to prevent type errors.

## 9. Conclusion and Overall Frontend Summary

This Entrepreneur Dashboard Suite frontend is built on Next.js and React with TypeScript, styled by Tailwind CSS, and powered by shadcn/ui components. It follows modern design principles—usability, accessibility, responsiveness—and a component-based structure that makes scaling and maintenance straightforward. 

Authentication is handled by Better Auth in Next.js API routes, while Drizzle ORM with PostgreSQL takes care of data persistence on the backend side. State is managed locally with React Hooks and can grow into a global store with Zustand or Jotai. Routing leverages the App Router’s file-based conventions, and performance is optimized through code splitting, image optimization, and caching. 

Quality is assured by a robust testing framework (Jest/RTL, Cypress) and code standards enforced via ESLint, Prettier, and TypeScript. With clear separation of concerns and a flexible theming system, this setup gives you a rock-solid foundation to build your custom Task Manager, CRM, Contact Manager, and Project Management tools.