#!/bin/bash

# Script to add web version to Shot-Sync repository

echo "🚀 Adding Basketball Shot Analyzer to Shot-Sync repository..."

# Check if Shot-Sync repo exists
SHOT_SYNC_PATH="$HOME/Desktop/Shot-Sync"

if [ ! -d "$SHOT_SYNC_PATH" ]; then
    echo "📥 Shot-Sync repository not found. Cloning..."
    cd ~/Desktop
    git clone https://github.com/Shubh-go/Shot-Sync.git
    cd Shot-Sync
else
    echo "📂 Found Shot-Sync repository"
    cd "$SHOT_SYNC_PATH"
fi

# Create web folder
echo "📁 Creating web folder..."
mkdir -p web

# Copy files
echo "📋 Copying files..."
cp /Users/namrata/Desktop/MVP_Test/index.html web/
cp /Users/namrata/Desktop/MVP_Test/style.css web/
cp /Users/namrata/Desktop/MVP_Test/app.js web/

echo "✅ Files copied successfully!"
echo ""
echo "Next steps:"
echo "1. Review the files: cd ~/Desktop/Shot-Sync/web"
echo "2. Commit and push:"
echo "   git add web/"
echo "   git commit -m 'Add web version of Shot Sync'"
echo "   git push"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to https://github.com/Shubh-go/Shot-Sync/settings/pages"
echo "   - Source: main branch, /web folder"
echo "   - Save"
echo ""
echo "4. Your site will be live at:"
echo "   https://shubh-go.github.io/Shot-Sync/"

