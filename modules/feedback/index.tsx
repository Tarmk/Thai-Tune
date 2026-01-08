"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Lock,
  Send,
  MessageSquare,
  Star,
  CheckCircle,
  Mail,
  User,
  FileText,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const Feedback = () => {
  const router = useRouter();
  const { t } = useTranslation("feedback");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "general",
    rating: 5,
    title: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/submit-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          feedbackType: "general",
          rating: 5,
          title: "",
          message: "",
        });
      } else {
        console.error("Failed to submit feedback");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminLogin = () => {
    if (adminPassword === "admin123") {
      localStorage.setItem("admin_session", "true");
      router.push("/admin/feedback");
    } else {
      alert(t("invalidPassword"));
    }
  };

  const handleStarClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const feedbackTypes = [
    { value: "general", label: t("feedbackTypes.general"), icon: "💬" },
    { value: "feature", label: t("feedbackTypes.feature"), icon: "🚀" },
    { value: "bug", label: t("feedbackTypes.bug"), icon: "🐛" },
    { value: "improvement", label: t("feedbackTypes.improvement"), icon: "💡" },
    { value: "compliment", label: t("feedbackTypes.compliment"), icon: "❤️" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <main className="flex-1">
        <section className="w-full py-20 bg-gradient-to-r from-maroon via-maroon-dark to-[#8A3D4C] dark:from-[#1a1f2c] dark:via-[#2a1f2c] dark:to-[#3a2f3c] relative overflow-hidden">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                {t("pageTitle")}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                {t("pageSubtitle")}
              </motion.p>

              {/* Admin Access Button */}
              <motion.div
                variants={fadeInUp}
                className="flex justify-center mb-4"
              >
                <Button
                  onClick={() => setShowAdminLogin(!showAdminLogin)}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {t("adminAccess")}
                </Button>
              </motion.div>

              {/* Admin Login Modal */}
              {showAdminLogin && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setShowAdminLogin(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md overflow-hidden border-0 shadow-2xl bg-white dark:bg-gray-800 rounded-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="h-2 bg-gradient-to-r from-maroon to-maroon-dark" />

                    <div className="p-8">
                      <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-maroon to-maroon-dark rounded-full">
                          <Lock className="h-8 w-8 text-white" />
                        </div>
                      </div>

                      <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {t("adminLogin")}
                      </h2>
                      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                        {t("enterPassword")}
                      </p>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t("password")}
                          </label>
                          <Input
                            type="password"
                            placeholder={t("enterPassword")}
                            value={adminPassword}
                            onChange={(e) => setAdminPassword(e.target.value)}
                            className="h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleAdminLogin()
                            }
                          />
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={() => setShowAdminLogin(false)}
                            variant="outline"
                            className="flex-1 h-12 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300"
                          >
                            {t("cancel")}
                          </Button>
                          <Button
                            onClick={handleAdminLogin}
                            className="flex-1 h-12 bg-maroon hover:bg-[#3A1520] text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                          >
                            <div className="flex items-center gap-2">
                              <Lock className="h-4 w-4" />
                              {t("accessPanel")}
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Feedback Form */}
        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <Card className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 shadow-xl">
                  <CardContent className="p-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-green-800 dark:text-green-200 mb-4">
                      {t("thankYou")}
                    </h2>
                    <p className="text-lg text-green-700 dark:text-green-300 mb-8 max-w-md mx-auto">
                      {t("feedbackReceived")}
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {t("submitAnother")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardHeader className="text-center pb-8">
                    <motion.div variants={fadeInUp}>
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-maroon to-maroon-dark rounded-2xl mb-6">
                        <MessageSquare className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-3xl font-bold text-maroon dark:text-maroon-lite mb-2">
                        {t("shareYourFeedback")}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        {t("thoughtsHelp")}
                      </p>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Name and Email */}
                      <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <Label
                            htmlFor="name"
                            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            {t("fullName")} *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                            placeholder={t("enterFullName")}
                          />
                        </div>
                        <div className="space-y-2 flex-1">
                          <Label
                            htmlFor="email"
                            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4" />
                            {t("emailAddress")} *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                            placeholder={t("enterEmail")}
                          />
                        </div>
                      </motion.div>

                      {/* Feedback Type and Rating */}
                      <motion.div
                        variants={fadeInUp}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <Label
                            htmlFor="feedbackType"
                            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                          >
                            <FileText className="h-4 w-4" />
                            {t("feedbackType")}
                          </Label>
                          <div className="relative">
                            <select
                              id="feedbackType"
                              name="feedbackType"
                              value={formData.feedbackType}
                              onChange={handleInputChange}
                              className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300 appearance-none"
                            >
                              {feedbackTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <Label className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            {t("rating")}
                          </Label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 h-12">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleStarClick(star)}
                                  onMouseEnter={() => setHoveredStar(star)}
                                  onMouseLeave={() => setHoveredStar(0)}
                                  className="transition-all duration-200 transform hover:scale-110"
                                >
                                  <Star
                                    className={`h-6 w-6 transition-all duration-200 ${
                                      star <= (hoveredStar || formData.rating)
                                        ? "text-yellow-400 fill-current drop-shadow-sm"
                                        : "text-gray-300 dark:text-gray-500"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                              {formData.rating}/5
                            </span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Title */}
                      <motion.div
                        variants={fadeInUp}
                        className="w-full space-y-2"
                      >
                        <Label
                          htmlFor="title"
                          className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {t("title")} *
                        </Label>
                        <Input
                          id="title"
                          name="title"
                          type="text"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                          placeholder={t("titlePlaceholder")}
                        />
                      </motion.div>

                      {/* Message */}
                      <motion.div
                        variants={fadeInUp}
                        className="w-full space-y-2"
                      >
                        <Label
                          htmlFor="message"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          {t("yourMessage")} *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300 resize-none"
                          placeholder={t("messagePlaceholder")}
                        />
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div variants={fadeInUp} className="pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-14 bg-maroon hover:bg-[#3A1520] text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-3">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>{t("submittingFeedback")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <Send className="h-5 w-5" />
                              <span>{t("submitFeedback")}</span>
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default Feedback;
