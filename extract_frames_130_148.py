#!/usr/bin/env python3
"""
Extract pose data from specific video frames (130-148) for LeBron.
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import os
from pathlib import Path

# MediaPipe setup
mp_pose = mp.solutions.pose

pose = mp_pose.Pose(
    model_complexity=2,
    static_image_mode=False,
    smooth_landmarks=True,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

def get_3d_point(landmarks, index, width, height):
    """Extract 3D point from MediaPipe landmarks."""
    if index >= len(landmarks) or landmarks[index].visibility < 0.5:
        return None
    return [
        landmarks[index].x * width,
        landmarks[index].y * height,
        landmarks[index].z * width
    ]

def calculate_angle(a, b, c):
    """Calculate 3D angle between three points."""
    if a is None or b is None or c is None:
        return None
    
    a, b, c = np.array(a), np.array(b), np.array(c)
    ba = a - b
    bc = c - b
    
    dot = np.dot(ba, bc)
    mag_ba = np.linalg.norm(ba)
    mag_bc = np.linalg.norm(bc)
    
    if mag_ba < 1e-5 or mag_bc < 1e-5:
        return None
    
    cosine = np.clip(dot / (mag_ba * mag_bc), -1.0, 1.0)
    return np.arccos(cosine) * (180.0 / np.pi)

def normalize_pose_orientation(landmarks):
    """
    Normalize pose landmarks to align shoulders with x-axis.
    This ensures consistent orientation regardless of camera angle.
    
    Args:
        landmarks: List of 33 [x, y, z] points (or numpy array)
    
    Returns:
        Normalized landmarks array
    """
    landmarks = np.array(landmarks)
    if landmarks.shape[0] < 33:
        return landmarks.tolist()
    
    # Get shoulder points (MediaPipe indices: 11 = left shoulder, 12 = right shoulder)
    left_shoulder = landmarks[11]
    right_shoulder = landmarks[12]
    
    # Check if shoulders are valid
    if np.any(np.isnan(left_shoulder)) or np.any(np.isnan(right_shoulder)):
        return landmarks.tolist()  # Return original if shoulders not detected
    
    # Calculate shoulder vector (from left to right shoulder)
    shoulder_vec = right_shoulder - left_shoulder
    
    # Project to XZ plane (ignore Y for rotation calculation)
    shoulder_vec_xz = np.array([shoulder_vec[0], shoulder_vec[2]])
    shoulder_mag = np.linalg.norm(shoulder_vec_xz)
    
    if shoulder_mag < 1e-5:
        return landmarks.tolist()  # Shoulders too close, can't determine orientation
    
    # Calculate angle to rotate shoulder vector to align with +X axis
    # Ensure the vector points in +X direction (right shoulder should have higher X than left)
    target_vec = np.array([1.0, 0.0])
    current_vec = shoulder_vec_xz / shoulder_mag
    
    # Calculate rotation angle (around Y-axis)
    cos_angle = np.dot(current_vec, target_vec)
    sin_angle = current_vec[0] * target_vec[1] - current_vec[1] * target_vec[0]
    angle = np.arctan2(sin_angle, cos_angle)
    
    # If the dot product is negative, we need to flip direction (rotate 180 degrees)
    if cos_angle < 0:
        angle += np.pi
    
    # Rotation matrix for rotation around Y-axis
    cos = np.cos(-angle)  # Negative to align with +X
    sin = np.sin(-angle)
    
    # Calculate shoulder midpoint for translation
    shoulder_midpoint = (left_shoulder + right_shoulder) / 2.0
    
    # Apply rotation and translation to all landmarks
    normalized = []
    for landmark in landmarks:
        if np.any(np.isnan(landmark)):
            normalized.append([np.nan, np.nan, np.nan])
            continue
        
        # Translate to origin (using shoulder midpoint)
        translated = landmark - shoulder_midpoint
        
        # Rotate around Y-axis
        rotated = np.array([
            translated[0] * cos - translated[2] * sin,
            translated[1],
            translated[0] * sin + translated[2] * cos
        ])
        
        normalized.append(rotated.tolist())
    
    return normalized

def get_arm_state(landmarks, width, height):
    """Determine shooting state from pose landmarks."""
    right_shoulder = get_3d_point(landmarks, 12, width, height)
    right_elbow = get_3d_point(landmarks, 14, width, height)
    right_wrist = get_3d_point(landmarks, 16, width, height)
    left_wrist = get_3d_point(landmarks, 15, width, height)
    left_hip = get_3d_point(landmarks, 23, width, height)
    right_hip = get_3d_point(landmarks, 24, width, height)

    if right_wrist and left_wrist and left_hip and right_hip and right_shoulder:
        waist_y = (left_hip[1] + right_hip[1]) / 2.0
        avg_wrist_y = (right_wrist[1] + left_wrist[1]) / 2.0
        dist_wrists = np.linalg.norm(np.array(right_wrist) - np.array(left_wrist))
        
        if dist_wrists < 0.15 * width and avg_wrist_y < waist_y and right_wrist[1] > right_shoulder[1]:
            return "pre_shot"

    if right_wrist and right_shoulder:
        if right_shoulder[1] > right_wrist[1]:
            return "follow_through"

    if right_shoulder and right_wrist:
        if right_wrist[1] > right_shoulder[1]:
            return "neutral"

    return "neutral"

def process_frames_130_148(video_path, player_name):
    """Process only frames 130-148 from video."""
    print(f"Processing video: {video_path}")
    print(f"Player: {player_name}")
    print(f"Extracting frames: 130-148 (19 frames)")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video properties: {width}x{height} @ {fps} fps")
    
    pose_data = []
    start_frame = 130
    end_frame = 148
    
    print(f"\nSeeking to frame {start_frame}...")
    
    # Seek to frame 130
    cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
    
    print("Processing frames 130-148...")
    
    for frame_idx in range(start_frame, end_frame + 1):
        ret, frame = cap.read()
        if not ret:
            print(f"Warning: Could not read frame {frame_idx}")
            break
        
        current_time = (frame_idx - start_frame) / fps
        
        # Convert BGR to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(rgb_frame)
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            state = get_arm_state(landmarks, width, height)
            
            # Calculate angles
            right_shoulder = get_3d_point(landmarks, 12, width, height)
            right_elbow = get_3d_point(landmarks, 14, width, height)
            right_wrist = get_3d_point(landmarks, 16, width, height)
            right_index = get_3d_point(landmarks, 20, width, height)
            left_shoulder = get_3d_point(landmarks, 11, width, height)
            
            elbow_angle = calculate_angle(right_shoulder, right_elbow, right_wrist)
            wrist_angle = calculate_angle(right_elbow, right_wrist, right_index)
            arm_angle = calculate_angle(left_shoulder, right_shoulder, right_elbow)
            
            # Store landmarks
            landmarks3D = []
            for i in range(33):
                pt = get_3d_point(landmarks, i, width, height)
                landmarks3D.append(pt if pt else [np.nan, np.nan, np.nan])
            
            # Normalize pose orientation (align shoulders with x-axis)
            landmarks3D = normalize_pose_orientation(landmarks3D)
            
            pose_data.append({
                'state': state,
                'time': current_time,
                'elbow_angle': float(elbow_angle) if elbow_angle else None,
                'wrist_angle': float(wrist_angle) if wrist_angle else None,
                'arm_angle': float(arm_angle) if arm_angle else None,
                'landmarks': landmarks3D
            })
            
            if (frame_idx - start_frame) % 5 == 0:
                print(f"  Processed frame {frame_idx}...")
        else:
            # Still add data point even if pose not detected
            pose_data.append({
                'state': 'neutral',
                'time': current_time,
                'elbow_angle': None,
                'wrist_angle': None,
                'arm_angle': None,
                'landmarks': [[np.nan, np.nan, np.nan]] * 33
            })
    
    cap.release()
    
    print(f"\nExtracted {len(pose_data)} data points from frames 130-148")
    
    # Save data
    output_dir = Path('player_data')
    output_dir.mkdir(exist_ok=True)
    
    json_path = output_dir / f'{player_name}_benchmark.json'
    js_path = output_dir / f'{player_name}_benchmark.js'
    
    with open(json_path, 'w') as f:
        json.dump(pose_data, f, indent=2)
    
    js_content = f"// {player_name.upper()} benchmark data (frames 130-148 - shooting motion)\n"
    js_content += f"const lebron_data = " + json.dumps(pose_data, indent=2) + ";\n"
    
    with open(js_path, 'w') as f:
        f.write(js_content)
    
    print(f"\n✅ Data saved to: {json_path}")
    print(f"✅ JavaScript saved to: {js_path}")
    
    # Show stats
    valid_angles = [d for d in pose_data if d['elbow_angle'] is not None]
    print(f"\nStats:")
    print(f"  Total frames: {len(pose_data)}")
    print(f"  Frames with valid angles: {len(valid_angles)}")
    if valid_angles:
        elbow_angles = [d['elbow_angle'] for d in valid_angles]
        print(f"  Elbow angle range: {min(elbow_angles):.1f}° - {max(elbow_angles):.1f}°")
        print(f"  Average elbow angle: {sum(elbow_angles)/len(elbow_angles):.1f}°")
    
    return pose_data

if __name__ == "__main__":
    video_path = "lebron_shot.mp4"
    player_name = "lebron"
    
    if not os.path.exists(video_path):
        print(f"Error: Video file not found: {video_path}")
        exit(1)
    
    process_frames_130_148(video_path, player_name)
    print("\n✅ Complete! LeBron's data now uses frames 130-148 only.")

