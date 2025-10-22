// Export all schemas
export * from "./auth";
export * from "./business";

// Re-export commonly used imports
import { user } from "./auth";
import { tasks, contacts, companies, projects } from "./business";

export const schemas = {
    user,
    tasks,
    contacts,
    companies,
    projects,
};