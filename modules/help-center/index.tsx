"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Search,
  Book,
  Users,
  Music,
  Settings,
  MessageSquare,
  Mail,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    id: "1",
    question: "How do I create an account on ThaiTune?",
    answer:
      "To create an account, click the 'Sign Up' button in the top right corner of the homepage. Fill in your name, email address, and create a secure password. You'll receive a verification email to confirm your account.",
    category: "account",
  },
  {
    id: "2",
    question: "How do I upload traditional Thai music scores?",
    answer:
      "Once logged in, click on 'New Score' in the navigation menu. You can upload music files in various formats (PDF, MusicXML, MIDI) or use our built-in editor to create scores. Make sure to add proper metadata including title, composer, and cultural context.",
    category: "music",
  },
  {
    id: "3",
    question: "Is ThaiTune free to use?",
    answer:
      "Yes, ThaiTune is completely free to use. Our mission is to preserve and share traditional Thai music with the world, making it accessible to everyone regardless of their financial situation.",
    category: "account",
  },
  {
    id: "4",
    question: "How do I search for specific Thai songs?",
    answer:
      "Use the search bar at the top of the page to search by song title, composer, region, or instrument. You can also use our advanced filters to narrow down results by difficulty level, time period, or musical style.",
    category: "music",
  },
  {
    id: "5",
    question: "Can I edit my profile information?",
    answer:
      "Yes, go to Settings from the user menu to update your profile information, including your display name, bio, profile picture, and musical interests. Changes are saved automatically.",
    category: "account",
  },
  {
    id: "6",
    question: "How do I bookmark songs for later?",
    answer:
      "Click the bookmark icon on any song page to save it to your personal collection. You can access all your bookmarked songs from the 'My Bookmarks' section in your profile.",
    category: "music",
  },
  {
    id: "7",
    question: "What file formats are supported for uploads?",
    answer:
      "We support PDF files for sheet music, MusicXML for cross-platform compatibility, MIDI files for playback, and common image formats (PNG, JPG) for scanned scores. Files should be under 10MB.",
    category: "technical",
  },
  {
    id: "8",
    question: "How do I report inappropriate content?",
    answer:
      "If you encounter inappropriate content, click the 'Report' button on the content page or contact our support team directly. We review all reports within 24 hours and take appropriate action.",
    category: "community",
  },
  {
    id: "9",
    question: "Can I collaborate with other users?",
    answer:
      "Yes! ThaiTune encourages collaboration. You can comment on scores, suggest improvements, and share your knowledge with the community. We're working on more advanced collaboration features.",
    category: "community",
  },
  {
    id: "10",
    question: "How do I reset my password?",
    answer:
      "Click 'Forgot Password' on the login page and enter your email address. You'll receive a reset link within a few minutes. If you don't see the email, check your spam folder.",
    category: "account",
  },
];

const HelpCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { id: "all", name: "All Categories", icon: Book },
    { id: "account", name: "Account & Profile", icon: Users },
    { id: "music", name: "Music & Scores", icon: Music },
    { id: "technical", name: "Technical Support", icon: Settings },
    { id: "community", name: "Community", icon: MessageSquare },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-maroon/10 to-maroon-dark/10 dark:from-maroon/20 dark:to-maroon-dark/20"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                  <HelpCircle className="w-12 h-12 text-maroon dark:text-maroon-lite" />
                </div>
              </div>
              <h1 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-maroon to-maroon-dark bg-clip-text text-transparent dark:from-maroon-lite dark:to-[#f5c7d1]">
                Help Center
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
                Find answers to common questions and get support for using
                ThaiTune
              </p>

              {/* Search Bar */}
              <div className="max-w-4xl mx-auto">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-maroon/20 to-maroon-dark/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-500 group-hover:text-maroon dark:group-hover:text-maroon-lite transition-colors duration-200 z-10" />
                    <Input
                      placeholder="Search for help articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={loading}
                      className="w-full pl-16 pr-14 py-3 md:py-5 text-base md:text-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-gray-200/60 dark:border-gray-600/60 rounded-2xl focus:border-maroon dark:focus:border-maroon-lite focus:ring-4 focus:ring-maroon/10 dark:focus:ring-maroon-lite/10 shadow-xl hover:shadow-2xl transition-all duration-300 placeholder:text-gray-500 dark:placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 z-10"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Counter */}
                {searchTerm && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {filteredFAQs.length} result
                      {filteredFAQs.length !== 1 ? "s" : ""} found for "
                      {searchTerm}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-16 max-w-7xl">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-6">
                <h3 className="text-lg font-semibold text-maroon dark:text-maroon-lite mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {loading ? (
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center p-3 rounded-lg"
                        >
                          <Skeleton className="w-5 h-5 mr-3 rounded" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                            selectedCategory === category.id
                              ? "bg-maroon text-white dark:bg-maroon-lite dark:text-gray-900"
                              : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Icon className="w-5 h-5 mr-3" />
                          {category.name}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-maroon dark:text-maroon-lite mb-2">
                    Frequently Asked Questions
                  </h2>
                  <div className="text-gray-600 dark:text-gray-300">
                    {loading ? (
                      <Skeleton className="h-4 w-32" />
                    ) : (
                      `${filteredFAQs.length} question${filteredFAQs.length !== 1 ? "s" : ""} found`
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  {loading ? (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-5 w-80" />
                              <Skeleton className="h-5 w-5 rounded" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {filteredFAQs.map((faq) => (
                        <div
                          key={faq.id}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <button
                            onClick={() => toggleFAQ(faq.id)}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            <span className="font-medium text-gray-900 dark:text-white pr-4">
                              {faq.question}
                            </span>
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {expandedFAQ === faq.id && (
                            <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}

                      {filteredFAQs.length === 0 && !loading && (
                        <div className="text-center py-12">
                          <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            No results found
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Try adjusting your search terms or browse different
                            categories
                          </p>
                          <Button
                            onClick={() => {
                              setSearchTerm("");
                              setSelectedCategory("all");
                            }}
                            variant="outline"
                            className="text-maroon border-maroon hover:bg-maroon hover:text-white dark:text-maroon-lite dark:border-maroon-lite"
                          >
                            Clear filters
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Support Contact Section */}
          <div className="mt-16">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-maroon dark:text-maroon-lite mb-4">
                  Still Need Help?
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Can't find what you're looking for? Our support team is here
                  to help you.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {loading ? (
                  <>
                    {[...Array(2)].map((_, i) => (
                      <Card
                        key={i}
                        className="border-2 border-gray-200 dark:border-gray-700"
                      >
                        <CardHeader className="text-center">
                          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
                          <Skeleton className="h-6 w-28 mx-auto" />
                        </CardHeader>
                        <CardContent className="text-center">
                          <Skeleton className="h-4 w-40 mx-auto mb-4" />
                          <Skeleton className="h-10 w-24 mx-auto mb-3" />
                          <Skeleton className="h-4 w-36 mx-auto" />
                        </CardContent>
                      </Card>
                    ))}
                  </>
                ) : (
                  <>
                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-maroon dark:hover:border-maroon-lite transition-colors">
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 bg-maroon dark:bg-maroon-lite rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-6 h-6 text-white dark:text-gray-900" />
                        </div>
                        <CardTitle className="text-maroon dark:text-maroon-lite">
                          Email Support
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Get detailed help via email
                        </p>
                        <Button
                          onClick={() =>
                            window.open("mailto:support@thaitune.com")
                          }
                          variant="outline"
                          className="text-maroon border-maroon hover:bg-maroon hover:text-white dark:text-maroon-lite dark:border-maroon-lite"
                        >
                          Email Us
                        </Button>
                        <div className="flex items-center justify-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          Response within 24 hours
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-200 dark:border-gray-700 hover:border-maroon dark:hover:border-maroon-lite transition-colors">
                      <CardHeader className="text-center">
                        <div className="w-12 h-12 bg-maroon dark:bg-maroon-lite rounded-full flex items-center justify-center mx-auto mb-4">
                          <MessageSquare className="w-6 h-6 text-white dark:text-gray-900" />
                        </div>
                        <CardTitle className="text-maroon dark:text-maroon-lite">
                          Report an Issue
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Report bugs or technical issues
                        </p>
                        <Button
                          onClick={() =>
                            (window.location.href = "/report-issue")
                          }
                          variant="outline"
                          className="text-maroon border-maroon hover:bg-maroon hover:text-white dark:text-maroon-lite dark:border-maroon-lite"
                        >
                          Report Issue
                        </Button>
                        <div className="flex items-center justify-center mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          Tracked and resolved
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
