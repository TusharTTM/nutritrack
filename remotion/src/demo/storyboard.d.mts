export declare const FPS: number;
export declare const W: number;
export declare const H: number;
export declare const SCREEN_FILES: string[];
export declare const PHONE_H: number;
export declare const PHONE_W: number;
export declare const PHONE_X: number;
export declare const PHONE_Y: number;
export declare const PHONE_S: number;
export declare const DURATION: number;

export interface HandState {
  x: number;
  y: number;
  press: number;
  ripple: number;
  rx: number;
  ry: number;
}

export interface BadgeState {
  x: number;
  y: number;
  text: string;
  p: number;
}

export interface SlideState {
  slide: { id: string; kind: string; screen?: string; start: number; dur: number };
  index: number;
  local: number;
  enter: number;
  exit: number;
  opacity: number;
  data: Record<string, unknown> | null;
  hand: HandState | null;
  badge: BadgeState | null;
}

export interface FrameState {
  frame: number;
  layers: SlideState[];
  active: SlideState | null;
  dots: { total: number; active: number };
  counter: string;
  progress: number;
}

export declare function stateAt(frame: number): FrameState;
