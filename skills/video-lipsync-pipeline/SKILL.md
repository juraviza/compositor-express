---
name: video-lipsync-pipeline
description: Build realistic singer or talking-head videos from a photo plus song/voice audio. Use when a user wants lip sync, face animation, short music-video tests, or realistic avatar video from a still image, especially when quality, natural motion, provider limitations, aspect-ratio prep, or fallback strategy matter.
---

# Video Lipsync Pipeline

Use this skill to move fast on photo plus audio video requests without repeating the same trial-and-error.

## Quick workflow

1. Identify the ask:
   - photo only plus motion test
   - photo plus real audio lip sync
   - short proof, usually 8 to 20 seconds
   - higher-quality pass after approval
2. Prefer a short test first. Do not start with the full song.
3. Inspect provider capability before generating if the workflow depends on audio-driven lip sync.
4. Prepare assets to the exact shape the provider wants before generation.
5. Generate the smallest convincing sample.
6. If the provider cannot accept audio reference, say so internally and switch pipeline instead of pretending the result is true lip sync.

## Decision rules

### A. User wants realism only, no confirmed audio sync yet
Use image-to-video first to validate:
- face fidelity
- lighting
- micro motion
- camera feel

### B. User wants real lip sync to the supplied audio
Do not rely on generic image-to-video providers unless they explicitly support reference audio. First verify support with `video_generate action=list`.

If the active providers do not support audio reference:
- do not keep retrying the same route
- switch to a two-stage plan: visual motion proof first, then dedicated lip-sync path later
- tell the user only the meaningful summary, not every provider error

### C. User wants long output
Start with 8 to 20 seconds. Get approval. Then scale.

## Asset prep rules

### Image prep
- Match the provider's exact allowed size/aspect ratio.
- For portrait singing clips, prefer 9:16.
- Preserve identity. Do not restyle unless asked.
- When resizing, crop conservatively and keep face centered.

### Audio prep
- Prefer the final mp3 or master.
- For tests, cut a strong 8 to 20 second fragment with clear vocals.
- Use the same fragment repeatedly during iteration so quality comparisons are fair.

## Prompt pattern

Use prompts that lock these points:
- preserve exact identity
- preserve clothing, microphone, studio, and framing if relevant
- request subtle natural mouth movement, blinking, breathing, shoulder motion, and head drift
- forbid cartoon look, face distortion, extra people, beauty-filter skin, or overacting

## Fallback strategy

If generation fails:
1. Check if the failure is size, duration, provider availability, or unsupported audio reference.
2. Fix the exact incompatibility once.
3. Retry with the corrected configuration.
4. If the provider fundamentally cannot do the requested mode, stop that branch and switch approach.

## User communication rule

Only interrupt the user for one of these:
- a working sample
- a real blocker that needs their input
- a meaningful decision, such as visual proof now versus true lip sync later

Do not narrate every failed provider attempt.

## Reference

Read `references/provider-notes.md` when choosing or debugging a provider path.
