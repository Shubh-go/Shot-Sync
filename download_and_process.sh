#!/bin/bash
# Script to download YouTube video and process it for player data

# Check if yt-dlp is installed
if ! command -v yt-dlp &> /dev/null; then
    echo "yt-dlp is not installed. Installing..."
    pip install yt-dlp
fi

# Check arguments
if [ "$#" -lt 2 ]; then
    echo "Usage: ./download_and_process.sh <youtube_url> <player_name>"
    echo ""
    echo "Example:"
    echo "  ./download_and_process.sh https://youtube.com/shorts/AYDPw7LJL8k?si=I3cjJYSVbnW9NoO0 lebron"
    exit 1
fi

YOUTUBE_URL=$1
PLAYER_NAME=$2
VIDEO_FILE="${PLAYER_NAME}_shot.mp4"

echo "Downloading video from YouTube..."
yt-dlp -f "best[ext=mp4]/best" -o "$VIDEO_FILE" "$YOUTUBE_URL"

if [ $? -eq 0 ]; then
    echo "Video downloaded successfully!"
    echo ""
    echo "Processing video for pose data extraction..."
    python process_player_video.py "$VIDEO_FILE" "$PLAYER_NAME"
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Success! Data extracted and saved."
        echo "Check player_data/${PLAYER_NAME}_benchmark.js for the data."
    else
        echo "❌ Error processing video"
    fi
else
    echo "❌ Error downloading video"
    exit 1
fi

