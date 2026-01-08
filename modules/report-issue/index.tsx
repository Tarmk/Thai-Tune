"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Bug,
  MessageSquare,
  Zap,
  Send,
  Shield,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

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

function KnownIssuesSection() {
  const { theme } = useTheme();
  const [knownIssues, setKnownIssues] = useState<KnownIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchKnownIssues();
  }, []);

  const fetchKnownIssues = async () => {
    try {
      const response = await fetch("/api/known-issues");
      if (response.ok) {
        const data = await response.json();
        setKnownIssues(data.issues);
      }
    } catch (error) {
      console.error("Error fetching known issues:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    investigating:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    fix_planned:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    in_progress:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    testing:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  };

  const statusLabels = {
    investigating: "Investigating",
    fix_planned: "Fix Planned",
    in_progress: "In Progress",
    testing: "Testing",
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };

  if (loading) {
    return (
      <section className="w-full py-16 bg-gray-50 dark:bg-[#232838]">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Known Issues
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Loading known issues...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (knownIssues.length === 0) {
    return null; // Don't show section if no known issues
  }

  const displayedIssues = showAll ? knownIssues : knownIssues.slice(0, 3);

  return (
    <section className="w-full py-16 bg-gray-50 dark:bg-[#232838]">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Known Issues
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Before reporting, check if your issue is already being addressed
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedIssues.map((issue) => (
            <Card
              key={issue.id}
              className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-shadow"
            >
              <div
                className="h-2"
                style={{
                  background: `linear-gradient(to right, ${theme === "dark" ? "#8A3D4C" : "#4A1D2C"}, ${theme === "dark" ? "#af5169" : "#6A2D3C"})`,
                }}
              />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[issue.status]}`}
                    >
                      {statusLabels[issue.status]}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium capitalize ${priorityColors[issue.priority]}`}
                    >
                      {issue.priority}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {issue.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                  {issue.description}
                </p>

                {issue.workaround && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-400 mb-1">
                      Workaround:
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      {issue.workaround}
                    </p>
                  </div>
                )}

                {issue.estimatedFix && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4 mr-1" />
                    Est. fix: {issue.estimatedFix}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {knownIssues.length > 3 && (
          <div className="text-center mt-8">
            <Button
              onClick={() => setShowAll(!showAll)}
              variant="outline"
              className="border-maroon text-maroon hover:bg-maroon hover:text-white dark:border-[#8A3D4C] dark:text-maroon-lite dark:hover:bg-[#8A3D4C] dark:hover:text-white"
            >
              {showAll ? "Show Less" : `Show All ${knownIssues.length} Issues`}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

const ReportIssue = () => {
  const { t } = useTranslation("common");
  const { theme } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    issueType: "bug",
    title: "",
    description: "",
    steps: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        setIsSubmitted(false);
      }, 5000); // Hide success message after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Submit to API endpoint
      const response = await fetch("/api/submit-ticket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit ticket");
      }

      console.log("Ticket created successfully:", result);

      // Show success message
      setIsSubmitted(true);

      // Reset form after successful submission
      setFormData({
        name: "",
        email: "",
        issueType: "bug",
        title: "",
        description: "",
        steps: "",
        priority: "medium",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      // You can add error handling here - for now just log
      alert("Error submitting ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminAccess = async () => {
    if (!adminPassword.trim()) {
      setAdminError("Please enter password");
      return;
    }

    setIsAdminLoading(true);
    setAdminError("");

    try {
      // Simple password check - in production, this would be more secure
      if (adminPassword === "admin123") {
        // Set admin session
        localStorage.setItem("admin_session", "true");
        router.push("/admin/support-tickets");
      } else {
        setAdminError("Invalid password");
      }
    } catch (error) {
      setAdminError("Error accessing admin panel");
    } finally {
      setIsAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 bg-gradient-to-br from-maroon to-maroon-dark dark:from-[#1a1f2c] dark:to-[#2a1f2c] relative">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Bug className="h-8 w-8 text-white" />
            </div>
            <h1 className="md:text-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Report an Issue
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Help us improve ThaiTune by reporting bugs, issues, or suggesting
              improvements. Your feedback is valuable to us.
            </p>
          </div>

          {/* Admin Access Button */}
          <div className="absolute top-4 right-4">
            <Button
              onClick={() => setShowAdminModal(true)}
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Shield className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
        </section>

        {/* Admin Modal */}
        {showAdminModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2a3349] p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Admin Access
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdminModal(false);
                    setAdminPassword("");
                    setAdminError("");
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ×
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="admin-password"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Enter admin password
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="admin-password"
                      type={showPassword ? "text" : "password"}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAdminAccess()
                      }
                      placeholder="Enter password"
                      className="p-1.5 rounded-md ring-1 ring-maroon"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {adminError && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      {adminError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAdminAccess}
                    disabled={isAdminLoading}
                    className="flex-1"
                  >
                    {isAdminLoading ? "Checking..." : "Access Admin Panel"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAdminModal(false);
                      setAdminPassword("");
                      setAdminError("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Issue Types */}
        <section className="w-full py-16 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                What type of issue are you experiencing?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Choose the category that best describes your issue
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-16">
              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-4 group-hover:scale-110 transition-transform">
                    <Bug
                      className="h-6 w-6"
                      style={{
                        color: theme === "dark" ? "#e5a3b4" : "#4A1D2C",
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Bug Report
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Something isn't working as expected
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-4 group-hover:scale-110 transition-transform">
                    <Zap
                      className="h-6 w-6"
                      style={{
                        color: theme === "dark" ? "#e5a3b4" : "#4A1D2C",
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Performance Issue
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    The app is slow or unresponsive
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#2a3349] shadow-lg hover:shadow-xl dark:shadow-none dark:border-none transition-shadow cursor-pointer group">
                <div className="h-1 bg-gradient-to-t from-[#4A1D2C] to-[#6A2D3C] dark:from-[#8A3D4C] dark:to-[#af5169]" />
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-[#4a1d2c1a] dark:bg-[#8a3d4c33] rounded-full flex items-center justify-center mx-auto my-4 group-hover:scale-110 transition-transform">
                    <MessageSquare
                      className="h-6 w-6"
                      style={{
                        color: theme === "dark" ? "#e5a3b4" : "#4A1D2C",
                      }}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Feature Request
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Suggest a new feature or improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Report Form */}
            <Card className="bg-white dark:bg-[#2a3349] shadow-lg dark:shadow-none dark:border-none">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Report Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Your Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="issueType"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Issue Type
                      </Label>
                      <select
                        id="issueType"
                        name="issueType"
                        value={formData.issueType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="bug">Bug Report</option>
                        <option value="performance">Performance Issue</option>
                        <option value="feature">Feature Request</option>
                        <option value="ui">UI/UX Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="priority"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Priority
                      </Label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Issue Title
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      placeholder="Brief description of the issue"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Detailed Description
                    </Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Provide a detailed description of the issue..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white resize-vertical"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="steps"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Steps to Reproduce (if applicable)
                    </Label>
                    <textarea
                      id="steps"
                      name="steps"
                      rows={3}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                      value={formData.steps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-maroon focus:border-maroon dark:bg-[#1a1f2c] dark:text-white resize-vertical"
                    />
                  </div>

                  {isSubmitted && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-green-800 dark:text-green-200 font-medium">
                            Report submitted successfully!
                          </p>
                          <p className="text-green-600 dark:text-green-300 text-sm">
                            Thank you for your feedback. We'll review your
                            report and get back to you if needed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-maroon hover:bg-[#3A1520] dark:bg-[#8A3D4C] dark:hover:bg-maroon-dark text-white py-3 px-6 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Report
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Known Issues Section */}
        <KnownIssuesSection />

        {/* Additional Info */}
        <section className="w-full py-16 bg-white dark:bg-[#1a1f2c]">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <div className="bg-blue-50 dark:bg-[#232838] rounded-lg p-6 border border-blue-200 dark:border-gray-700">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-2">
                    Before submitting your report
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Check if the issue has already been reported</li>
                    <li>
                      • Try refreshing the page or clearing your browser cache
                    </li>
                    <li>
                      • Include your browser and device information if relevant
                    </li>
                    <li>
                      • Provide screenshots if they help explain the issue
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ReportIssue;
