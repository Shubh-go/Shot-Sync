#!/usr/bin/env python3
"""
Process video files to extract professional player shot data.
This script processes video files and extracts pose data in the same format
as the app's recording system.

Usage:
    python process_player_video.py <video_file> <player_name>
    
Example:
    python process_player_video.py curry_shot.mp4 curry
"""

import cv2
import mediapipe as mp
import numpy as np
import json
import sys
import os
from pathlib import Path

# MediaPipe setup
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

pose = mp_pose.Pose(
    model_complexity=2,
    static_image_mode=False,
    smooth_landmarks=True,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.7
)

# ====================== UTILITY FUNCTIONS ======================

def get_3d_point(landmarks, index, width, height):
    """Extract 3D point from MediaPipe landmarks."""
    if index >= len(landmarks) or landmarks[index].visibility < 0.5:
        return None
    return [
        landmarks[index].x * width,
        landmarks[index].y * height,
        landmarks[index].z * width  # Scale z by width for consistency
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

# ====================== VIDEO PROCESSING ======================

def process_video(video_path, player_name):
    """Process video file and extract shot data."""
    print(f"Processing video: {video_path}")
    print(f"Player: {player_name}")
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return None
    
    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    print(f"Video properties: {width}x{height} @ {fps} fps")
    
    pose_data = []
    previous_stage = "neutral"
    recording_active = False
    seen_follow_through = False
    start_time = None
    frame_count = 0
    
    print("\nProcessing frames...")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        current_time = frame_count / fps
        
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
            
            # State machine logic (same as app.js)
            if state != previous_stage:
                if state == "pre_shot" and not recording_active:
                    recording_active = True
                    seen_follow_through = False
                    start_time = current_time
                    pose_data = []  # Reset data when starting new recording
                elif state == "neutral" and recording_active and not seen_follow_through:
                    recording_active = False
                    seen_follow_through = False
                    start_time = None
                    pose_data = []
                elif state == "follow_through" and recording_active:
                    seen_follow_through = True
                elif state == "pre_shot" and recording_active and seen_follow_through:
                    # Shot completed
                    elapsed = current_time - start_time
                    pose_data.append({
                        'state': state,
                        'time': elapsed,
                        'elbow_angle': float(elbow_angle) if elbow_angle else None,
                        'wrist_angle': float(wrist_angle) if wrist_angle else None,
                        'arm_angle': float(arm_angle) if arm_angle else None,
                        'landmarks': landmarks3D
                    })
                    break  # Shot complete, stop processing
                previous_stage = state
            
            # Record frames while actively recording
            if recording_active:
                elapsed = current_time - start_time
                pose_data.append({
                    'state': state,
                    'time': elapsed,
                    'elbow_angle': float(elbow_angle) if elbow_angle else None,
                    'wrist_angle': float(wrist_angle) if wrist_angle else None,
                    'arm_angle': float(arm_angle) if arm_angle else None,
                    'landmarks': landmarks3D
                })
        
        # Progress indicator
        if frame_count % 30 == 0:
            print(f"  Processed {frame_count} frames...", end='\r')
    
    cap.release()
    print(f"\n\nProcessed {frame_count} frames")
    print(f"Extracted {len(pose_data)} data points")
    
    if len(pose_data) == 0:
        print("Warning: No shot data extracted. Make sure the video shows a clear shooting motion.")
        return None
    
    return pose_data

def save_player_data(data, player_name, output_dir="player_data"):
    """Save extracted data to JSON file."""
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f"{player_name}_benchmark.json")
    
    with open(output_file, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\nData saved to: {output_file}")
    return output_file

def convert_to_js_format(json_file, player_name):
    """Convert JSON data to JavaScript format for app.js."""
    with open(json_file, 'r') as f:
        data = json.load(f)
    
    # Convert to JavaScript array format
    js_code = f"// {player_name.upper()} benchmark data\n"
    js_code += f"const {player_name}_data = {json.dumps(data, indent=2)};\n"
    
    output_file = json_file.replace('.json', '.js')
    with open(output_file, 'w') as f:
        f.write(js_code)
    
    print(f"JavaScript format saved to: {output_file}")
    return output_file

# ====================== MAIN ======================

def main():
    if len(sys.argv) < 3:
        print("Usage: python process_player_video.py <video_file> <player_name>")
        print("\nExample:")
        print("  python process_player_video.py curry_shot.mp4 curry")
        print("\nPlayer names: curry, lebron, jordan, durant, clark")
        sys.exit(1)
    
    video_path = sys.argv[1]
    player_name = sys.argv[2]
    
    if not os.path.exists(video_path):
        print(f"Error: Video file not found: {video_path}")
        sys.exit(1)
    
    # Process video
    data = process_video(video_path, player_name)
    
    if data is None:
        print("\nFailed to extract data from video.")
        sys.exit(1)
    
    # Save data
    json_file = save_player_data(data, player_name)
    js_file = convert_to_js_format(json_file, player_name)
    
    print("\n" + "="*60)
    print("SUCCESS! Data extracted and saved.")
    print("="*60)
    print(f"\nTo use this data in your app:")
    print(f"1. Open {js_file}")
    print(f"2. Copy the data array")
    print(f"3. Replace the data in app.js for {player_name} in initializeProPlayerBenchmarks()")
    print("\nOr manually update the proPlayerBenchmarks object in app.js")

if __name__ == "__main__":
    main()

