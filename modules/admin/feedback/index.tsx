"use client";

import { useState, useEffect, createElement } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Star,
  Calendar,
  Search,
  RefreshCw,
  Mail,
  LogOut,
  User,
  TrendingUp,
  Heart,
  Bug,
  Lightbulb,
  MessageCircle,
} from "lucide-react";

interface Feedback {
  id: string;
  feedbackId: string;
  name: string;
  email: string;
  feedbackType: "general" | "feature" | "bug" | "improvement" | "compliment";
  rating: number;
  title: string;
  message: string;
  status: "received" | "reviewed" | "responded";
  createdAt: any;
  updatedAt: any;
}

const typeColors = {
  general: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  feature: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  bug: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  improvement:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  compliment:
    "bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400",
};

const typeIcons = {
  general: MessageCircle,
  feature: Lightbulb,
  bug: Bug,
  improvement: TrendingUp,
  compliment: Heart,
};

const statusColors = {
  received: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  reviewed:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  responded:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
};

const AdminFeedback = () => {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("admin_session");
    if (!adminSession) {
      router.push("/feedback");
      return;
    }

    fetchFeedback();
  }, [router]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/feedback");
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else {
        console.error("Failed to fetch feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_session");
    router.push("/feedback");
  };

  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.feedbackId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || item.feedbackType === filterType;
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesRating =
      filterRating === "all" || item.rating.toString() === filterRating;

    return matchesSearch && matchesType && matchesStatus && matchesRating;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, item) => acc + item.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  const openDetailModal = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col">
      <main className="flex-1">
        {/* Header */}
        <section className="w-full py-8 bg-gradient-to-br from-maroon to-maroon-dark dark:from-[#1a1f2c] dark:to-[#2a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between flex-wrap space-y-3 md:space-y-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Feedback Dashboard
                </h1>
                <p className="text-gray-200">
                  Manage and analyze user feedback
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={fetchFeedback}
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="w-full py-8 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-5">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Total Feedback
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {feedback.length}
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
                        Avg Rating
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {getAverageRating()}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-full">
                      <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Bug Reports
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {
                          feedback.filter((f) => f.feedbackType === "bug")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                      <Bug className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Features
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {
                          feedback.filter((f) => f.feedbackType === "feature")
                            .length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                      <Lightbulb className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Compliments
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {
                          feedback.filter(
                            (f) => f.feedbackType === "compliment"
                          ).length
                        }
                      </p>
                    </div>
                    <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-full">
                      <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="w-full py-6 bg-white dark:bg-[#1a1f2c]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 border rounded-md"
                  />
                </div>
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#2a3349] dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="feature">Feature Request</option>
                <option value="bug">Bug Report</option>
                <option value="improvement">Improvement</option>
                <option value="compliment">Compliment</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#2a3349] dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="received">Received</option>
                <option value="reviewed">Reviewed</option>
                <option value="responded">Responded</option>
              </select>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-[#2a3349] dark:text-white"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </section>

        {/* Feedback Table */}
        <section className="w-full py-8 bg-gray-50 dark:bg-[#232838]">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Feedback ({filteredFeedback.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon"></div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                            ID
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                            User
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                            Type
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                            Title
                          </th>
                          <th className="text-left py-3 px-2 font-medium text-gray-900 dark:text-white">
                            Rating
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
                        {filteredFeedback.map((item) => {
                          const TypeIcon = typeIcons[item.feedbackType];
                          return (
                            <tr
                              key={item.id}
                              className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/20"
                            >
                              <td className="py-4 px-2">
                                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                  {item.feedbackId}
                                </code>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {item.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-2">
                                  <TypeIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                  <Badge
                                    className={`${typeColors[item.feedbackType]} text-xs`}
                                  >
                                    {item.feedbackType}
                                  </Badge>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {item.title}
                                </p>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-1">
                                  {getRatingStars(item.rating)}
                                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                    ({item.rating})
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <Badge
                                  className={`${statusColors[item.status]} text-xs`}
                                >
                                  {item.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(item.createdAt)}
                                </div>
                              </td>
                              <td className="py-4 px-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openDetailModal(item)}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      window.open(
                                        `mailto:${item.email}?subject=Re: ${item.feedbackId} - ${item.title}`
                                      )
                                    }
                                  >
                                    <Mail className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {filteredFeedback.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No feedback found matching your criteria.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Detail Modal */}
        {showDetailModal && selectedFeedback && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#2a3349] rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedFeedback.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedFeedback.feedbackId}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Title
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedFeedback.title}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Type
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        {createElement(
                          typeIcons[selectedFeedback.feedbackType],
                          { className: "h-4 w-4" }
                        )}
                        <Badge
                          className={typeColors[selectedFeedback.feedbackType]}
                        >
                          {selectedFeedback.feedbackType}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Rating
                      </label>
                      <div className="flex items-center gap-1 mt-1">
                        {getRatingStars(selectedFeedback.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          ({selectedFeedback.rating}/5)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Message
                    </label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      {selectedFeedback.message}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {selectedFeedback.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Created
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedFeedback.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() =>
                      window.open(
                        `mailto:${selectedFeedback.email}?subject=Re: ${selectedFeedback.feedbackId} - ${selectedFeedback.title}`
                      )
                    }
                    className="bg-maroon hover:bg-[#3A1520] text-white"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
export default AdminFeedback;
