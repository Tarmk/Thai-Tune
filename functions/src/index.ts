/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// Helper to send email via Resend
const sendEmailWithResend = async (
  to: string,
  subject: string,
  html: string,
  from = "ThaiTune <no-reply@thaitune.com>"
) => {
  const apiKey = functions.config().resend?.api_key as string | undefined;

  // Allow running without a key in dev, similar to other routes
  if (!apiKey) {
    console.log("Resend API key not configured. Email would be sent:", {
      to,
      subject,
    });
    return {success: true, simulated: true};
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      throw new Error(`Resend API error: ${response.status}`);
    }

    const data = await response.json();
    return {success: true, data};
  } catch (error) {
    console.error("Resend email error:", error);
    throw error;
  }
};

// Function to send verification code for registration (Resend-based)
export const sendVerificationCode = onCall(
  {cors: true},
  async (request: CallableRequest<{email: string}>) => {
    try {
      const {email} = request.data;
      
      if (!email || !email.includes("@")) {
        throw new HttpsError("invalid-argument", "Invalid email address");
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in Firestore with a 5-minute expiration
      await admin.firestore().collection("verificationCodes").doc(email).set({
        code,
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
        ),
      });
      
      // Send the code via Resend
      await sendEmailWithResend(
        email,
        "Your ThaiTune Verification Code",
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #F5F5F5;
                margin: 0;
                padding: 0;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                border: 4px solid #4A1D2C;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background-color: #4A1D2C;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .logo {
                width: 120px;
                height: auto;
                margin-bottom: 10px;
              }
              .content {
                background-color: white;
                padding: 30px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #4A1D2C;
                text-align: center;
                padding: 20px;
                margin: 20px 0;
                letter-spacing: 8px;
                border: 2px solid #E5E5E5;
                border-radius: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666666;
                font-size: 14px;
                padding: 15px;
                background-color: #f9f9f9;
                border-top: 1px solid #E5E5E5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="header">
                  <img src="https://melodify-d762b.web.app/images/thaitune-logo-transparent.png" alt="ThaiTune Logo" class="logo">
                  <h1>Verify Your Email</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Thank you for using ThaiTune. Please enter the verification code below:</p>
                  
                  <div class="code">${code}</div>
                  
                  <p>This code will expire in 5 minutes.</p>
                  
                  <p>If you didn't request this code, you can safely ignore this email.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ThaiTune. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      );
      
      return {success: true};
    } catch (error: any) {
      console.error("Error in sendVerificationCode:", error);
      
      // If it's already an HttpsError, re-throw it
      if (error instanceof HttpsError) {
        throw error;
      }
      
      // Generic error
      throw new HttpsError(
        "internal",
        `Failed to send verification code: ${error.message || "Unknown error"}`
      );
    }
  }
);

// Function to verify registration code
export const verifyCode = onCall(
  {cors: true},
  async (request: CallableRequest<{email: string; code: string}>) => {
    const {email, code} = request.data;
    // Get the stored code from Firestore
    const doc = await admin.firestore()
      .collection("verificationCodes").doc(email).get();
    if (!doc.exists) {
      throw new HttpsError(
        "not-found",
        "No verification code found"
      );
    }
    const {code: storedCode, expiresAt} = doc.data() as {
      code: string;
      expiresAt: admin.firestore.Timestamp;
    };
    // Check if code has expired
    if (expiresAt.toDate() < new Date()) {
      await doc.ref.delete(); // Clean up expired code
      throw new HttpsError(
        "failed-precondition",
        "Verification code has expired"
      );
    }
    // Verify the code
    if (code !== storedCode) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid verification code"
      );
    }
    // Code is valid - clean up
    await doc.ref.delete();
    return {success: true};
  }
);

