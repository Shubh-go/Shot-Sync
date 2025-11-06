# Basketball Shot Form Analyzer - Web Application

A web-based application that analyzes basketball shooting form by comparing your shot to a benchmark using pose detection and Dynamic Time Warping (DTW).

## Features

- 🎥 Real-time video capture from webcam
- 📊 Shot form analysis and comparison
- 📈 Visual charts showing form similarity
- 💡 Actionable feedback and recommendations
- 🎯 Key event detection (Start, Ball Set, Release, Follow Through)

## Setup Instructions

### 1. Install Python Dependencies

Make sure you have Python 3.8 or higher installed. Then install the required packages:

```bash
pip install -r requirements.txt
```

### 2. Run the Flask Server

Start the backend server:

```bash
python app.py
```

The server will start on `http://localhost:5000`

### 3. Open in Browser

Open your web browser and navigate to:

```
http://localhost:5000
```

## How to Use

1. **Record Benchmark Shot**: 
   - Click "Start Recording"
   - Perform your benchmark shot
   - Click "Stop Recording" when done

2. **Record Your Shot**:
   - Click "Start Recording"
   - Perform your shot
   - Click "Stop Recording" when done

3. **View Results**:
   - The analysis will automatically run
   - View your score and feedback
   - See the comparison chart

## Project Structure

```
MVP_Test/
├── app.py                 # Flask backend server
├── shot_stage_tf.py       # Original Python script (standalone)
├── requirements.txt       # Python dependencies
├── static/
│   ├── index.html        # Frontend HTML
│   ├── style.css         # Styling
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## Technical Details

- **Backend**: Flask (Python)
- **Pose Detection**: MediaPipe
- **Video Processing**: OpenCV
- **Time Series Comparison**: FastDTW
- **Frontend**: Vanilla JavaScript, Chart.js

## Troubleshooting

### Camera Not Working
- Make sure you allow camera permissions in your browser
- Check that no other application is using the camera
- Try refreshing the page

### Server Not Starting
- Make sure port 5000 is not in use
- Check that all dependencies are installed correctly
- Try running `python app.py` again

### Processing Errors
- Make sure you perform a complete shot (pre-shot → follow-through)
- Ensure good lighting and visibility
- Try recording again with better camera positioning

## Development Notes

- The application processes video frames at 10 FPS
- Frames are captured as JPEG images and sent to the backend
- The backend uses MediaPipe for pose detection
- DTW (Dynamic Time Warping) is used to align and compare shots

## License

This project is open source and free to use.

