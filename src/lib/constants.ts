export const APP_NAME = 'MirrorMe';
export const APP_TAGLINE = 'Try before you buy. In AR. Right now.';
export const ACCENT_COLOR = '#6C5CE7';

// MediaPipe model paths (self-hosted in /public/models/)
export const MEDIAPIPE_WASM_PATH = '/models/mediapipe';
export const POSE_LANDMARKER_MODEL_PATH = '/models/pose_landmarker_lite.task';

// Camera constraints
export const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    facingMode: 'user', // Front camera (selfie/mirror mode)
  },
  audio: false,
};

export const CAMERA_CONSTRAINTS_REAR: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    frameRate: { ideal: 30, min: 15 },
    facingMode: { exact: 'environment' },
  },
  audio: false,
};

// Pose detection settings
export const EMA_ALPHA = 0.7;           // Exponential moving average for landmark smoothing
export const VISIBILITY_THRESHOLD = 0.5; // Min visibility score for rendering
export const POSE_CONFIDENCE_THRESHOLD = 0.5;

// Outfit rendering
export const OUTFIT_OPACITY = 0.88;     // Blend opacity for outfit overlay
export const MESH_SUBDIVISIONS = 4;     // Triangular mesh grid resolution (4x4 = 32 triangles)

// Reference shoulder width in outfit assets (pixels)
// This is the width assumed when creating placeholder assets
export const REFERENCE_ASSET_WIDTH = 300;
export const REFERENCE_ASSET_HEIGHT = 400;

// Asset storage path
export const ASSET_BASE_PATH = '/assets/outfits';

// Category display names
export const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'All',
  TOP: 'Tops',
  BOTTOM: 'Bottoms',
  FULL_OUTFIT: 'Full Outfits',
  DRESS: 'Dresses',
  OUTERWEAR: 'Outerwear',
  ACCESSORIES: 'Accessories',
};
