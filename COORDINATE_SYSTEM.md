# Coordinate System and Origin Point

## Step 1: MediaPipe Raw Coordinates

MediaPipe provides landmarks in **normalized coordinates** (0.0 to 1.0):
- **x**: 0.0 = left edge of image, 1.0 = right edge
- **y**: 0.0 = top edge of image, 1.0 = bottom edge  
- **z**: Relative depth (negative = closer to camera, positive = farther)

**Example:**
```
MediaPipe landmark[16] (right wrist):
  x: 0.5  (middle of image horizontally)
  y: 0.7  (70% down from top)
  z: -0.1 (slightly closer to camera)
```

## Step 2: Convert to Pixel Coordinates

We multiply by image dimensions to get pixel coordinates:

```javascript
function get3DPoint(landmarks, index, width, height) {
    return [
        landmarks[index].x * width,   // 0.5 * 640 = 320 pixels
        landmarks[index].y * height,  // 0.7 * 480 = 336 pixels
        landmarks[index].z * width    // -0.1 * 640 = -64 pixels
    ];
}
```

**Example (640x480 image):**
```
Right wrist in pixels:
  x: 320 pixels (from left)
  y: 336 pixels (from top)
  z: -64 pixels (depth)
```

**Coordinate System:**
- **Origin (0,0,0)**: Top-left corner of the image
- **X-axis**: Left → Right (0 to width)
- **Y-axis**: Top → Bottom (0 to height)
- **Z-axis**: Depth (negative = closer, positive = farther)

## Step 3: Normalize to Common Origin

To compare poses from different camera angles, we normalize:

### 3a. Find Shoulder Midpoint (Reference Point)

```javascript
shoulderMidpoint = [
    (leftShoulder[0] + rightShoulder[0]) / 2,   // Average X
    (leftShoulder[1] + rightShoulder[1]) / 2,   // Average Y
    (leftShoulder[2] + rightShoulder[2]) / 2    // Average Z
]
```

**This becomes our new origin (0, 0, 0)!**

### 3b. Translate All Landmarks

Subtract shoulder midpoint from every landmark:

```javascript
translated = [
    landmark[0] - shoulderMidpoint[0],  // X relative to shoulders
    landmark[1] - shoulderMidpoint[1],  // Y relative to shoulders
    landmark[2] - shoulderMidpoint[2]   // Z relative to shoulders
]
```

**Example:**
```
Before translation:
  Right wrist: [320, 336, -64]
  Shoulder midpoint: [320, 200, -20]
  
After translation:
  Right wrist: [0, 136, -44]  ← Now relative to shoulder midpoint!
```

### 3c. Rotate to Align Shoulders with X-Axis

Rotate around Y-axis so shoulders are parallel to X-axis:

```javascript
// Rotate around Y-axis
rotated = [
    translated[0] * cos - translated[2] * sin,  // New X
    translated[1],                              // Y unchanged
    translated[0] * sin + translated[2] * cos  // New Z
]
```

**Result:** Shoulders are now aligned horizontally along X-axis

## Final Coordinate System

After normalization:

- **Origin (0, 0, 0)**: Shoulder midpoint (center between left and right shoulders)
- **X-axis**: Left shoulder → Right shoulder (aligned horizontally)
- **Y-axis**: Up → Down (unchanged)
- **Z-axis**: Depth (rotated to match orientation)

**All landmarks are now relative to the shoulder midpoint!**

## Example: Comparing Your Wrist to LeBron's Wrist

**Your normalized right wrist:**
```
[15, 120, -30]  ← 15 pixels right, 120 pixels down, 30 pixels closer
```

**LeBron's normalized right wrist:**
```
[18, 115, -28]  ← 18 pixels right, 115 pixels down, 28 pixels closer
```

**Distance calculation:**
```
dx = 15 - 18 = -3 pixels
dy = 120 - 115 = 5 pixels
dz = -30 - (-28) = -2 pixels

Distance = √[(-3)² + 5² + (-2)²]
         = √[9 + 25 + 4]
         = √38
         = 6.16 pixels
```

## Why This Works

1. **Origin at shoulder midpoint**: Both poses are centered at the same reference point
2. **Aligned orientation**: Shoulders are always horizontal, regardless of camera angle
3. **Relative positions**: All distances are relative to the body center, not absolute screen positions
4. **Scale-independent**: Works regardless of how far you are from the camera (after normalization)

## Visual Representation

```
Before Normalization (Camera Coordinates):
┌─────────────────────────┐
│                         │
│    ● (left shoulder)    │  Origin: Top-left corner
│         ● (right wrist) │  Coordinates: Screen pixels
│    ● (right shoulder)   │
│                         │
└─────────────────────────┘

After Normalization (Body-Centered):
         ● (left shoulder)
              │
              │ Origin (0,0,0)
              │ (shoulder midpoint)
              │
         ● (right shoulder)
              │
              ● (right wrist)
              Coordinates: Relative to shoulder midpoint
```

