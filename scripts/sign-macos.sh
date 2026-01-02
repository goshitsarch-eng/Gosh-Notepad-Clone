#!/bin/bash
# macOS Code Signing Script for Electron Apps
# Usage: ./scripts/sign-macos.sh "Developer ID Application: Your Name (TEAMID)"

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 \"Developer ID Application: Your Name (TEAMID)\""
    echo ""
    echo "Available identities:"
    security find-identity -v -p codesigning
    exit 1
fi

IDENTITY="$1"
APP="build/mac-arm64/Notepad.app"
ENTITLEMENTS="entitlements.plist"

if [ ! -d "$APP" ]; then
    echo "Error: $APP not found. Run 'npm run build:mac' first."
    exit 1
fi

if [ ! -f "$ENTITLEMENTS" ]; then
    echo "Error: $ENTITLEMENTS not found."
    exit 1
fi

echo "Signing $APP with identity: $IDENTITY"
echo ""

# Sign all dylibs
echo "Signing dylibs..."
find "$APP/Contents/Frameworks" -type f -name "*.dylib" -exec \
    codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" {} \;

# Sign chrome_crashpad_handler
echo "Signing chrome_crashpad_handler..."
codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
    "$APP/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler"

# Sign ShipIt
echo "Signing ShipIt..."
codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
    "$APP/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt"

# Sign helper apps
echo "Signing helper apps..."
for helper in "Notepad Helper" "Notepad Helper (GPU)" "Notepad Helper (Plugin)" "Notepad Helper (Renderer)"; do
    codesign --force --timestamp --options runtime \
        --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
        "$APP/Contents/Frameworks/$helper.app"
done

# Sign frameworks
echo "Signing frameworks..."
for framework in "Electron Framework" "Mantle" "ReactiveObjC" "Squirrel"; do
    codesign --force --timestamp --options runtime \
        --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" \
        "$APP/Contents/Frameworks/$framework.framework"
done

# Sign main app
echo "Signing main app..."
codesign --force --timestamp --options runtime \
    --entitlements "$ENTITLEMENTS" --sign "$IDENTITY" "$APP"

# Verify
echo ""
echo "Verifying signature..."
codesign --verify --deep --strict "$APP"

echo ""
echo "Done! App signed successfully."
echo ""
echo "Next steps:"
echo "  1. Create zip: ditto -c -k --keepParent $APP Notepad.zip"
echo "  2. Notarize:   xcrun notarytool submit Notepad.zip --apple-id EMAIL --team-id TEAM --password PASS --wait"
echo "  3. Staple:     xcrun stapler staple $APP"
echo "  4. Create DMG: hdiutil create -volname Notepad -srcfolder $APP -ov -format UDZO build/Notepad.dmg"
