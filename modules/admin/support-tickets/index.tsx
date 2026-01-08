"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Search,
  RefreshCw,
  Mail,
  ExternalLink,
  LogOut,
  Send,
  Plus,
  Edit,
  Trash2,
  FileText,
} from "lucide-react";

interface Ticket {
  id: string;
  ticketId: string;
  name: string;
  email: string;
  issueType: string;
  title: string;
  description: string;
  steps?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: any;
  updatedAt: any;
}

interface ConversationMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  senderName: string;
  senderEmail: string;
  createdAt: any;
  addedVia?: string;
}

interface KnownIssue {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "fix_planned" | "in_progress" | "testing";
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  estimatedFix?: string;
  workaround?: string;
  createdAt: string;
  updatedAt: string;
}

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  resolved:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
};

// NEW: Status helpers for known issues
const knownIssueStatusColors = {
  investigating:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  fix_planned:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  in_progress:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  testing:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
};

const knownIssueStatusLabels = {
  investigating: "Investigating",
  fix_planned: "Fix Planned",
  in_progress: "In Progress",
  testing: "Testing",
};

const AdminSupportTickets = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [replyAsUser, setReplyAsUser] = useState(false);
  const [gmailChecking, setGmailChecking] = useState(false);
  const [gmailStatus, setGmailStatus] = useState<string>("");
  const [autoCheckEnabled, setAutoCheckEnabled] = useState(true);
  const [autoCheckInterval, setAutoCheckInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [countdownTick, setCountdownTick] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Known Issues state
  const [activeTab, setActiveTab] = useState<"tickets" | "known-issues">(
    "tickets"
  );
  const [knownIssues, setKnownIssues] = useState<KnownIssue[]>([]);
  const [showKnownIssueModal, setShowKnownIssueModal] = useState(false);
  const [editingKnownIssue, setEditingKnownIssue] = useState<KnownIssue | null>(
    null
  );
  const [knownIssueForm, setKnownIssueForm] = useState({
    title: "",
    description: "",
    status: "investigating" as KnownIssue["status"],
    priority: "medium" as KnownIssue["priority"],
    category: "",
    estimatedFix: "",
    workaround: "",
  });
  const [isSubmittingKnownIssue, setIsSubmittingKnownIssue] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check admin session
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) {
      router.push("/report-issue");
      return;
    }

    fetchTickets();
    fetchKnownIssues();
  }, [router]);

  // Auto-start email checking when component mounts
  useEffect(() => {
    if (mounted) {
      startAutoCheck();
    }

    // Cleanup on unmount
    return () => {
      if (autoCheckInterval) {
        clearInterval(autoCheckInterval);
      }
    };
  }, [mounted]);

  // Reset filter if it's set to "closed" since closed tickets are now deleted
  useEffect(() => {
    if (filterStatus === "closed") {
      setFilterStatus("all");
    }
  }, [filterStatus]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets);
      } else {
        console.error("Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKnownIssues = async () => {
    try {
      const response = await fetch("/api/known-issues");
      if (response.ok) {
        const data = await response.json();
        setKnownIssues(data.issues);
      }
    } catch (error) {
      console.error("Error fetching known issues:", error);
    }
  };

  const handleKnownIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingKnownIssue(true);

    try {
      const url = editingKnownIssue
        ? `/api/known-issues/${editingKnownIssue.id}`
        : "/api/known-issues";

      const method = editingKnownIssue ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(knownIssueForm),
      });

      if (response.ok) {
        await fetchKnownIssues();
        setShowKnownIssueModal(false);
        setEditingKnownIssue(null);
        setKnownIssueForm({
          title: "",
          description: "",
          status: "investigating",
          priority: "medium",
          category: "",
          estimatedFix: "",
          workaround: "",
        });
      }
    } catch (error) {
      console.error("Error submitting known issue:", error);
    } finally {
      setIsSubmittingKnownIssue(false);
    }
  };

  const handleEditKnownIssue = (issue: KnownIssue) => {
    setEditingKnownIssue(issue);
    setKnownIssueForm({
      title: issue.title,
      description: issue.description,
      status: issue.status,
      priority: issue.priority,
      category: issue.category,
      estimatedFix: issue.estimatedFix || "",
      workaround: issue.workaround || "",
    });
    setShowKnownIssueModal(true);
  };

  const handleDeleteKnownIssue = async (issueId: string) => {
    if (!confirm("Are you sure you want to delete this known issue?")) return;

    try {
      const response = await fetch(`/api/known-issues/${issueId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchKnownIssues();
      }
    } catch (error) {
      console.error("Error deleting known issue:", error);
    }
  };

  const fetchConversation = async (ticketId: string) => {
    try {
      setLoadingConversation(true);
      const response = await fetch(
        `/api/admin/tickets/conversation?ticketId=${ticketId}`
      );
      if (response.ok) {
        const data = await response.json();
        setConversation(data.messages || []);
      } else {
        console.error("Failed to fetch conversation");
      }
    } catch (error) {
      console.error("Error fetching conversation:", error);
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    // Confirm deletion if status is being changed to "closed"
    if (newStatus === "closed") {
      const confirmDelete = window.confirm(
        "Are you sure you want to close this ticket? This will permanently delete the ticket and all its conversation history."
      );
      if (!confirmDelete) {
        return;
      }
    }

    try {
      const response = await fetch("/api/admin/tickets/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });

      if (response.ok) {
        const result = await response.json();

        // If ticket was deleted (closed), remove it from local state
        if (result.deleted) {
          setTickets(tickets.filter((ticket) => ticket.id !== ticketId));

          // Close chat modal if this ticket was open
          if (selectedTicket?.id === ticketId) {
            setShowChatModal(false);
            setSelectedTicket(null);
            setReplyMessage("");
            setConversation([]);
          }
        } else {
          // Update local state with new status
          setTickets(
            tickets.map((ticket) =>
              ticket.id === ticketId
                ? { ...ticket, status: newStatus as any }
                : ticket
            )
          );

          // If resolving, send resolution email
          if (newStatus === "resolved") {
            const ticket = tickets.find((t) => t.id === ticketId);
            if (ticket) {
              await handleSendResolutionEmail(ticket);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating ticket status:", error);
    }
  };

  const handleSendResolutionEmail = async (ticket: Ticket) => {
    try {
      await fetch("/api/admin/tickets/send-resolution", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticketId: ticket.id }),
      });
    } catch (error) {
      console.error("Error sending resolution email:", error);
    }
  };

  const handleReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;

    try {
      setSendingReply(true);
      const response = await fetch("/api/admin/tickets/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          message: replyMessage,
          isAdmin: !replyAsUser,
        }),
      });

      if (response.ok) {
        setReplyMessage("");
        // Refresh the conversation to show the new message
        fetchConversation(selectedTicket.id);
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setSendingReply(false);
    }
  };

  const openChatModal = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowChatModal(true);

    // Initialize empty conversation and fetch real messages
    setConversation([]);
    fetchConversation(ticket.id);
  };

  const logout = () => {
    localStorage.removeItem("admin_session");
    router.push("/report-issue");
  };

  const checkGmail = async () => {
    try {
      setGmailChecking(true);
      setGmailStatus("Checking for new email replies...");

      const response = await fetch("/api/check-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setGmailStatus(`✅ Email check complete! ${result.message}`);
        // Refresh tickets to show any new conversations
        fetchTickets();
      } else {
        setGmailStatus(`❌ Email check failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Error checking emails:", error);
      setGmailStatus("❌ Email check failed: Network error");
    } finally {
      setGmailChecking(false);
      // Clear status after 5 seconds
      setTimeout(() => setGmailStatus(""), 5000);
    }
  };

  const startAutoCheck = () => {
    if (autoCheckInterval) {
      clearInterval(autoCheckInterval);
    }

    setAutoCheckEnabled(true);

    // Check emails immediately
    checkGmail();

    // Set up interval to check every 2 minutes
    const interval = setInterval(
      () => {
        checkGmail();
        // Update next check time after each check
        const nextCheck = new Date();
        nextCheck.setMinutes(nextCheck.getMinutes() + 2);
        setNextCheckTime(nextCheck);
      },
      2 * 60 * 1000
    ); // 2 minutes

    setAutoCheckInterval(interval);

    // Set initial next check time
    const initialNextCheck = new Date();
    initialNextCheck.setMinutes(initialNextCheck.getMinutes() + 2);
    setNextCheckTime(initialNextCheck);
  };

  const stopAutoCheck = () => {
    if (autoCheckInterval) {
      clearInterval(autoCheckInterval);
      setAutoCheckInterval(null);
    }
    setAutoCheckEnabled(false);
    setNextCheckTime(null);
    setGmailStatus("Auto-check stopped");
    setTimeout(() => setGmailStatus(""), 3000);
  };

  // Update countdown display every second
  useEffect(() => {
    let displayInterval: NodeJS.Timeout;

    if (autoCheckEnabled && nextCheckTime) {
      displayInterval = setInterval(() => {
        // Update counter to force re-render of countdown
        setCountdownTick((prev) => prev + 1);
      }, 1000); // Update every second
    }

    return () => {
      if (displayInterval) {
        clearInterval(displayInterval);
      }
    };
  }, [autoCheckEnabled, nextCheckTime]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return "Now";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date.getTime())) return "Invalid Date";

      const now = new Date();
      const messageDate = new Date(date);

      // If message is from today, show only time
      if (messageDate.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // If message is from yesterday, show "Yesterday HH:MM"
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (messageDate.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }

      // If message is from this year, show "MM/DD HH:MM"
      if (messageDate.getFullYear() === now.getFullYear()) {
        return `${date.toLocaleDateString([], { month: "2-digit", day: "2-digit" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      }

      // For older messages, show full date and time
      return `${date.toLocaleDateString([], { month: "2-digit", day: "2-digit", year: "2-digit" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getTimeUntilNextCheck = () => {
    if (!nextCheckTime) return null;
    const now = new Date();
    const timeLeft = nextCheckTime.getTime() - now.getTime();

    if (timeLeft <= 0) return "Soon";

    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
      <main className="flex-1">
        {/* Header */}
        <section className="w-full py-8 bg-gradient-to-br from-maroon to-maroon-dark dark:from-[#1a1f2c] dark:to-[#2a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Support Tickets Dashboard
                </h1>
                <p className="text-gray-200">
                  Manage and respond to user support requests
                </p>
                {gmailStatus && (
                  <p className="text-sm text-yellow-200 mt-2">{gmailStatus}</p>
                )}
                {autoCheckEnabled && nextCheckTime && (
                  <p className="text-sm text-green-200 mt-1">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      Auto-checking emails every 2 minutes • Next check in:{" "}
                      {getTimeUntilNextCheck()}
                    </span>
                  </p>
                )}
                {!autoCheckEnabled && (
                  <p className="text-sm text-red-200 mt-1">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                      Auto-check disabled
                    </span>
                  </p>
                )}
              </div>
              <div className="flex items-center flex-wrap gap-2 md:gap-4">
                <div className="flex items-center gap-2 md:gap-4">
                  <Button
                    onClick={checkGmail}
                    variant="ghost"
                    className="text-white hover:bg-white/10 text-xs md:text-balance"
                    disabled={gmailChecking}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {gmailChecking ? "Checking..." : "Check Now"}
                  </Button>
                  <Button
                    onClick={autoCheckEnabled ? stopAutoCheck : startAutoCheck}
                    variant="ghost"
                    className={`text-white hover:bg-white/10 text-xs md:text-balance ${autoCheckEnabled ? "bg-green-600/20" : "bg-red-600/20"}`}
                  >
                    {autoCheckEnabled ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Stop Auto-Check
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Start Auto-Check
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <Button
                    onClick={fetchTickets}
                    variant="ghost"
                    className="text-white hover:bg-white/10 text-xs md:text-balance"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    className="text-white hover:bg-white/10 text-xs md:text-balance"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="w-full bg-white dark:bg-[#232838] border-b border-gray-200 dark:border-gray-700">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab("tickets")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "tickets"
                    ? "border-maroon text-maroon dark:border-maroon-lite dark:text-maroon-lite"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Support Tickets ({tickets.length})
              </button>
              <button
                onClick={() => setActiveTab("known-issues")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "known-issues"
                    ? "border-maroon text-maroon dark:border-maroon-lite dark:text-maroon-lite"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <FileText className="h-4 w-4 mr-2 inline" />
                Known Issues ({knownIssues.length})
              </button>
            </div>
          </div>
        </section>

        {/* Tickets Tab Content */}
        {activeTab === "tickets" && (
          <>
            {/* Stats Cards */}
            <section className="w-full py-8 bg-gray-50 dark:bg-[#232838]">
              <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <div className="grid gap-6 md:grid-cols-4">
                  {loading ? (
                    <>
                      {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Skeleton className="h-4 w-20 mb-2" />
                                <Skeleton className="h-8 w-12" />
                              </div>
                              <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  ) : (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Total Tickets
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {tickets.length}
                              </p>
                            </div>
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                              <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Open
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {
                                  tickets.filter((t) => t.status === "open")
                                    .length
                                }
                              </p>
                            </div>
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                In Progress
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {
                                  tickets.filter(
                                    (t) => t.status === "in_progress"
                                  ).length
                                }
                              </p>
                            </div>
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                              <AlertTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Resolved
                              </p>
                              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {
                                  tickets.filter((t) => t.status === "resolved")
                                    .length
                                }
                              </p>
                            </div>
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Filters and Search */}
            <section className="w-full py-6 bg-white dark:bg-[#1a1f2c]">
              <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  {loading ? (
                    <>
                      <div className="flex-1">
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-32" />
                      <Skeleton className="h-10 w-32" />
                    </>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-10 rounded-md border"
                          />
                        </div>
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#2a3349] dark:text-white"
                      >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#2a3349] dark:text-white"
                      >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Tickets Table */}
            <section className="w-full py-8 bg-gray-50 dark:bg-[#232838]">
              <div className="container px-4 md:px-6 max-w-7xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {loading ? (
                        <Skeleton className="h-6 w-48" />
                      ) : (
                        `Support Tickets (${filteredTickets.length})`
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Ticket ID
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                User
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Title
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Priority
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Status
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Created
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...Array(5)].map((_, i) => (
                              <tr
                                key={i}
                                className="border-b border-gray-100 dark:border-gray-700/50"
                              >
                                <td className="py-4 px-2">
                                  <Skeleton className="h-6 w-24 rounded" />
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-2">
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                    <div>
                                      <Skeleton className="h-4 w-20 mb-1" />
                                      <Skeleton className="h-3 w-32" />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-2">
                                  <Skeleton className="h-4 w-32 mb-1" />
                                  <Skeleton className="h-3 w-16" />
                                </td>
                                <td className="py-4 px-2">
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                </td>
                                <td className="py-4 px-2">
                                  <Skeleton className="h-6 w-20 rounded" />
                                </td>
                                <td className="py-4 px-2">
                                  <Skeleton className="h-4 w-28" />
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex gap-2">
                                    <Skeleton className="h-8 w-8 rounded" />
                                    <Skeleton className="h-8 w-8 rounded" />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Ticket ID
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                User
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Title
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Priority
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Status
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Created
                              </th>
                              <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTickets.map((ticket) => (
                              <tr
                                key={ticket.id}
                                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                              >
                                <td className="py-4 px-2">
                                  <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                    {ticket.ticketId}
                                  </code>
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                      <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                                        {ticket.name}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {ticket.email}
                                      </p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-2">
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {ticket.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {ticket.issueType}
                                  </p>
                                </td>
                                <td className="py-4 px-2">
                                  <Badge
                                    className={`${priorityColors[ticket.priority]} text-xs`}
                                  >
                                    {ticket.priority}
                                  </Badge>
                                </td>
                                <td className="py-4 px-2">
                                  <select
                                    value={ticket.status}
                                    onChange={(e) =>
                                      handleStatusChange(
                                        ticket.id,
                                        e.target.value
                                      )
                                    }
                                    className={`text-xs px-2 py-1 rounded border-0 ${statusColors[ticket.status]}`}
                                  >
                                    <option value="open">Open</option>
                                    <option value="in_progress">
                                      In Progress
                                    </option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">
                                      🗑️ Delete (Close)
                                    </option>
                                  </select>
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(ticket.createdAt)}
                                  </div>
                                </td>
                                <td className="py-4 px-2">
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => openChatModal(ticket)}
                                    >
                                      <MessageSquare className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        window.open(
                                          `mailto:${ticket.email}?subject=Re: ${ticket.ticketId} - ${ticket.title}`
                                        )
                                      }
                                    >
                                      <Mail className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {filteredTickets.length === 0 && (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No tickets found matching your criteria.
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Close Tickets Fragment */}
          </>
        )}

        {/* Known Issues Tab Content - Placeholder */}
        {activeTab === "known-issues" && (
          <section className="w-full py-8 bg-gray-50 dark:bg-[#232838]">
            <div className="container px-4 md:px-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Known Issues ({knownIssues.length})
                </h2>
                <Button
                  onClick={() => {
                    setEditingKnownIssue(null);
                    setKnownIssueForm({
                      title: "",
                      description: "",
                      status: "investigating",
                      priority: "medium",
                      category: "",
                      estimatedFix: "",
                      workaround: "",
                    });
                    setShowKnownIssueModal(true);
                  }}
                  className="flex items-center gap-2 bg-maroon hover:bg-[#3A1520] text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add Issue
                </Button>
              </div>

              {knownIssues.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No known issues found.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-2 font-medium">
                          Title
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Category
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Priority
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Status
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Created
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Updated
                        </th>
                        <th className="text-left py-3 px-2 font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {knownIssues.map((issue) => (
                        <tr
                          key={issue.id}
                          className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                        >
                          <td className="py-3 px-2">{issue.title}</td>
                          <td className="py-3 px-2">{issue.category}</td>
                          <td className="py-3 px-2">
                            <Badge
                              className={`${priorityColors[issue.priority]} text-xs`}
                            >
                              {issue.priority}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              className={`${knownIssueStatusColors[issue.status]} text-xs`}
                            >
                              {knownIssueStatusLabels[issue.status]}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-xs">
                            {formatDate(issue.createdAt)}
                          </td>
                          <td className="py-3 px-2 text-xs">
                            {formatDate(issue.updatedAt)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditKnownIssue(issue)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteKnownIssue(issue.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Known Issue Modal */}
        {showKnownIssueModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2a3349] rounded-lg shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {editingKnownIssue ? "Edit Known Issue" : "Add Known Issue"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowKnownIssueModal(false);
                    setEditingKnownIssue(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>

              <div className="p-6">
                <form onSubmit={handleKnownIssueSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="ki-title">Title</Label>
                    <Input
                      id="ki-title"
                      value={knownIssueForm.title}
                      onChange={(e) =>
                        setKnownIssueForm({
                          ...knownIssueForm,
                          title: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ki-description">Description</Label>
                    <textarea
                      id="ki-description"
                      value={knownIssueForm.description}
                      onChange={(e) =>
                        setKnownIssueForm({
                          ...knownIssueForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1a1f2c] dark:text-white"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="ki-category">Category</Label>
                      <Input
                        id="ki-category"
                        value={knownIssueForm.category}
                        onChange={(e) =>
                          setKnownIssueForm({
                            ...knownIssueForm,
                            category: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="ki-priority">Priority</Label>
                      <select
                        id="ki-priority"
                        value={knownIssueForm.priority}
                        onChange={(e) =>
                          setKnownIssueForm({
                            ...knownIssueForm,
                            priority: e.target.value as KnownIssue["priority"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="ki-status">Status</Label>
                      <select
                        id="ki-status"
                        value={knownIssueForm.status}
                        onChange={(e) =>
                          setKnownIssueForm({
                            ...knownIssueForm,
                            status: e.target.value as KnownIssue["status"],
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="investigating">Investigating</option>
                        <option value="fix_planned">Fix Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="testing">Testing</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="ki-estimated-fix">Estimated Fix</Label>
                      <Input
                        id="ki-estimated-fix"
                        value={knownIssueForm.estimatedFix}
                        onChange={(e) =>
                          setKnownIssueForm({
                            ...knownIssueForm,
                            estimatedFix: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="ki-workaround">Workaround (optional)</Label>
                    <textarea
                      id="ki-workaround"
                      value={knownIssueForm.workaround}
                      onChange={(e) =>
                        setKnownIssueForm({
                          ...knownIssueForm,
                          workaround: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1a1f2c] dark:text-white"
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmittingKnownIssue}
                      className="bg-maroon hover:bg-[#3A1520] text-white"
                    >
                      {isSubmittingKnownIssue
                        ? "Saving..."
                        : editingKnownIssue
                          ? "Update Issue"
                          : "Create Issue"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowKnownIssueModal(false);
                        setEditingKnownIssue(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Chat Modal */}
        {showChatModal && selectedTicket && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2a3349] rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[85vh] flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedTicket.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedTicket.ticketId} • {selectedTicket.title}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✅ Gmail API integration ready! Click "Check Gmail" to
                      automatically import email replies.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowChatModal(false);
                    setSelectedTicket(null);
                    setReplyMessage("");
                    setConversation([]);
                    setReplyAsUser(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingConversation ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                  </div>
                ) : (
                  conversation.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          message.isAdmin
                            ? "bg-maroon text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-70">
                            {message.senderName}
                          </span>
                          <span
                            className="text-xs opacity-50 cursor-help"
                            title={formatDate(message.createdAt)}
                          >
                            {formatMessageDate(message.createdAt)}
                          </span>
                          {message.addedVia === "email_webhook" && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              📧 Email
                            </span>
                          )}
                          {message.addedVia === "gmail_api" && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              📬 Gmail
                            </span>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="mb-2">
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={replyAsUser}
                          onChange={(e) => setReplyAsUser(e.target.checked)}
                          className="rounded"
                        />
                        Reply as user (for adding email replies)
                      </label>
                    </div>
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleReply();
                        }
                      }}
                      placeholder={
                        replyAsUser
                          ? "Paste user's email reply here..."
                          : "Type your response... (Press Enter to send, Shift+Enter for new line)"
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#1a1f2c] dark:text-white resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleReply}
                      disabled={sendingReply || !replyMessage.trim()}
                      className={`${replyAsUser ? "bg-blue-600 hover:bg-blue-700" : "bg-maroon hover:bg-[#3A1520]"} text-white`}
                    >
                      {sendingReply ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowChatModal(false);
                        setSelectedTicket(null);
                        setReplyMessage("");
                        setConversation([]);
                        setReplyAsUser(false);
                      }}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminSupportTickets;