// Function to send 2FA code (Resend-based)
export const send2faCode = onCall(
  {cors: true},
  async (request: CallableRequest<{email: string}>) => {
    try {
      if (!request.auth) {
        throw new HttpsError(
          "unauthenticated",
          "User must be logged in to request 2FA code"
        );
      }
      const {email} = request.data;
      const uid = request.auth.uid;
      
      if (!email || !email.includes("@")) {
        throw new HttpsError("invalid-argument", "Invalid email address");
      }
      
      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the code in Firestore with a 5-minute expiration
      await admin.firestore().collection("2faCodes").doc(uid).set({
        code,
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
        ),
      });
      
      // Send the code via Resend
      await sendEmailWithResend(
        email,
        "Your ThaiTune Verification Code",
        `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #F5F5F5;
                margin: 0;
                padding: 0;
                color: #333333;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .email-wrapper {
                border: 4px solid #4A1D2C;
                border-radius: 8px;
                overflow: hidden;
              }
              .header {
                background-color: #800000;
                color: white;
                padding: 20px;
                text-align: center;
              }
              .logo {
                width: 120px;
                height: auto;
                margin-bottom: 10px;
              }
              .content {
                background-color: white;
                padding: 30px;
              }
              .code {
                font-size: 32px;
                font-weight: bold;
                color: #4A1D2C;
                text-align: center;
                padding: 20px;
                margin: 20px 0;
                letter-spacing: 8px;
                border: 2px solid #E5E5E5;
                border-radius: 8px;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                color: #666666;
                font-size: 14px;
                padding: 15px;
                background-color: #f9f9f9;
                border-top: 1px solid #E5E5E5;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="email-wrapper">
                <div class="header">
                  <img src="https://melodify-d762b.web.app/images/thaitune-logo-transparent.png" alt="ThaiTune Logo" class="logo">
                  <h1>Two-Factor Authentication</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Please enter the verification code below to complete the authentication process:</p>
                  
                  <div class="code">${code}</div>
                  
                  <p>This code will expire in 5 minutes.</p>
                  
                  <p>If you didn't request this code, please secure your account immediately.</p>
                </div>
                <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} ThaiTune. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      );
      return {success: true};
    } catch (error: any) {
      console.error("Error in send2faCode:", error);
      
      // If it's already an HttpsError, re-throw it
      if (error instanceof HttpsError) {
        throw error;
      }
      
      // Generic error
      throw new HttpsError(
        "internal",
        `Failed to send verification code: ${error.message || "Unknown error"}`
      );
    }
  }
);

// Function to verify 2FA code
export const verify2faCode = onCall(
  {cors: true},
  async (request: CallableRequest<{code: string}>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be logged in to verify 2FA code"
      );
    }
    const {code} = request.data;
    const uid = request.auth.uid;
    // Get the stored code from Firestore
    const doc = await admin.firestore().collection("2faCodes").doc(uid).get();
    if (!doc.exists) {
      throw new HttpsError(
        "not-found",
        "No verification code found"
      );
    }
    const {code: storedCode, expiresAt} = doc.data() as {
      code: string;
      expiresAt: admin.firestore.Timestamp;
    };
    // Check if code has expired
    if (expiresAt.toDate() < new Date()) {
      await doc.ref.delete(); // Clean up expired code
      throw new HttpsError(
        "failed-precondition",
        "Verification code has expired"
      );
    }
    // Verify the code
    if (code !== storedCode) {
      throw new HttpsError(
        "invalid-argument",
        "Invalid verification code"
      );
    }
    // Code is valid - clean up
    await doc.ref.delete();
    return {success: true};
  }
);

// Function to enable/disable 2FA for a user
export const update2faSettings = onCall(
  {cors: true},
  async (request: CallableRequest<{enabled: boolean}>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be logged in to update 2FA settings"
      );
    }
    const uid = request.auth.uid;
    const {enabled} = request.data;
    // Update user's 2FA settings in Firestore
    await admin.firestore().collection("userSettings").doc(uid).set({
      twoFactorEnabled: enabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    return {success: true};
  }
);

// Function to check if 2FA is enabled for a user
export const get2faSettings = onCall(
  {cors: true},
  async (request: CallableRequest<unknown>) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be logged in to get 2FA settings"
      );
    }
    const uid = request.auth.uid;
    // Get user's 2FA settings from Firestore
    const doc = await admin.firestore().collection("userSettings").doc(uid).get();
    if (!doc.exists) {
      return {twoFactorEnabled: false};
    }
    return {
      twoFactorEnabled: doc.data()?.twoFactorEnabled || false,
    };
  }
);

// Admin function to fix user profiles with generic "User" displayName
export const fixUserProfiles = onCall(
  {cors: true},
  async (request: CallableRequest<{adminKey?: string}>) => {
    // Simple admin authentication - you should use a proper admin key
    const adminKey = request.data.adminKey || "";
    const expectedAdminKey = functions.config().admin?.key || "admin123"; // Set this in Firebase config
    
    if (adminKey !== expectedAdminKey) {
      throw new HttpsError(
        "permission-denied",
        "Admin access required"
      );
    }

    let updatedCount = 0;
    let errors: string[] = [];

    try {
      // Get all users with displayName "User"
      const usersQuery = await admin.firestore()
        .collection("users")
        .where("displayName", "==", "User")
        .get();

      console.log(`Found ${usersQuery.docs.length} users with generic "User" displayName`);

      for (const userDoc of usersQuery.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();

        try {
          // Get the user's Firebase Auth record
          const authUser = await admin.auth().getUser(userId);
          
          // Prepare update data
          const updateData: any = {};
          
          // Update displayName if Auth has a better name
          if (authUser.displayName) {
            updateData.displayName = authUser.displayName;
          } else if (authUser.email) {
            // Use email username if no displayName
            updateData.displayName = authUser.email.split('@')[0];
          }
          
          // Update profile picture if Auth has one
          if (authUser.photoURL && !userData.profilePictureUrl) {
            updateData.profilePictureUrl = authUser.photoURL;
          }

          // Only update if we have new data
          if (Object.keys(updateData).length > 0) {
            await admin.firestore()
              .collection("users")
              .doc(userId)
              .update(updateData);
            
            updatedCount++;
            console.log(`Updated user ${userId} with:`, updateData);
          }
        } catch (error) {
          console.error(`Error updating user ${userId}:`, error);
          errors.push(`${userId}: ${error}`);
        }
      }

      return {
        success: true,
        message: `Updated ${updatedCount} user profiles`,
        updatedCount,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      console.error("Error in fixUserProfiles:", error);
      throw new HttpsError(
        "internal",
        `Failed to fix user profiles: ${error}`
      );
    }
  }
);
