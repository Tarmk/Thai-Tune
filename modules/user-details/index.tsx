"use client";

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  getDoc,
  doc,
  updateDoc,
  setDoc,
  arrayUnion,
  arrayRemove,
  runTransaction,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Star,
  Music,
  Users,
  BookOpen,
  User,
  Edit,
  Settings,
  ArrowLeft,
  Mail,
  Heart,
  Music2,
  Trophy,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { FC, useEffect, useState } from "react";
import EmptyScoresCard from "./empty-scores-card";

interface UserProfile {
  displayName: string;
  bio: string;
  roles: string[];
  profilePictureUrl: string;
  coverImageUrl: string;
  createdAt: Timestamp;
  followers: string[];
  following: string[];
}

interface Score {
  id: string;
  title: string;
  rating: number;
  createdAt: Timestamp | null;
  flatid: string;
}

interface IProps {
  userId: string;
}

const UserDetails: FC<IProps> = ({ userId: id }) => {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || authLoading) return; // Wait for auth to be determined

      setLoading(true);
      try {
        const userDocRef = doc(db, "users", id);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as UserProfile;

          // One-time update for specific user's creation date
          if (
            userData.displayName === "Krittaphas Kunkhongkaphan" &&
            userData.createdAt &&
            userData.createdAt.toDate().getFullYear() !== 2022
          ) {
            const newDate = Timestamp.fromDate(new Date("2022-05-02"));
            await updateDoc(userDocRef, { createdAt: newDate });
            userData.createdAt = newDate;
          }

          // Update existing documents that have "User" as displayName for current user
          if (
            currentUser &&
            currentUser.uid === id &&
            userData.displayName === "User"
          ) {
            const realDisplayName =
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "User";
            try {
              await updateDoc(userDocRef, {
                displayName: realDisplayName,
                profilePictureUrl:
                  currentUser.photoURL || userData.profilePictureUrl,
              });
              userData.displayName = realDisplayName;
              userData.profilePictureUrl =
                currentUser.photoURL || userData.profilePictureUrl;
            } catch (error) {
              console.error("Failed to update user document:", error);
            }
          }

          setUserProfile(userData);
          setFollowersCount(userData.followers?.length || 0);
        } else {
          // User document doesn't exist
          if (currentUser && currentUser.uid === id) {
            // For the current user, create a profile with their auth info
            const defaultUserData = {
              displayName:
                currentUser.displayName ||
                currentUser.email?.split("@")[0] ||
                "User",
              bio: "",
              roles: [],
              profilePictureUrl: currentUser.photoURL || "",
              coverImageUrl: "",
              createdAt: Timestamp.now(),
              followers: [],
              following: [],
            };

            try {
              // Try to create the user document
              await setDoc(userDocRef, defaultUserData);
              setUserProfile(defaultUserData as UserProfile);
              setFollowersCount(0);
            } catch (error) {
              console.error("Failed to create user document:", error);
              // Still set a basic profile even if we can't save to Firestore
              setUserProfile(defaultUserData as UserProfile);
              setFollowersCount(0);
            }
          } else {
            // For other users, we can't get their auth info, so show error
            setUserProfile(null);
            setFollowersCount(0);
          }
        }

        const q = query(
          collection(db, "scores"),
          where("userId", "==", id),
          where("sharing", "==", "public")
        );
        const querySnapshot = await getDocs(q);
        const userScores = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.name,
            composer: data.composer,
            arrangement: data.arrangement,
            genre: data.genre,
            createdAt: data.created || null,
            rating: data.rating || 0,
            author: userProfile?.displayName || "Unknown",
            flatid: data.flatid,
          };
        }) as Score[];
        setScores(userScores);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id, currentUser, authLoading]);

  useEffect(() => {
    if (userProfile && currentUser) {
      setIsFollowing(userProfile.followers?.includes(currentUser.uid) || false);
    }
  }, [userProfile, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser || !userProfile || isUpdatingFollow) return;
    setIsUpdatingFollow(true);

    const currentUserRef = doc(db, "users", currentUser.uid);
    const targetUserRef = doc(db, "users", id);

    try {
      await runTransaction(db, async (transaction) => {
        if (isFollowing) {
          // Unfollow
          transaction.update(currentUserRef, { following: arrayRemove(id) });
          transaction.update(targetUserRef, {
            followers: arrayRemove(currentUser.uid),
          });
        } else {
          // Follow
          transaction.update(currentUserRef, { following: arrayUnion(id) });
          transaction.update(targetUserRef, {
            followers: arrayUnion(currentUser.uid),
          });
        }
      });

      setIsFollowing(!isFollowing);
      setFollowersCount((prev) => (isFollowing ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Failed to update follow status:", error);
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <main className="flex-1 pt-16 pb-8">
          {/* Header Skeleton */}
          <section className="w-full py-20 bg-gradient-to-r from-maroon via-maroon-dark to-[#8A3D4C] dark:from-[#1a1f2c] dark:via-[#2a1f2c] dark:to-[#3a2f3c] relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container px-4 md:px-6 max-w-6xl mx-auto relative text-center">
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

          {/* Profile Content Skeleton */}
          <section className="w-full py-20 bg-white dark:bg-gray-900 relative">
            <div className="container px-4 md:px-6 max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <div className="text-center mb-6">
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4"></div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto"></div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      </div>
                    </div>

                    {/* Stats Card Skeleton */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-4"></div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-8"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="space-y-4">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
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
          <div className="container px-4 md:px-6 max-w-6xl mx-auto relative">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="text-center"
            >
              <motion.div variants={fadeInUp} className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                  <User className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-2xl md:text-5xl font-bold text-white mb-6 leading-tight"
              >
                {userProfile ? (
                  <>
                    {userProfile.displayName}
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-yellow-200 text-2xl md:text-4xl mt-2">
                      Profile
                    </span>
                  </>
                ) : (
                  <>
                    User
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-yellow-200 text-2xl md:text-4xl mt-2">
                      Profile
                    </span>
                  </>
                )}
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed"
              >
                {userProfile
                  ? `Discover ${userProfile.displayName}'s musical journey and creative works in the ThaiTune community`
                  : "Explore musical profiles and creative works in the ThaiTune community"}
              </motion.p>

              <motion.div
                variants={fadeInUp}
                className="flex justify-center gap-4"
              >
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                {currentUser && currentUser.uid === id && (
                  <Button
                    onClick={() => router.push("/settings")}
                    variant="ghost"
                    className="text-white hover:bg-white/10 transition-all duration-300 border border-white/20 hover:border-white/30"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Profile Content */}
        <section className="w-full py-20 bg-white dark:bg-gray-900 relative">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            {userProfile ? (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Profile Info */}
                  <motion.div
                    variants={fadeInUp}
                    className="lg:col-span-1 space-y-6"
                  >
                    {/* Profile Card */}
                    <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <CardContent className="p-8">
                        <div className="text-center mb-6">
                          <div className="relative inline-block">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-maroon to-maroon-dark p-1 mb-4">
                              <Image
                                src={
                                  userProfile.profilePictureUrl ||
                                  "/placeholder-user.jpg"
                                }
                                alt={userProfile.displayName || "User"}
                                width={128}
                                height={128}
                                className="w-full h-full rounded-full object-cover"
                              />
                            </div>
                            {currentUser && currentUser.uid === id && (
                              <Button
                                onClick={() => router.push("/settings")}
                                size="sm"
                                className="absolute bottom-2 right-2 rounded-full p-2 h-8 w-8 bg-maroon hover:bg-[#5A2D3C] text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {userProfile.displayName || "User"}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Member since{" "}
                            {userProfile.createdAt
                              ? new Date(
                                  userProfile.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                          {currentUser && currentUser.uid !== id && (
                            <div className="flex gap-2 justify-center">
                              <Button
                                onClick={handleFollowToggle}
                                disabled={isUpdatingFollow}
                                className={`transition-all duration-300 ${
                                  isFollowing
                                    ? "bg-gray-500 hover:bg-gray-600"
                                    : "bg-gradient-to-r from-maroon to-maroon-dark hover:from-[#5A2D3C] hover:to-[#7A3D4C]"
                                }`}
                              >
                                {isFollowing ? (
                                  <>
                                    <Users className="h-4 w-4 mr-2" />
                                    Following
                                  </>
                                ) : (
                                  <>
                                    <Heart className="h-4 w-4 mr-2" />
                                    Follow
                                  </>
                                )}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-2" />
                                Message
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Bio Section */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                            <div className="w-6 h-6 bg-gradient-to-br from-maroon to-maroon-dark rounded-lg flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <h3 className="font-semibold">About</h3>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {userProfile.bio ||
                              (currentUser?.uid === id
                                ? "Tell the community about yourself! Share your musical journey, favorite genres, or what inspires your compositions."
                                : `${userProfile.displayName} is a member of our musical community. They haven't shared their story yet, but every musician has a unique journey worth discovering.`)}
                          </p>
                          {currentUser?.uid === id && !userProfile.bio && (
                            <Link href="/settings">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-maroon text-maroon hover:bg-maroon hover:text-white transition-all duration-300"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Add Bio
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Stats Card */}
                    <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                          <div className="w-8 h-8 bg-gradient-to-br from-maroon to-maroon-dark rounded-lg flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Music2 className="w-4 h-4 text-maroon" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Scores
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {scores.length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-maroon" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Followers
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {followersCount}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-maroon" />
                            <span className="text-gray-600 dark:text-gray-400">
                              Member since
                            </span>
                          </div>
                          <span className="font-semibold text-gray-900 dark:text-white text-sm">
                            {userProfile.createdAt
                              ? new Date(
                                  userProfile.createdAt.seconds * 1000
                                ).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Right Column - Content */}
                  <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Tabs defaultValue="scores" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                          value="scores"
                          className="flex items-center gap-2"
                        >
                          <Music className="w-4 h-4" />
                          Musical Scores
                        </TabsTrigger>
                        <TabsTrigger
                          value="favorites"
                          className="flex items-center gap-2"
                        >
                          <Star className="w-4 h-4" />
                          Favorites
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="scores" className="space-y-6">
                        <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                              <div className="w-8 h-8 bg-gradient-to-br from-maroon to-maroon-dark rounded-lg flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              Published Scores ({scores.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {scores.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {scores.map((score, index) => (
                                  <motion.div
                                    key={score.id}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Link href={`/score/${score.id}`}>
                                      <Card className="h-full hover:shadow-lg transition-all duration-300 overflow-hidden border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 group">
                                        <div className="relative w-full h-48 bg-gray-50 dark:bg-gray-900">
                                          <Image
                                            src={
                                              score.flatid
                                                ? `https://flat.io/api/v2/scores/${score.flatid}/revisions/last/thumbnail.png?width=600&height=800`
                                                : "/placeholder.svg"
                                            }
                                            alt={
                                              score.title || "Score thumbnail"
                                            }
                                            fill
                                            style={{
                                              objectFit: "contain",
                                              objectPosition: "center",
                                            }}
                                            className="group-hover:scale-105 transition-transform duration-300"
                                          />
                                        </div>
                                        <CardContent className="p-4">
                                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                                            {score.title}
                                          </h3>
                                          <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {score.rating.toFixed(1)}
                                              </span>
                                            </div>
                                            {score.createdAt && (
                                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                                {score.createdAt
                                                  .toDate()
                                                  .toLocaleDateString()}
                                              </span>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <EmptyScoresCard
                                isOwnProfile={currentUser?.uid === id}
                              />
                            )}
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="favorites">
                        <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <CardContent className="p-8">
                            <div className="text-center space-y-4">
                              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-maroon to-maroon-dark rounded-full flex items-center justify-center">
                                <Star className="w-8 h-8 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                                  Favorites Coming Soon!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  This feature will allow users to bookmark and
                                  showcase their favorite scores from the
                                  community.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <Card className="shadow-xl border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 max-w-md mx-auto">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-maroon to-maroon-dark rounded-full flex items-center justify-center mb-6">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      User Not Found
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      The user profile you're looking for doesn't exist or has
                      been removed.
                    </p>
                    <Button
                      onClick={() => router.back()}
                      className="bg-gradient-to-r from-maroon to-maroon-dark hover:from-[#5A2D3C] hover:to-[#7A3D4C] text-white transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go Back
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
export default UserDetails;
