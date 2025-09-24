#!/bin/bash

echo "🔧 Fixing AppKit Modal Loading Issue..."

# Clear Metro bundler cache
echo "1️⃣ Clearing Metro cache..."
npx expo start --clear

# Alternative commands if the above doesn't work
echo ""
echo "If the modal still doesn't work, try these commands:"
echo ""
echo "📱 For iOS:"
echo "   cd ios && rm -rf Pods Podfile.lock && pod install && cd .."
echo ""
echo "🤖 For Android:"
echo "   cd android && ./gradlew clean && cd .."
echo ""
echo "🗑️ Clear all caches:"
echo "   rm -rf node_modules && bun install"
echo "   npx expo start --clear --reset-cache"
echo ""
echo "🔄 Force restart development server:"
echo "   killall node && npx expo start --clear"
echo ""
echo "✅ The modal should now work properly!"
