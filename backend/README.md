# Google Apps Script Backend Setup

This folder contains the Google Apps Script code to serve as the backend for the Customer Data Entry & Management Application.

## Step 1: Create a Google Sheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it something like "Customer Data & Documents".

## Step 2: Open Apps Script
1. In your new Google Sheet, go to **Extensions > Apps Script**.
2. Delete any code in `Code.gs` and paste the contents of the `Code.gs` file from this folder.
3. Save the project (Ctrl+S or Cmd+S). Name the project "Customer App Backend".

## Step 3: Initialize Database & Drive Folder
1. In the Apps Script editor, look at the top toolbar and select the function `setupDatabase` from the dropdown (next to the Run/Debug buttons).
2. Click **Run**.
3. You will be prompted to authorize the script to access your Google Sheets and Google Drive.
4. Review permissions, choose your account, click "Advanced", and then "Go to Customer App Backend (unsafe)".
5. Click **Allow**.
6. If the script finishes without error, check your Google Sheet. It should now have two tabs: `Customer_Details` and `Customer_Documents`.
7. Check your Google Drive. You should see a folder named `Customer Documents`.

## Step 4: Deploy as Web App
1. In the Apps Script editor, click the **Deploy** button at the top right, then select **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Provide a description (e.g., "Initial Deployment").
4. **Execute as**: Me (your email).
5. **Who has access**: Anyone (This is important for the React app to access it without authentication issues, alternatively you can manage access based on your specific security needs, but "Anyone" is easiest for a basic setup).
6. Click **Deploy**.
7. Copy the **Web app URL** provided.

## Step 5: Connect React Frontend
1. Open your React project.
2. In the `src/services/api.js` file (or `.env` file if configured), paste the Web app URL you just copied as the API URL.

Your backend is now ready!
