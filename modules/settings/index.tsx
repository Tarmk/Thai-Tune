"use client";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Camera,
  ImageIcon,
  Mail,
  Save,
  Eye,
  EyeOff,
  SettingsIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

const settingsSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters.")
    .max(50, "Display name must be at most 50 characters."),
  bio: z.string().max(160, "Bio must be at most 160 characters.").optional(),
  roles: z.string().optional(),
  profilePictureUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const Settings = () => {
  const { user: authUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: "",
      bio: "",
      roles: "",
      profilePictureUrl: "",
      coverImageUrl: "",
    },
  });

  useEffect(() => {
    if (authUser) {
      const fetchUserData = async () => {
        setIsLoading(true);
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, "users", authUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            reset({
              displayName: userData.displayName || authUser.displayName || "",
              bio: userData.bio || "",
              roles: Array.isArray(userData.roles)
                ? userData.roles.join(", ")
                : userData.roles || "",
              profilePictureUrl: userData.profilePictureUrl || "",
              coverImageUrl: userData.coverImageUrl || "",
            });
            if (userData.profilePictureUrl)
              setProfilePicPreview(userData.profilePictureUrl);
            if (userData.coverImageUrl)
              setCoverImagePreview(userData.coverImageUrl);
          } else {
            reset({
              displayName: authUser.displayName || "",
              bio: "",
              roles: "",
              profilePictureUrl: "",
              coverImageUrl: "",
            });
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    } else {
      setIsLoading(false);
    }
  }, [authUser, reset]);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover"
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      if (type === "profile") {
        setProfilePicFile(file);
        setProfilePicPreview(previewUrl);
      } else {
        setCoverImageFile(file);
        setCoverImagePreview(previewUrl);
      }
    }
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const onSubmit = async (data: SettingsFormValues) => {
    if (!authUser) {
      console.error("No authenticated user");
      return;
    }

    setSaving(true);

    try {
      const updateData: any = {
        displayName: data.displayName || "",
        bio: data.bio || "",
      };

      if (data.roles) {
        updateData.roles = data.roles
          .split(",")
          .map((role: string) => role.trim())
          .filter((role: string) => role.length > 0);
      } else {
        updateData.roles = [];
      }

      if (profilePicFile) {
        const profileUrl = await uploadImage(
          profilePicFile,
          `users/${authUser.uid}/profile-picture`
        );
        updateData.profilePictureUrl = profileUrl;
      }

      if (coverImageFile) {
        const coverUrl = await uploadImage(
          coverImageFile,
          `users/${authUser.uid}/cover-image`
        );
        updateData.coverImageUrl = coverUrl;
      }

      const userDocRef = doc(db, "users", authUser.uid);
      await updateDoc(userDocRef, updateData);

      setProfilePicFile(null);
      setCoverImageFile(null);

      toast({
        title: "Success!",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewProfile = () => {
    if (authUser) {
      router.push(`/user/${authUser.uid}`);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="flex-1 pb-8">
          {/* Header Skeleton */}
          <section className="w-full py-20 bg-gradient-to-r from-maroon via-maroon-dark to-[#8A3D4C] dark:from-[#1a1f2c] dark:via-[#2a1f2c] dark:to-[#3a2f3c] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container px-4 md:px-6 max-w-4xl mx-auto relative text-center">
              <div className="animate-pulse">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
                  <div className="w-8 h-8 bg-white/30 rounded"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-12 bg-white/20 rounded-lg w-80 mx-auto"></div>
                  <div className="h-6 bg-white/15 rounded-lg w-96 mx-auto"></div>
                  <div className="flex justify-center gap-4 mt-8">
                    <div className="h-12 bg-white/20 rounded-lg w-24"></div>
                    <div className="h-12 bg-white/20 rounded-lg w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Settings Form Skeleton */}
          <section className="w-full py-20 bg-white dark:bg-gray-900 relative">
            <div className="container px-4 md:px-6 max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Card Header Skeleton */}
                  <div className="text-center p-8 border-b border-gray-200 dark:border-gray-700">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-6">
                      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-48 mx-auto mb-2"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto"></div>
                  </div>

                  {/* Card Content Skeleton */}
                  <div className="p-8 space-y-8">
                    {/* Profile Information Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-56"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      </div>
                    </div>

                    {/* Profile Picture Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-30 h-30 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-72"></div>
                        </div>
                      </div>
                    </div>

                    {/* Cover Image Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-60"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-80"></div>
                      </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-68"></div>
                      </div>

                      <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="flex-1 pb-8">
        {/* Header */}
        <section className="w-full py-20 bg-gradient-to-r from-maroon via-maroon-dark to-[#8A3D4C] dark:from-[#1a1f2c] dark:via-[#2a1f2c] dark:to-[#3a2f3c] relative overflow-hidden">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto relative">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                  <SettingsIcon className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                Account
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-yellow-200">
                  Settings
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                Manage your account and profile settings to personalize your
                ThaiTune experience
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex justify-center gap-4 flex-wrap"
              >
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleViewProfile}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  onClick={() => router.push("/settings/hidden-scores")}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hidden Scores
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Settings Form */}
        <section className="w-full py-20 bg-white dark:bg-gray-900 relative">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardHeader className="text-center pb-8">
                  <motion.div variants={fadeInUp}>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-maroon to-maroon-dark rounded-2xl mb-6">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-maroon dark:text-maroon-lite mb-2">
                      Profile Settings
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      Update your profile information and preferences
                    </p>
                  </motion.div>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Profile Information */}
                    <motion.div variants={fadeInUp} className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Profile Information
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Update your basic profile information
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="displayName"
                            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                          >
                            <User className="h-4 w-4" />
                            Display Name *
                          </Label>
                          <Controller
                            name="displayName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="displayName"
                                {...field}
                                className="h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                                placeholder="Enter your display name"
                              />
                            )}
                          />
                          {errors.displayName && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              {errors.displayName.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="roles"
                            className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"
                          >
                            <SettingsIcon className="h-4 w-4" />
                            Roles
                          </Label>
                          <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                              <Input
                                id="roles"
                                {...field}
                                className="h-12 px-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300"
                                placeholder="Admin, Composer, User"
                              />
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="bio"
                          className="text-gray-700 dark:text-gray-300 font-medium"
                        >
                          Bio
                        </Label>
                        <Controller
                          name="bio"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              id="bio"
                              {...field}
                              rows={4}
                              className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-maroon dark:focus:border-maroon-lite focus:outline-none transition-all duration-300 resize-none"
                              placeholder="Tell us about yourself..."
                            />
                          )}
                        />
                        {errors.bio && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            {errors.bio.message}
                          </p>
                        )}
                      </div>
                    </motion.div>

                    {/* Profile Picture */}
                    <motion.div variants={fadeInUp} className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Profile Picture
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Upload a profile picture to help others recognize you
                        </p>
                      </div>

                      <div className="flex items-center flex-wrap gap-6">
                        <div className="flex-shrink-0">
                          {profilePicPreview ? (
                            <div className="relative">
                              <Image
                                src={profilePicPreview}
                                alt="Profile preview"
                                width={120}
                                height={120}
                                className="rounded-full w-30 h-30 object-cover border-4 border-gray-200 dark:border-gray-600"
                              />
                              <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                <Camera className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-all duration-300" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-30 h-30 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-4 border-gray-200 dark:border-gray-600">
                              <User className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document
                                  .getElementById("profilePictureUrl")
                                  ?.click()
                              }
                              className="h-12 px-6 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Choose File
                            </Button>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {profilePicFile
                                ? profilePicFile.name
                                : "No file chosen"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Recommended: Square image, at least 400x400 pixels
                          </p>
                          <Input
                            id="profilePictureUrl"
                            type="file"
                            onChange={(e) => handleFileChange(e, "profile")}
                            className="hidden"
                            accept="image/*"
                          />
                        </div>
                      </div>
                    </motion.div>

                    {/* Cover Image */}
                    <motion.div variants={fadeInUp} className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Cover Image
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Upload a cover image for your profile header
                        </p>
                      </div>

                      <div className="space-y-4">
                        {coverImagePreview && (
                          <div className="relative">
                            <Image
                              src={coverImagePreview}
                              alt="Cover preview"
                              width={600}
                              height={200}
                              className="rounded-lg w-full h-48 object-cover border-2 border-gray-200 dark:border-gray-600"
                            />
                            <div className="absolute inset-0 rounded-lg bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-white opacity-0 hover:opacity-100 transition-all duration-300" />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("coverImageUrl")?.click()
                            }
                            className="h-12 px-6 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all duration-300"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Choose File
                          </Button>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {coverImageFile
                              ? coverImageFile.name
                              : "No file chosen"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Recommended: 1200x400 pixels, landscape orientation
                        </p>
                        <Input
                          id="coverImageUrl"
                          type="file"
                          onChange={(e) => handleFileChange(e, "cover")}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </motion.div>

                    {/* Account Information */}
                    <motion.div variants={fadeInUp} className="space-y-6">
                      <div className="pb-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          Account Information
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Your account details and contact information
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Address
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {authUser?.email || "Not set"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      variants={fadeInUp}
                      className="pt-6 border-t border-gray-200 dark:border-gray-700"
                    >
                      <Button
                        type="submit"
                        disabled={saving}
                        className="w-full h-14 bg-maroon hover:bg-[#3A1520] text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Saving Changes...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Save className="h-5 w-5" />
                            <span>Save Changes</span>
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};
export default Settings;
