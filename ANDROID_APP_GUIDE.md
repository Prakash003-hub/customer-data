# Android App Guide for SOS Customer Dataset PWA

You can turn this PWA into a native **Android App (.apk)** using 3 different methods depending on your needs.

---

## Method 1: Instant Native Android App (WebAPK - No Coding Required)

This is the fastest method. Android OS automatically compiles the PWA into a native Android WebAPK:

1. Open your deployed website URL in **Google Chrome** on your Android phone.
2. Tap the **"Install App"** button at the top of the navbar (or tap Chrome menu `⋮` -> **Install app** / **Add to Home screen**).
3. Android will automatically generate and install a native **Android App** icon on your home screen and app drawer.

---

## Method 2: Build a Standalone `.apk` File (Google Bubblewrap CLI)

Google provides **Bubblewrap**, an official CLI tool that packages PWAs into standalone `.apk` or `.aab` files for Google Play Store or direct APK side-loading.

### Steps to build `.apk`:

1. **Install Node.js & Bubblewrap CLI**:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. **Initialize Android Project**:
   ```bash
   bubblewrap init --manifest=https://<your-deployed-domain>/manifest.webmanifest
   ```

3. **Build the Android APK**:
   ```bash
   bubblewrap build
   ```

4. **Output**:
   This generates `app-release-signed.apk` in the root folder, ready to transfer and install on any Android phone!

---

## Method 3: Capacitor Android Native App (Android Studio)

If you want a full Android Studio project that can run offline on any device:

1. **Install Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**:
   ```bash
   npx cap init "SOS Customer Dataset" "com.soscustomer.dataset" --web-dir=dist
   ```

3. **Add Android Platform & Build**:
   ```bash
   npm run build
   npx cap add android
   npx cap copy
   ```

4. **Open in Android Studio & Generate APK**:
   ```bash
   npx cap open android
   ```
   In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
