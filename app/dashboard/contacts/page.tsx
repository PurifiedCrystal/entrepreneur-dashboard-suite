"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Edit, Trash2, Phone, Mail, Building, User } from "lucide-react";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface Contact {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    jobTitle?: string;
    notes?: string;
    company?: string;
    companyId?: string;
    createdAt: string;
    updatedAt: string;
}

interface Company {
    id: string;
    name: string;
    industry?: string;
    website?: string;
    description?: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("contacts");
    const { toast } = useToast();

    // Contact form state
    const [contactFormData, setContactFormData] = useState({
        name: "",
        email: "",
        phone: "",
        jobTitle: "",
        notes: "",
        company: "",
        companyId: "",
    });

    // Company form state
    const [companyFormData, setCompanyFormData] = useState({
        name: "",
        industry: "",
        website: "",
        description: "",
        phone: "",
        address: "",
    });

    const fetchContacts = async () => {
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append("search", searchTerm);

            const response = await fetch(`/api/contacts?${params.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch contacts");

            const data = await response.json();
            setContacts(data.data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load contacts",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanies = async () => {
        try {
            const response = await fetch("/api/companies");
            if (!response.ok) throw new Error("Failed to fetch companies");

            const data = await response.json();
            setCompanies(data.data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load companies",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (activeTab === "contacts") {
            fetchContacts();
        } else {
            fetchCompanies();
        }
    }, [activeTab, searchTerm]);

    const handleContactSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...contactFormData,
                companyId: contactFormData.companyId || null,
            };

            const url = editingContact ? `/api/contacts/${editingContact.id}` : "/api/contacts";
            const method = editingContact ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error("Failed to save contact");

            await fetchContacts();
            setIsCreateDialogOpen(false);
            setIsEditDialogOpen(false);
            setEditingContact(null);
            setContactFormData({
                name: "",
                email: "",
                phone: "",
                jobTitle: "",
                notes: "",
                company: "",
                companyId: "",
            });

            toast({
                title: "Success",
                description: `Contact ${editingContact ? "updated" : "created"} successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${editingContact ? "update" : "create"} contact`,
                variant: "destructive",
            });
        }
    };

    const handleCompanySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingCompany ? `/api/companies/${editingCompany.id}` : "/api/companies";
            const method = editingCompany ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(companyFormData),
            });

            if (!response.ok) throw new Error("Failed to save company");

            await fetchCompanies();
            setIsCompanyDialogOpen(false);
            setEditingCompany(null);
            setCompanyFormData({
                name: "",
                industry: "",
                website: "",
                description: "",
                phone: "",
                address: "",
            });

            toast({
                title: "Success",
                description: `Company ${editingCompany ? "updated" : "created"} successfully`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: `Failed to ${editingCompany ? "update" : "create"} company`,
                variant: "destructive",
            });
        }
    };

    const handleEditContact = (contact: Contact) => {
        setEditingContact(contact);
        setContactFormData({
            name: contact.name,
            email: contact.email || "",
            phone: contact.phone || "",
            jobTitle: contact.jobTitle || "",
            notes: contact.notes || "",
            company: contact.company || "",
            companyId: contact.companyId || "",
        });
        setIsEditDialogOpen(true);
    };

    const handleEditCompany = (company: Company) => {
        setEditingCompany(company);
        setCompanyFormData({
            name: company.name,
            industry: company.industry || "",
            website: company.website || "",
            description: company.description || "",
            phone: company.phone || "",
            address: company.address || "",
        });
        setIsCompanyDialogOpen(true);
    };

    const handleDeleteContact = async (contactId: string) => {
        if (!confirm("Are you sure you want to delete this contact?")) return;

        try {
            const response = await fetch(`/api/contacts/${contactId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete contact");

            await fetchContacts();
            toast({
                title: "Success",
                description: "Contact deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete contact",
                variant: "destructive",
            });
        }
    };

    const handleDeleteCompany = async (companyId: string) => {
        if (!confirm("Are you sure you want to delete this company?")) return;

        try {
            const response = await fetch(`/api/companies/${companyId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Failed to delete company");

            await fetchCompanies();
            toast({
                title: "Success",
                description: "Company deleted successfully",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete company",
                variant: "destructive",
            });
        }
    };

    const ContactForm = () => (
        <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                    id="name"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData({ ...contactFormData, name: e.target.value })}
                    placeholder="Enter contact name"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={contactFormData.email}
                        onChange={(e) => setContactFormData({ ...contactFormData, email: e.target.value })}
                        placeholder="email@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        value={contactFormData.phone}
                        onChange={(e) => setContactFormData({ ...contactFormData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                        id="jobTitle"
                        value={contactFormData.jobTitle}
                        onChange={(e) => setContactFormData({ ...contactFormData, jobTitle: e.target.value })}
                        placeholder="Product Manager"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Select value={contactFormData.companyId} onValueChange={(value) => {
                        const selectedCompany = companies.find(c => c.id === value);
                        setContactFormData({
                            ...contactFormData,
                            companyId: value,
                            company: selectedCompany?.name || ""
                        });
                    }}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a company" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">No company</SelectItem>
                            {companies.map((company) => (
                                <SelectItem key={company.id} value={company.id}>
                                    {company.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                    id="notes"
                    value={contactFormData.notes}
                    onChange={(e) => setContactFormData({ ...contactFormData, notes: e.target.value })}
                    placeholder="Add any notes about this contact..."
                    rows={3}
                />
            </div>

            <DialogFooter>
                <Button type="submit">{editingContact ? "Update" : "Create"} Contact</Button>
            </DialogFooter>
        </form>
    );

    const CompanyForm = () => (
        <form onSubmit={handleCompanySubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                    id="companyName"
                    value={companyFormData.name}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, name: e.target.value })}
                    placeholder="Enter company name"
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                        id="industry"
                        value={companyFormData.industry}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, industry: e.target.value })}
                        placeholder="Technology"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                        id="website"
                        type="url"
                        value={companyFormData.website}
                        onChange={(e) => setCompanyFormData({ ...companyFormData, website: e.target.value })}
                        placeholder="https://example.com"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                    id="companyPhone"
                    value={companyFormData.phone}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    value={companyFormData.address}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
                    placeholder="123 Business St, City, State 12345"
                    rows={2}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    value={companyFormData.description}
                    onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })}
                    placeholder="Describe the company..."
                    rows={3}
                />
            </div>

            <DialogFooter>
                <Button type="submit">{editingCompany ? "Update" : "Create"} Company</Button>
            </DialogFooter>
        </form>
    );

    return (
        <div className="flex-1 space-y-4 p-4 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">CRM</h2>
                    <p className="text-muted-foreground">
                        Manage your contacts and companies
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{contacts.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{companies.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Email</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contacts.filter(c => c.email).length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">With Phone</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {contacts.filter(c => c.phone).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="contacts">Contacts</TabsTrigger>
                        <TabsTrigger value="companies">Companies</TabsTrigger>
                    </TabsList>
                    <div className="flex items-center space-x-2">
                        {activeTab === "contacts" ? (
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Contact
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Contact</DialogTitle>
                                        <DialogDescription>
                                            Add a new contact to your CRM.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ContactForm />
                                </DialogContent>
                            </Dialog>
                        ) : (
                            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        Add Company
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Create New Company</DialogTitle>
                                        <DialogDescription>
                                            Add a new company to your CRM.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <CompanyForm />
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                <TabsContent value="contacts">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contacts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div>Loading contacts...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contact</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contacts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    No contacts found. Create your first contact to get started!
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contacts.map((contact) => (
                                                <TableRow key={contact.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{contact.name}</div>
                                                            {contact.jobTitle && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {contact.jobTitle}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {contact.company || (
                                                            <span className="text-muted-foreground">No company</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {contact.email ? (
                                                            <a
                                                                href={`mailto:${contact.email}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {contact.email}
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">No email</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {contact.phone ? (
                                                            <a
                                                                href={`tel:${contact.phone}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {contact.phone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">No phone</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditContact(contact)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteContact(contact.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="companies">
                    <Card>
                        <CardHeader>
                            <CardTitle>Companies</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div>Loading companies...</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Company</TableHead>
                                            <TableHead>Industry</TableHead>
                                            <TableHead>Website</TableHead>
                                            <TableHead>Phone</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {companies.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center py-8">
                                                    No companies found. Create your first company to get started!
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            companies.map((company) => (
                                                <TableRow key={company.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{company.name}</div>
                                                            {company.description && (
                                                                <div className="text-sm text-muted-foreground">
                                                                    {company.description.slice(0, 100)}...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.industry || (
                                                            <span className="text-muted-foreground">Not specified</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.website ? (
                                                            <a
                                                                href={company.website}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                Visit Website
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">No website</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {company.phone ? (
                                                            <a
                                                                href={`tel:${company.phone}`}
                                                                className="text-blue-600 hover:underline"
                                                            >
                                                                {company.phone}
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">No phone</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEditCompany(company)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDeleteCompany(company.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Contact Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Contact</DialogTitle>
                        <DialogDescription>
                            Update the contact details.
                        </DialogDescription>
                    </DialogHeader>
                    <ContactForm />
                </DialogContent>
            </Dialog>

            {/* Edit Company Dialog */}
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Company</DialogTitle>
                        <DialogDescription>
                            Update the company details.
                        </DialogDescription>
                    </DialogHeader>
                    <CompanyForm />
                </DialogContent>
            </Dialog>
        </div>
    );
}