# How to Add Professional Player Data

This guide explains how to extract real shot data from video clips of professional players.

## Overview

To add real professional player data, you need to:
1. Find video clips of players shooting
2. Process the videos through MediaPipe pose detection
3. Extract the shot data in the same format as the app
4. Add the data to the app

## Step 1: Get Video Clips

### Where to Find Videos:
- **YouTube**: Search for "[Player Name] shooting form" or "[Player Name] shot compilation"
- **NBA.com**: Official game highlights
- **Basketball training videos**: Coaching channels often have slow-motion shots

### Video Requirements:
- **Clear view of the player**: Full body visible, especially arms and shooting motion
- **Side angle preferred**: Best for pose detection (not directly from front or back)
- **Single shot**: One complete shooting motion per video
- **Good quality**: At least 480p, well-lit
- **Format**: MP4, MOV, or AVI

### Tips:
- Look for slow-motion replays (easier to process)
- Avoid videos with multiple players or cuts
- Prefer practice shots over game shots (less movement, clearer form)

## Step 2: Process the Video

### Install Dependencies

Make sure you have the required Python packages:

```bash
pip install opencv-python mediapipe numpy
```

### Process the Video

Use the provided script to extract pose data:

```bash
python process_player_video.py <video_file> <player_name>
```

**Example:**
```bash
python process_player_video.py curry_shot.mp4 curry
```

**Player names:**
- `curry` - Stephen Curry
- `lebron` - LeBron James
- `jordan` - Michael Jordan
- `durant` - Kevin Durant
- `clark` - Caitlin Clark

### What the Script Does:

1. **Loads the video** and processes each frame
2. **Detects pose** using MediaPipe
3. **Extracts angles**: Elbow, wrist, and arm angles
4. **Tracks shooting motion**: Identifies pre_shot, follow_through states
5. **Saves data** in the same format as the app uses

### Output:

The script creates two files:
- `player_data/{player_name}_benchmark.json` - JSON format
- `player_data/{player_name}_benchmark.js` - JavaScript format

## Step 3: Add Data to the App

### Option 1: Replace Synthetic Data (Recommended)

1. Open `app.js`
2. Find the `generateExampleBenchmarkData()` function
3. For each player, replace the synthetic data with real data:

```javascript
function initializeProPlayerBenchmarks() {
    // Load real data
    proPlayerBenchmarks['curry'] = curry_data;  // From curry_benchmark.js
    proPlayerBenchmarks['lebron'] = lebron_data;  // From lebron_benchmark.js
    // ... etc
}
```

### Option 2: Load from External File

1. Create a new file `player_benchmarks.js` with all player data
2. Include it in `index.html`:
   ```html
   <script src="player_benchmarks.js"></script>
   ```
3. Use the data in `initializeProPlayerBenchmarks()`

## Step 4: Verify the Data

After adding the data:

1. **Test in the app**: Select the player and record a shot
2. **Check the comparison**: The analysis should use the real player data
3. **Review feedback**: Make sure the feedback makes sense for that player's style

## Troubleshooting

### No Data Extracted

**Problem**: Script says "No shot data extracted"

**Solutions**:
- Make sure the video shows a clear shooting motion
- Try a different video angle (side view works best)
- Check that the player's full body is visible
- Try a slow-motion video

### Data Looks Wrong

**Problem**: Angles seem incorrect or unrealistic

**Solutions**:
- Verify the video quality (blurry videos = bad detection)
- Make sure the player is facing the right direction (right-handed shooter)
- Try processing multiple videos and averaging the results
- Manually review a few frames to ensure pose detection is working

### Multiple Shots in Video

**Problem**: Video contains multiple shots

**Solutions**:
- Use video editing software to extract a single shot
- The script will use the first complete shot it finds
- For best results, use a video with only one shot

## Tips for Best Results

1. **Use multiple videos**: Process 3-5 different shots and average the data
2. **Side angles work best**: 45-90 degree angle from the side
3. **Good lighting**: Well-lit videos = better pose detection
4. **High resolution**: 720p or higher recommended
5. **Slow motion**: Easier to process and more accurate

## Example Workflow

```bash
# 1. Download a video of Stephen Curry shooting
# (Save as curry_shot.mp4)

# 2. Process it
python process_player_video.py curry_shot.mp4 curry

# 3. Check the output
cat player_data/curry_benchmark.js

# 4. Copy the data array to app.js
# 5. Test in the app
```

## Next Steps

Once you have real data for all players:
- The comparisons will be more accurate
- The feedback will be more meaningful
- Users will get better insights into their form

