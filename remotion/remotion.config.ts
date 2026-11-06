import { Config } from "@remotion/cli/config";

// Master composition: 1920x1080 @ 60fps, 1800 frames (30s) — set in Root.tsx.
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Concurrency auto-adapts to the machine's CPU cores (do not over-set it).
// A central safe area is respected by the layout so the video can be
// re-framed for vertical (9:16) and square (1:1) without losing key content.
