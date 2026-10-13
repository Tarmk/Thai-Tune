# Simple Email Integration Setup

## 🛠️ **Option 1: IMAP Email Reading** (Recommended)

This solution reads emails directly from your email account - much simpler than Gmail API!

### **Setup Steps:**

1. **Add environment variables to `.env.local`:**
```
SUPPORT_EMAIL=support@thaitune.com
SUPPORT_EMAIL_PASSWORD=your_app_password
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
```

2. **For Gmail, create an App Password:**
   - Go to your Google Account settings
   - Security → 2-Step Verification
   - App passwords → Generate password
   - Use this password (not your regular password)

3. **For other email providers:**
   - **Outlook**: `outlook.office365.com` (port 993)
   - **Yahoo**: `imap.mail.yahoo.com` (port 993)
   - **Custom domain**: Ask your hosting provider

4. **Test the integration:**
   - Create a test ticket in your admin panel
   - Send an email to `support@thaitune.com` with subject: `Re: [TT-123456-ABC123] Test`
   - Click "Check Emails" in your admin panel
   - The reply should appear in your ticket!

### **How it works:**
- Connects to your email via IMAP
- Reads unread emails
- Looks for ticket IDs in subject lines
- Adds replies to your tickets
- Marks emails as read

### **Advantages:**
- ✅ Simple setup (just email credentials)
- ✅ Works with any email provider
- ✅ No external dependencies
- ✅ You control everything
- ✅ No webhooks or DNS setup needed

## 📧 **Option 2: Email Forwarding** (Simplest)

If you want zero setup:

1. **Forward support emails to your personal email:**
   - In your domain's email settings
   - Forward `support@thaitune.com` → `your-gmail@gmail.com`

2. **Use Gmail filters:**
   - Create filter for emails to `support@thaitune.com`
   - Auto-apply label "Support Tickets"

3. **Handle manually:**
   - Check support emails daily
   - Copy important ones into your admin system
   - Reply normally from Gmail

## 🔄 **Option 3: Webhook Services**

Use a service that converts email to webhooks:

### **Mailgun** (Simple)
1. Sign up at https://mailgun.com
2. Free tier: 10,000 emails/month
3. Set up inbound parsing
4. Point to your webhook endpoint

### **Postmark** (Reliable)
1. Sign up at https://postmarkapp.com
2. Free tier: 100 emails/month
3. Excellent inbound email handling
4. Simple webhook setup

## 🎯 **My Recommendation:**

**Start with Option 1 (IMAP)** because:
- ✅ Works immediately with any email
- ✅ No external service dependencies
- ✅ Simple to understand and debug
- ✅ Free forever
- ✅ No complex setup

**If you want even simpler:** Use Option 2 (email forwarding) and handle manually until you grow.

## 🔧 **Adding to Admin Panel**

Add a "Check Emails" button to your admin panel:

```jsx
const checkEmails = async () => {
  try {
    const response = await fetch('/api/check-emails', {
      method: 'POST'
    });
    const data = await response.json();
    if (data.success) {
      alert('Emails checked successfully!');
      // Refresh your tickets list
    }
  } catch (error) {
    console.error('Error checking emails:', error);
  }
};

// Add this button to your admin panel
<button onClick={checkEmails}>Check Emails</button>
```

## ⚡ **Automation (Optional)**

To check emails automatically every 5 minutes:

1. **Using Vercel Cron:**
   ```javascript
   // vercel.json
   {
     "cron": [
       {
         "path": "/api/check-emails",
         "schedule": "*/5 * * * *"
       }
     ]
   }
   ```

2. **Using a simple interval:**
   ```javascript
   // Run this in a separate Node.js process
   setInterval(async () => {
     await fetch('https://yourapp.com/api/check-emails', {
       method: 'POST'
     });
   }, 5 * 60 * 1000); // 5 minutes
   ```

That's it! Much simpler than Gmail API or external platforms! 🎉 