# Migration from RainbowKit to Reown AppKit

This project has been successfully migrated from RainbowKit to Reown AppKit for React Native with social authentication support.

## Environment Variables & Cloud Setup

### 1. WalletConnect Project ID Setup

You need to set up a WalletConnect Project ID from Reown:

1. Go to [Reown Dashboard](https://dashboard.reown.com)
2. Create a new project
3. Copy your Project ID
4. Add it to your environment variables:

```bash
# In your .env.local or .env file
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 2. Mobile Application IDs (Required for Social Auth)

For social authentication to work properly, you need to configure your mobile app identifiers:

1. In your Reown Dashboard project, scroll down to **"Mobile Application IDs"** section
2. Add your iOS Bundle ID: `com.yourcompany.inventi` (or your actual bundle ID)
3. Add your Android Package Name: `com.yourcompany.inventi` (or your actual package name)
4. **Important**: Changes may take a few minutes to propagate

You can find these identifiers in:

- **iOS**: `ios/mobile/Info.plist` → `CFBundleIdentifier`
- **Android**: `android/app/build.gradle` → `applicationId`

## Changes Made

### Files Modified:

- ✅ `package.json` - Removed RainbowKit, added social auth dependencies
- ✅ `lib/wagmi.config.ts` - Added authConnector and extraConnectors configuration
- ✅ `app/_layout.tsx` - Added social authentication features to createAppKit
- ✅ `app/(tabs)/settings.tsx` - Replaced ConnectButton with AppKitButton

### New Dependencies Added:

- ✅ `@reown/appkit-auth-wagmi-react-native` - Social authentication connector
- ✅ `react-native-webview` - WebView component for auth flows

### Contract Hooks:

- ✅ Contract hooks (`use-delivery-contracts.ts`, `use-property-contracts.ts`, `use-visitor-contracts.ts`) are compatible as-is since they use standard wagmi hooks

## What's New

- 🚀 **Social Authentication**: Login with X (Twitter), Discord, Apple
- 📧 **Email Login**: Passwordless authentication with email OTP
- 🔐 **Non-custodial Wallets**: Auto-created for email/social users
- ⬆️ **Wallet Upgrades**: Users can upgrade to self-custodial wallets
- 📱 **Better Mobile UX**: Native React Native optimization
- 🔗 **430+ Wallets**: Support for extensive wallet ecosystem
- 🎨 **Modern UI**: Enhanced user interface components
- 📊 **Analytics**: Built-in usage analytics
- ✅ **Backward Compatible**: All existing wagmi hooks continue to work

## Troubleshooting

### General Issues:

1. Make sure your Project ID is correctly set in environment variables
2. Restart the development server after adding environment variables
3. Clear Expo cache if needed: `expo start -c`

### Social Authentication Issues:

1. **"Social login not appearing"**: Ensure Mobile Application IDs are configured in Reown Dashboard
2. **"Authentication failed"**: Verify Bundle ID/Package Name matches your app configuration
3. **"WebView errors"**: Make sure `react-native-webview` is properly installed
4. **iOS specific**: Run `cd ios && pod install` to install native dependencies
5. **Changes not reflected**: Allow a few minutes for Reown Dashboard changes to propagate

### Modal Loading Issues (FIXED):

6. **"AppKitButton just loads/spins"**: This project includes a fix for the modal loading bug
   - ✅ Fixed Metro bundler configuration for better module resolution
   - ✅ Added `FixedAppKitButton` component with state refresh workaround
   - ✅ AppKit initialization moved to component mount for better timing
7. **If modal still doesn't appear**:
   - Clear Metro cache: `npx expo start --clear`
   - Restart development server completely
   - In development, you'll see a red "Force Open" debug button next to the connect button

### iOS Setup:

If you're developing for iOS, run the following command to install native modules:

```bash
cd ios && pod install
```

## Deep Linking (Optional)

For better wallet connection experience, you can set up custom deep linking:

1. Update your `app.json` with your custom scheme:

```json
{
  "expo": {
    "scheme": "inventi"
  }
}
```

2. The wagmi config is already set up to use `inventi://` as the native redirect URL.
