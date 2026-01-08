"use client";

import {
  Shield,
  Eye,
  Lock,
  Database,
  Cookie,
  Mail,
  UserCheck,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#1a1f2c] flex flex-col transition-colors duration-300">
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-maroon/10 to-maroon-dark/10 dark:from-maroon/20 dark:to-maroon-dark/20"></div>
          <div className="relative container mx-auto px-4 py-12 md:py-24">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg">
                  <Shield className="w-12 h-12 text-maroon dark:text-maroon-lite" />
                </div>
              </div>
              <h1 className="text-3xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-maroon to-maroon-dark bg-clip-text text-transparent dark:from-maroon-lite dark:to-[#f5c7d1]">
                Privacy Policy
              </h1>
              <p className="text-lg md:text-2xl text-gray-600 dark:text-gray-300">
                Last updated: January 2025
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
            {/* Introduction */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <UserCheck className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h2 className="text-2xl font-bold text-maroon dark:text-maroon-lite">
                  Your Privacy Matters
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                At ThaiTune, we are committed to protecting your privacy and
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our platform for preserving and learning traditional Thai
                music.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite">
                  1. Information We Collect
                </h3>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Personal Information
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  When you create an account or use our services, we may
                  collect:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-6">
                  <li>Name and email address</li>
                  <li>
                    Profile information (bio, location, musical interests)
                  </li>
                  <li>Account preferences and settings</li>
                  <li>Communication history with our support team</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Content Information
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We collect the musical content you share, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mb-6">
                  <li>Traditional Thai music scores and notation</li>
                  <li>Comments, reviews, and contributions</li>
                  <li>Bookmarks and personal collections</li>
                  <li>Metadata about uploaded content</li>
                </ul>

                <h4 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-3">
                  Usage Information
                </h4>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We automatically collect information about how you use
                  ThaiTune:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>
                    Device information (IP address, browser type, operating
                    system)
                  </li>
                  <li>Usage patterns and interactions with the platform</li>
                  <li>Pages visited and features used</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>
            </div>

            {/* How We Use Information */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Eye className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite">
                  2. How We Use Your Information
                </h3>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use your information to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Provide and maintain our music preservation platform</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Enable community features and user interactions</li>
                  <li>Improve our services and develop new features</li>
                  <li>Communicate with you about updates and support</li>
                  <li>Ensure platform security and prevent abuse</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                3. Information Sharing and Disclosure
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We do not sell, trade, or rent your personal information. We
                  may share information only in these circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>
                    <strong>With your consent:</strong> When you explicitly
                    agree to share information
                  </li>
                  <li>
                    <strong>Public content:</strong> Musical scores and
                    contributions you choose to make public
                  </li>
                  <li>
                    <strong>Service providers:</strong> Trusted third parties
                    who help us operate our platform
                  </li>
                  <li>
                    <strong>Legal requirements:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Business transfers:</strong> In the event of a
                    merger or acquisition
                  </li>
                </ul>
              </div>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Lock className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite">
                  4. Data Security
                </h3>
              </div>
              <div className="bg-gradient-to-r from-maroon/5 to-maroon-dark/5 dark:from-maroon/10 dark:to-maroon-dark/10 rounded-lg p-6">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We implement industry-standard security measures to protect
                  your information:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Encryption of sensitive data in transit and at rest</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>Access controls and authentication systems</li>
                  <li>Secure cloud infrastructure and monitoring</li>
                </ul>
              </div>
            </div>

            {/* Cookies and Tracking */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <Cookie className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite">
                  5. Cookies and Tracking Technologies
                </h3>
              </div>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We use cookies and similar technologies to enhance your
                  experience:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>
                    <strong>Essential cookies:</strong> Required for basic
                    platform functionality
                  </li>
                  <li>
                    <strong>Preference cookies:</strong> Remember your settings
                    and preferences
                  </li>
                  <li>
                    <strong>Analytics cookies:</strong> Help us understand how
                    you use ThaiTune
                  </li>
                  <li>
                    <strong>Performance cookies:</strong> Optimize loading times
                    and user experience
                  </li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 mt-4">
                  You can manage your cookie preferences through your browser
                  settings.
                </p>
              </div>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                6. Your Privacy Rights
              </h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                  <li>Access and review your personal information</li>
                  <li>Update or correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of certain communications</li>
                  <li>Request restrictions on data processing</li>
                </ul>
              </div>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                7. Data Retention
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We retain your personal information only as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy. When you delete your account, we will permanently remove
                your personal information within 30 days, except where required
                by law or for legitimate business purposes.
              </p>
            </div>

            {/* International Users */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                8. International Users
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                ThaiTune is operated from Thailand and serves users worldwide.
                If you are accessing our services from outside Thailand, please
                be aware that your information may be transferred to and stored
                in Thailand. We ensure appropriate safeguards are in place for
                international data transfers.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                9. Children's Privacy
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                ThaiTune is not intended for children under 13 years of age. We
                do not knowingly collect personal information from children
                under 13. If you believe we have collected information from a
                child under 13, please contact us immediately.
              </p>
            </div>

            {/* Policy Changes */}
            <div className="mb-12">
              <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite mb-4">
                10. Changes to This Policy
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will
                notify you of any significant changes via email or through our
                platform. Your continued use of ThaiTune after changes are
                posted constitutes your acceptance of the updated policy.
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex items-center mb-6">
                <Mail className="w-6 h-6 text-maroon dark:text-maroon-lite mr-3" />
                <h3 className="text-xl font-semibold text-maroon dark:text-maroon-lite">
                  Contact Us About Privacy
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                If you have questions about this Privacy Policy or want to
                exercise your privacy rights, please contact us:
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200 font-medium">
                  Email: privacy@thaitune.com
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Privacy inquiries are typically handled within 7 business days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PrivacyPolicy;
