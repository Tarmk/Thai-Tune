"use client";

import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  profilePictureUrl?: string;
}

const Admin = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] }>(
    { success: 0, errors: [] }
  );

  const findUsersWithGenericNames = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("displayName", "==", "User")
      );
      const querySnapshot = await getDocs(q);

      const usersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProfile[];

      setUsers(usersList);
    } catch (error) {
      console.error("Error finding users:", error);
      setResults({ success: 0, errors: [`Error finding users: ${error}`] });
    } finally {
      setLoading(false);
    }
  };

  const fixUserProfile = async (userId: string) => {
    try {
      // Since we can't access Firebase Auth from client-side for other users,
      // we'll just update with a placeholder for now
      // In a real scenario, you'd use Firebase Admin SDK on the server

      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        displayName: `User_${userId.substring(0, 6)}`, // Better than just "User"
      });

      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as string };
    }
  };

  const fixAllUsers = async () => {
    setFixing(true);
    const successCount = 0;
    const errorsList: string[] = [];

    try {
      for (const user of users) {
        const result = await fixUserProfile(user.id);
        if (result.success) {
          // successCount++
        } else {
          errorsList.push(`${user.id}: ${result.error}`);
        }
      }

      setResults({ success: successCount, errors: errorsList });

      // Refresh the user list
      await findUsersWithGenericNames();
    } catch (error) {
      console.error("Error fixing users:", error);
      setResults({ success: 0, errors: [`General error: ${error}`] });
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fix user profiles with generic "User" display names
        </p>
      </div>

      <div className="space-y-6">
        {/* Find Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl">
              Find Users with Generic Names
            </CardTitle>
            <CardDescription>
              Search for users with "User" as their display name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={findUsersWithGenericNames}
              disabled={loading}
              className="mb-4"
            >
              {loading ? "Searching..." : "Find Users"}
            </Button>

            {users.length > 0 && (
              <div>
                <p className="mb-4">
                  Found {users.length} users with generic names:
                </p>
                <div className="space-y-2">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-medium">{user.displayName}</span>
                        {user.email && (
                          <span className="text-gray-500 ml-2">
                            ({user.email})
                          </span>
                        )}
                        <Badge variant="secondary" className="ml-2">
                          {user.id.substring(0, 8)}...
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fix Users Card */}
        {users.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl">
                Fix User Profiles
              </CardTitle>
              <CardDescription>
                This will update user profiles with better display names
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <AlertDescription>
                  <strong>Note:</strong> This is a simplified version. For full
                  functionality, you'll need to use Firebase Admin SDK on the
                  server to access user authentication data.
                </AlertDescription>
              </Alert>

              <Button
                onClick={fixAllUsers}
                disabled={fixing || users.length === 0}
                variant="destructive"
                className="mb-4"
              >
                {fixing ? "Fixing..." : `Fix ${users.length} Users`}
              </Button>

              {results.success > 0 && (
                <Alert className="mb-4">
                  <AlertDescription>
                    Successfully updated {results.success} user profiles!
                  </AlertDescription>
                </Alert>
              )}

              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div>
                      <strong>Errors:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {results.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Manual Fix Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Manual Fix Instructions</CardTitle>
            <CardDescription>
              For a proper fix, you'll need to use Firebase Admin SDK
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Browser Console Method:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Run this in your browser console (F12) while logged in as
                  admin:
                </p>
                <pre className="bg-black text-green-400 p-2 rounded text-xs overflow-x-auto">
                  {`// Fix a specific user
const userId = "USER_ID_HERE";
const userRef = doc(db, "users", userId);
await updateDoc(userRef, {
  displayName: "New Name Here"
});`}
                </pre>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Server-Side Solution:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For a complete solution, you'll need to create a Cloud
                  Function or server endpoint that uses Firebase Admin SDK to
                  access user authentication data and update Firestore
                  documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
