# Provider notes for video-lipsync-pipeline

## Purpose
Use this file when a request depends on realistic singer motion, lip sync, or exact provider limitations.

## Working lessons from this workspace

### 1. Generic image-to-video is not the same as true lip sync
A model may create convincing singing-like motion without being driven by the supplied mp3. Do not present that as true audio sync.

### 2. Audio reference support must be verified explicitly
Some providers exposed through `video_generate` accept image input but reject or ignore `audioRef`. If the tool says the provider does not support reference audio inputs, stop using that branch for lip-sync claims.

### 3. Exact image size matters
Some models are strict about allowed dimensions. Example pattern: a portrait image may need exact `720x1280` or another approved size, not merely a matching aspect ratio.

### 4. Premium models may be blocked by plan/token limits
If a provider rejects a request because the active plan does not support the model, treat that as a routing limitation, not a creative failure.

## Recommended sequence

### For a new singer-video request
1. Run `video_generate action=list`.
2. Note which models support:
   - image-to-video
   - duration needed
   - reference audio, if required
3. Prepare a short vertical test.
4. Generate the smallest useful proof.
5. Only escalate duration or quality after approval.

## Suggested framing for users
- "muestra visual" when it is motion proof only
- "sincronía real con tu audio" only when the pipeline genuinely uses the supplied audio as reference
- "vamos primero con 10 a 20 segundos" for validation before long renders
