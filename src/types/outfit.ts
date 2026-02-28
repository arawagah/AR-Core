export type Category =
  | 'TOP'
  | 'BOTTOM'
  | 'FULL_OUTFIT'
  | 'DRESS'
  | 'OUTERWEAR'
  | 'ACCESSORIES';

export interface ControlPoints {
  leftShoulder?: [number, number];
  rightShoulder?: [number, number];
  leftHip?: [number, number];
  rightHip?: [number, number];
  leftKnee?: [number, number];
  rightKnee?: [number, number];
  leftAnkle?: [number, number];
  rightAnkle?: [number, number];
  neck?: [number, number];
  head?: [number, number];
}

export interface ControlData {
  id: string;
  type: string;
  controlPoints: ControlPoints;
  zLayer: number;
  referenceWidth: number;  // Asset width in pixels
  referenceHeight: number; // Asset height in pixels
}

export interface Outfit {
  id: string;
  name: string;
  category: Category;
  assetPath: string;
  thumbnailPath?: string | null;
  controlData: ControlData;
  zLayer: number;
  colorHex?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OutfitSelection {
  outfit: Outfit;
  scale: number;      // User-adjusted scale via pinch gesture
  offsetX: number;    // User-adjusted offset
  offsetY: number;
}
