"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
    CheckCircle,
    Users,
    Building,
    PlusCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Task {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    completedAt?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
}

interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    company?: string;
    createdAt: string;
}

interface Project {
    id: string;
    name: string;
    status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
    createdAt: string;
}

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [tasksRes, contactsRes, projectsRes] = await Promise.all([
                    fetch("/api/tasks?limit=5"),
                    fetch("/api/contacts?limit=5"),
                    fetch("/api/projects?limit=5"),
                ]);

                if (tasksRes.ok) {
                    const tasksData = await tasksRes.json();
                    setTasks(tasksData.data || []);
                }

                if (contactsRes.ok) {
                    const contactsData = await contactsRes.json();
                    setContacts(contactsData.data || []);
                }

                if (projectsRes.ok) {
                    const projectsData = await projectsRes.json();
                    setProjects(projectsData.data || []);
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to load dashboard data",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getUpcomingTasks = () => {
        return tasks
            .filter(task => task.status !== "completed" && task.status !== "cancelled")
            .filter(task => task.dueDate && new Date(task.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
            .slice(0, 3);
    };

    const getHighPriorityTasks = () => {
        return tasks
            .filter(task => task.priority === "urgent" || task.priority === "high")
            .filter(task => task.status !== "completed" && task.status !== "cancelled")
            .slice(0, 3);
    };

    const getRecentContacts = () => {
        return contacts
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
    };

    const getActiveProjects = () => {
        return projects
            .filter(project => project.status === "active")
            .slice(0, 3);
    };

    const statusColors = {
        todo: "bg-gray-100 text-gray-800",
        in_progress: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
        planning: "bg-blue-100 text-blue-800",
        active: "bg-green-100 text-green-800",
        on_hold: "bg-yellow-100 text-yellow-800",
    };

    const priorityColors = {
        low: "bg-gray-100 text-gray-600",
        medium: "bg-yellow-100 text-yellow-800",
        high: "bg-orange-100 text-orange-800",
        urgent: "bg-red-100 text-red-800",
    };

    if (loading) {
        return (
            <div className="flex-1 space-y-4 p-4 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Loading your workspace...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your workspace.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Link href="/dashboard/tasks">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Quick Actions
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {tasks.filter(t => t.status === "completed").length} completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter(p => p.status === "active").length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {projects.length} total projects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contacts</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contacts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {contacts.filter(c => c.email).length} with email
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{getUpcomingTasks().length}</div>
                        <p className="text-xs text-muted-foreground">
                            Tasks upcoming
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* High Priority Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                            High Priority Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getHighPriorityTasks().length === 0 ? (
                                <p className="text-sm text-muted-foreground">No high priority tasks</p>
                            ) : (
                                getHighPriorityTasks().map((task) => (
                                    <div key={task.id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium truncate">{task.title}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Badge className={priorityColors[task.priority]}>
                                                    {task.priority}
                                                </Badge>
                                                <Badge className={statusColors[task.status]}>
                                                    {task.status.replace("_", " ")}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/dashboard/tasks">
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                View All Tasks
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Recent Contacts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-blue-500" />
                            Recent Contacts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getRecentContacts().length === 0 ? (
                                <p className="text-sm text-muted-foreground">No contacts yet</p>
                            ) : (
                                getRecentContacts().map((contact) => (
                                    <div key={contact.id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{contact.name}</p>
                                            {contact.company && (
                                                <p className="text-xs text-muted-foreground">{contact.company}</p>
                                            )}
                                            {contact.jobTitle && (
                                                <p className="text-xs text-muted-foreground">{contact.jobTitle}</p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/dashboard/contacts">
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                View All Contacts
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Active Projects */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Briefcase className="mr-2 h-4 w-4 text-green-500" />
                            Active Projects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {getActiveProjects().length === 0 ? (
                                <p className="text-sm text-muted-foreground">No active projects</p>
                            ) : (
                                getActiveProjects().map((project) => (
                                    <div key={project.id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{project.name}</p>
                                            <Badge className={statusColors[project.status]}>
                                                {project.status.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <Link href="/dashboard/projects">
                            <Button variant="outline" size="sm" className="w-full mt-4">
                                View All Projects
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Get started with common tasks
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <Link href="/dashboard/tasks">
                            <Button className="w-full justify-start">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Task
                            </Button>
                        </Link>
                        <Link href="/dashboard/contacts">
                            <Button variant="outline" className="w-full justify-start">
                                <Users className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </Link>
                        <Link href="/dashboard/projects">
                            <Button variant="outline" className="w-full justify-start">
                                <Briefcase className="mr-2 h-4 w-4" />
                                New Project
                            </Button>
                        </Link>
                        <Link href="/dashboard/companies">
                            <Button variant="outline" className="w-full justify-start">
                                <Building className="mr-2 h-4 w-4" />
                                Add Company
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}