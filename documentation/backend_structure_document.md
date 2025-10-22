# Backend Structure Document

## Backend Architecture

The backend for the Entrepreneur Dashboard Suite is built on Next.js’ App Router and uses Rest-style API routes. It follows a simple layered approach:  
•  **Routes:** Define the public URLs (e.g., `/api/tasks`).  
•  **Controllers/Handlers:** Handle incoming requests, run validation, and call the right business logic.  
•  **Services/Models:** Use Drizzle ORM to read and write data in PostgreSQL.  

This structure supports:
•  **Scalability:** Serverless functions on Vercel can grow or shrink automatically with traffic.  
•  **Maintainability:** Clear separation of routes, logic, and data keeps code organized.  
•  **Performance:** Next.js serverless functions spin up quickly, and Vercel’s global network serves assets close to your users.

## Database Management

We use PostgreSQL (a relational SQL database) together with Drizzle ORM.  

•  **PostgreSQL (SQL):** Reliable, ACID-compliant, and widely supported for structured data.  
•  **Drizzle ORM:** Type-safe library that maps JavaScript/TypeScript objects to database tables. It prevents errors by enforcing your data shapes at compile time.

Data is organized into tables for users, tasks, contacts, projects, and any join tables needed for relationships. Drizzle automatically handles migrations (creating or updating tables) and provides an easy API for queries.

## Database Schema

Below is a human-readable summary of the main tables. You can also use these SQL definitions directly in PostgreSQL.

Users table:
- id (primary key)
- email (unique)
- passwordHash
- name
- createdAt, updatedAt

Tasks table:
- id (primary key)
- title
- description
- status (e.g., pending, completed)
- dueDate
- userId (foreign key → Users.id)
- projectId (nullable foreign key → Projects.id)
- createdAt, updatedAt

Contacts table:
- id (primary key)
- name
- email
- company
- phone (optional)
- userId (foreign key → Users.id)
- createdAt, updatedAt

Projects table:
- id (primary key)
- name
- description
- userId (foreign key → Users.id)
- createdAt, updatedAt

Optional join table for many-to-many (Projects ↔ Contacts):
- projectId (foreign key → Projects.id)
- contactId (foreign key → Contacts.id)

SQL example (PostgreSQL):
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL,
  due_date DATE,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
-- Similar definitions for contacts and projects
```  

## API Design and Endpoints

We follow a RESTful style using Next.js API routes under `/app/api`. Each resource (tasks, contacts, projects) has its own folder. Key endpoints:

•  **Authentication** (`/api/auth/*`)
   - Sign Up, Sign In, Sign Out, Session checks

•  **Tasks** (`/api/tasks`)
   - `GET /api/tasks`: list user’s tasks
   - `POST /api/tasks`: create a new task
   - `PUT /api/tasks/:id`: update an existing task
   - `DELETE /api/tasks/:id`: remove a task

•  **Contacts** (`/api/contacts`)
   - `GET /api/contacts`
   - `POST /api/contacts`
   - `PUT /api/contacts/:id`
   - `DELETE /api/contacts/:id`

•  **Projects** (`/api/projects`)
   - `GET /api/projects`
   - `POST /api/projects`
   - `PUT /api/projects/:id`
   - `DELETE /api/projects/:id`

•  **Search** (`/api/search`)
   - `POST /api/search`: runs a query across tasks, contacts, and projects

Each endpoint:
1.  Validates the user’s session and input data.  
2.  Calls Drizzle ORM to interact with the database.  
3.  Returns JSON results or error messages.

## Hosting Solutions

•  **Vercel (Primary):**  
   - Serverless deployment for Next.js.  
   - Built-in global CDN for static assets (JS, CSS, images).  
   - Automatic scaling: functions spin up based on demand.  
   - Simple Git integration: deploy from each push.

•  **Docker Support (Local/Custom):**  
   - `Dockerfile` and `docker-compose.yaml` included.  
   - Reproduce a consistent environment locally or on another cloud provider.

## Infrastructure Components

•  **Load Balancing & Edge Network:** Under the hood, Vercel routes requests to the nearest edge location, distributing traffic and minimizing latency.  
•  **CDN:** Static files (CSS, JS, images) are cached globally.  
•  **Caching:** Next.js can cache API responses where appropriate. You can add HTTP cache headers or integrate Redis if needed in the future.  
•  **Containerization:** Docker ensures all developers work in the same environment and eases onboarding.

These components work together to deliver fast page loads, distribute traffic seamlessly, and provide a reliable end-user experience.

## Security Measures

•  **Authentication:** Managed by Better Auth, with secure password hashing and session tokens.  
•  **Authorization:** Every API route checks the user’s session and only returns data belonging to that user.  
•  **Data Encryption:** All traffic runs over HTTPS by default on Vercel.  
•  **Environment Variables:** Secrets (e.g., database URL, auth keys) stored securely in Vercel’s Dashboard or `.env` files locally.  
•  **SQL Injection Protection:** Drizzle ORM builds parameterized queries automatically.  
•  **Rate Limiting (Recommended):** You can add middleware or third-party services (e.g., Vercel Edge Middleware) to limit abusive calls.

## Monitoring and Maintenance

•  **Logs & Metrics:** Vercel provides real-time logs for serverless functions. You can forward logs to tools like Datadog or Sentry for error tracking.  
•  **Health Checks:** Use Vercel’s uptime monitoring or integrate a third-party ping service.  
•  **Database Migrations:** Drizzle supports versioned migrations to keep schema in sync across environments.  
•  **CI/CD:** Each Git push triggers tests and builds. Consider adding GitHub Actions for unit/integration tests using Jest.  
•  **Dependency Updates:** Regularly update Node, Next.js, and all libraries to patch security vulnerabilities.

## Conclusion and Overall Backend Summary

The Entrepreneur Dashboard Suite backend is a modern, API-driven setup based on Next.js serverless functions and PostgreSQL via Drizzle ORM. It’s built to scale effortlessly on Vercel, remains maintainable through a layered code structure, and stays performant thanks to global caching and edge routing. Security best practices—strong authentication, encrypted transport, parameterized queries—protect user data. Monitoring tools and migration support ensure the system stays healthy and up-to-date.

This foundation lets you focus on adding features (tasks, contacts, projects, advanced search) without worrying about core infrastructure. It’s a robust, flexible backend ready to grow with your entrepreneur workspace.
