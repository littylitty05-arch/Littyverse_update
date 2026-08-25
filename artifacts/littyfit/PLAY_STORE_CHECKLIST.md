# LittyFit — Google Play Store Launch Checklist

## Step 1: Link to EAS (run once from your local machine)
```bash
npm install -g eas-cli
eas login                    # log in with your Expo account
cd artifacts/littyfit
eas init                     # creates a project on expo.dev and fills in projectId
```
After `eas init`, the `extra.eas.projectId` in app.json will be filled in automatically.

---

## Step 2: Build the production AAB
```bash
eas build --platform android --profile production
```
- EAS generates a signing keystore automatically on first build and stores it securely
- The build runs in the cloud — takes ~10–15 minutes
- You'll get a download link for the `.aab` file when done

---

## Step 3: Play Console — create the app
1. Go to https://play.google.com/console
2. Click **Create app**
3. Fill in: App name = `LittyFit`, Default language = English, App or Game = App, Free or Paid = Free
4. Accept the declarations

---

## Step 4: Store Listing (required before submission)

### Short description (80 chars max)
```
Earn LTK tokens by training, eating clean, and staying consistent.
```

### Full description (4000 chars max — customize as needed)
```
LittyFit is the official fitness companion of the Littyverse ecosystem.

Train smarter. Fuel better. Recover harder. Every rep, every glass of water, and every yoga session earns you real LTK tokens — the currency of the Littyverse.

FEATURES:
• Base Blueprint — your daily non-negotiables checklist (sleep, hydration, movement, training, nutrition, mental reset)
• Train — 10 structured workout programs from beginner to elite with difficulty ratings and PR tracking
• Fuel — macro ring tracker, animated hydration logger, 6 diet plans, and direct access to Littyverse Supplements
• Recover — 7-day sleep chart, 4-7-8 breathing exercises, and a 6-step recovery protocol
• Profile — LTK balance, achievement badges, level system, and your full earnings timeline

EARN REAL LTK:
- Check in daily: +10 LTK
- Complete a workout: +50 LTK
- Hit hydration goal: +10 LTK
- Yoga session: +25 LTK

Your LTK balance is shared across the entire Littyverse platform — earn here, spend everywhere.

LittyFit is not just a fitness app. It's your Life OS.
```

---

## Step 5: Required assets to create

| Asset | Size | Notes |
|-------|------|-------|
| App icon | 512×512 PNG | No transparency, no rounded corners (Play adds them) |
| Feature graphic | 1024×500 PNG | Banner shown at top of store page |
| Phone screenshots | Min 2, max 8 | At least 320px wide — take from Expo Go or emulator |

---

## Step 6: Content rating questionnaire
- Go to **Policy → App content → Content rating**
- Select **Utility** category
- Answer: No violence, No sexual content, No user-generated content that isn't moderated
- Rating will come out as **Everyone** or **Everyone 10+**

---

## Step 7: Data safety form
Declare the following in Play Console under **Data safety**:

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Email address | Yes | No | Account management |
| Name | Yes | No | Account management |
| Fitness activity | Yes | No | App functionality |
| App interactions | Yes | No | Analytics |

Check "Data is encrypted in transit" — your API uses HTTPS.
Check "Users can request data deletion" — add a link to littyverse.com/delete-account (or create one).

---

## Step 8: Upload and publish
1. In Play Console go to **Testing → Internal testing**
2. Create a new release, upload your `.aab` file
3. Add your own Google account as a tester — install and verify it works
4. Once verified, go to **Production** and roll out to 100%
5. First-time reviews typically take 1–3 days

---

## Build profiles explained

| Profile | Output | Use for |
|---------|--------|---------|
| `development` | APK | Local testing with Expo Dev Client |
| `preview` | APK | Sharing with testers directly (sideload) |
| `production` | AAB | Play Store submission |

```bash
# Preview APK (share via link, install directly):
eas build --platform android --profile preview

# Production AAB (Play Store):
eas build --platform android --profile production
```
