"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Calendar, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Project {
    id: string;
    name: string;
    description?: string;
    status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

interface Task {
    id: string;
    title: string;
    status: "todo" | "in_progress" | "completed" | "cancelled";
    priority: "low" | "medium" | "high" | "urgent";
    dueDate?: string;
    projectId?: string;
}

const statusColors = {
    planning: "bg-blue-100 text-blue-800",
    active: "bg-green-100 text-green-800",
    on_hold: "bg-yellow-100 text-yellow-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
};

const statusIcons = {
    planning: Clock,
    active: CheckCircle,
    on_hold: AlertCircle,
    completed: CheckCircle,
    cancelled: AlertCircle,
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showProjectDetail, setShowProjectDetail] = useState(false);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "planning" as Project["status"],
        startDate: "",
        endDate: "",
    });

    const fetchProjects = async () => {
        try {
            const response = await fetch("/api/projects");
            if (!response.ok) throw new Error("Failed to fetch projects");

            const data = await response.json();
            setProjects(data.data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load projects",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await fetch("/api/tasks");
            if (!response.ok) throw new Error("Failed to fetch tasks");

            const data = await response.json();
            setTasks(data.data || []);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        }
    };

    useEffect(() => {
        fetchProjects();
        fetchTasks();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
            };

            const url = editingProject ? `/api/projects/${editingProject.id}` : "/api/projects";
            const method = editingProject ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save project");

            await fetchProjects();
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingProject(null);
            setFormData({
                name: "",
                description: "",
                status: "planning",
                startDate: "",
                endDate: "",
            });

            toast({
                title: "Success",
                description: `Project ${editingProject ? "updated" : "created"} successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${editingProject ? "update" : "create"} project`,
                variant: "destructive",
            });
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || "",
            status: project.status,
            startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : "",
            endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : "",
        });
        setIsEditDialogOpen(true);
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete project");

            await fetchProjects();
            toast({
                title: "Success",
                description: "Project deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete project",
                variant: "destructive",
            });
        }
    };

    const handleViewProject = (project: Project) => {
        setSelectedProject(project);
        setShowProjectDetail(true);
    };

    const getProjectTasks = (projectId: string) => {
        return tasks.filter(task => task.projectId === projectId);
    };

    const getProjectStats = (projectId: string) => {
        const projectTasks = getProjectTasks(projectId);
        const completed = projectTasks.filter(t => t.status === "completed").length;
        const inProgress = projectTasks.filter(t => t.status === "in_progress").length;
        const todo = projectTasks.filter(t => t.status === "todo").length;

        return { total: projectTasks.length, completed, inProgress, todo };
    };

    const ProjectForm = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project goals and objectives..."
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Project["status"] })}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button type="submit">{editingProject ? "Update" : "Create"} Project</Button>
            </DialogFooter>
        </form>
    );

    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                    <p className="text-muted-foreground">
                        Manage your projects and track their progress
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Project
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Create New Project</DialogTitle>
                                <DialogDescription>
                                    Create a new project to organize your work.
                                </DialogDescription>
                            </DialogHeader>
                            <ProjectForm />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{projects.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter(p => p.status === "active").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Planning</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter(p => p.status === "planning").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter(p => p.status === "completed").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On Hold</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {projects.filter(p => p.status === "on_hold").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div>Loading projects...</div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {projects.length === 0 ? (
                                <div className="col-span-full text-center py-8">
                                    No projects found. Create your first project to get started!
                                </div>
                            ) : (
                                projects.map((project) => {
                                    const stats = getProjectStats(project.id);
                                    const StatusIcon = statusIcons[project.status];

                                    return (
                                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{project.name}</CardTitle>
                                                    <Badge className={statusColors[project.status]}>
                                                        <StatusIcon className="mr-1 h-3 w-3" />
                                                        {project.status.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                {project.description && (
                                                    <CardDescription>
                                                        {project.description.slice(0, 150)}
                                                        {project.description.length > 150 && "..."}
                                                    </CardDescription>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    <div className="flex items-center text-sm text-muted-foreground">
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        {project.startDate ? (
                                                            new Date(project.startDate).toLocaleDateString()
                                                        ) : (
                                                            "No start date"
                                                        )}
                                                        {project.endDate && (
                                                            <span> - {new Date(project.endDate).toLocaleDateString()}</span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Tasks</span>
                                                            <span className="font-medium">{stats.total}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>Completed</span>
                                                            <span className="font-medium text-green-600">{stats.completed}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span>In Progress</span>
                                                            <span className="font-medium text-blue-600">{stats.inProgress}</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-green-600 h-2 rounded-full"
                                                                style={{
                                                                    width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleViewProject(project)}
                                                            className="flex-1"
                                                        >
                                                            View Details
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEdit(project)}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(project.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                        <DialogDescription>
                            Update the project details.
                        </DialogDescription>
                    </DialogHeader>
                    <ProjectForm />
                </DialogContent>
            </Dialog>

            {/* Project Detail Dialog */}
            <Dialog open={showProjectDetail} onOpenChange={setShowProjectDetail}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>{selectedProject?.name}</DialogTitle>
                        <DialogDescription>
                            Project details and associated tasks
                        </DialogDescription>
                    </DialogHeader>
                    {selectedProject && (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedProject.description || "No description provided"}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-2">Status</h4>
                                    <Badge className={statusColors[selectedProject.status]}>
                                        {selectedProject.status.replace("_", " ")}
                                    </Badge>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-2">Timeline</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedProject.startDate ? (
                                            new Date(selectedProject.startDate).toLocaleDateString()
                                        ) : (
                                            "No start date"
                                        )}
                                        {selectedProject.endDate && (
                                            <span> - {new Date(selectedProject.endDate).toLocaleDateString()}</span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Associated Tasks ({getProjectTasks(selectedProject.id).length})</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {getProjectTasks(selectedProject.id).length === 0 ? (
                                        <p className="text-sm text-muted-foreground">No tasks assigned to this project</p>
                                    ) : (
                                        getProjectTasks(selectedProject.id).map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-2 border rounded">
                                                <div>
                                                    <div className="font-medium text-sm">{task.title}</div>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.status.replace("_", " ")}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-xs">
                                                            {task.priority}
                                                        </Badge>
                                                        {task.dueDate && (
                                                            <span className="text-xs text-muted-foreground">
                                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}