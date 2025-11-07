# How Landmark Comparison Works

## MediaPipe Pose Landmark Indices

MediaPipe Pose detects 33 body landmarks in a fixed order. Here are the key indices for shooting form:

### Upper Body (Shooting Arm):
- **Index 11**: Left Shoulder
- **Index 12**: Right Shoulder  
- **Index 13**: Left Elbow
- **Index 14**: Right Elbow
- **Index 15**: Left Wrist
- **Index 16**: Right Wrist ⭐ (shooting hand)
- **Index 17**: Left Pinky
- **Index 18**: Right Pinky
- **Index 19**: Left Index
- **Index 20**: Right Index ⭐ (shooting hand finger)

### Full Body:
- **Index 0-10**: Face landmarks
- **Index 21-32**: Lower body (hips, knees, ankles, feet)

## How Comparison Works

When comparing your shot to LeBron's:

1. **Same Index = Same Body Part**
   - Your `landmarks[16]` (right wrist) is compared to LeBron's `landmarks[16]` (right wrist)
   - Your `landmarks[14]` (right elbow) is compared to LeBron's `landmarks[14]` (right elbow)
   - This ensures we're always comparing corresponding body parts

2. **3D Distance Calculation**
   For each corresponding landmark pair:
   ```
   Your right wrist: [x1, y1, z1]
   LeBron's right wrist: [x2, y2, z2]
   
   Distance = √[(x1-x2)² + (y1-y2)² + (z1-z2)²]
   ```

3. **Average Distance**
   - Calculate distance for all 33 landmarks
   - Average them to get overall pose similarity
   - Lower distance = more similar form

4. **DTW Alignment**
   - Uses Dynamic Time Warping to align your motion timeline with LeBron's
   - Matches corresponding frames (e.g., your frame 5 might match LeBron's frame 7)
   - Then compares landmarks at those aligned frames

## Example

**Frame Comparison:**
```
Your Frame 3:
  Right Wrist [16]: [320, 450, -50]
  Right Elbow [14]: [300, 400, -30]
  Right Shoulder [12]: [280, 350, -20]

LeBron's Frame 5 (aligned via DTW):
  Right Wrist [16]: [315, 445, -48]
  Right Elbow [14]: [298, 398, -28]
  Right Shoulder [12]: [282, 348, -22]

Distance Calculation:
  Wrist distance: √[(320-315)² + (450-445)² + (-50-(-48))²] = √[25 + 25 + 4] = 7.35 pixels
  Elbow distance: √[(300-298)² + (400-398)² + (-30-(-28))²] = √[4 + 4 + 4] = 3.46 pixels
  Shoulder distance: √[(280-282)² + (350-348)² + (-20-(-22))²] = √[4 + 4 + 4] = 3.46 pixels
  
  Average (all 33 landmarks): ~15 pixels
  Similarity Score: 100 - (15/100)*100 = 85%
```

## Why This Is Accurate

1. **Normalized Orientation**: Both poses are rotated so shoulders align with x-axis
2. **Corresponding Parts**: Index-based matching ensures right wrist always compares to right wrist
3. **Full Body Context**: All 33 landmarks are compared, not just shooting arm
4. **Temporal Alignment**: DTW finds the best frame-to-frame matches across time

