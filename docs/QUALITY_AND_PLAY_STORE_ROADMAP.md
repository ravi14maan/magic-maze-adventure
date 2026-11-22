# Magic Maze Adventure — Quality & Google Play Roadmap

**Product direction:** a polished, offline-first, child-friendly fantasy maze adventure created with Ahana.

This roadmap separates implemented features from release goals. A feature is not considered complete until it is implemented, tested on target Android devices, reviewed for child safety, and included in a reproducible build.

## Product principles

- Preserve the approved character artwork Ahana selected. Do not replace it with newly supplied photos or unrelated character designs.
- Keep the experience friendly, non-violent, age-appropriate and understandable without reading long instructions.
- Prefer offline gameplay and local profiles. Do not add accounts, chat, location, camera, microphone, or photo upload unless there is a clear parent-approved need and a privacy review.
- No manipulative timers, loot boxes, pay-to-win mechanics, or pressure-based purchase prompts.
- Design for low/mid-range Android devices, small screens, tablets, interrupted sessions and limited connectivity.
- Use original or properly licensed art, music, sound and video. Keep attribution and licence records.

## Milestones

### Q1 — Visual vertical slice (current)

- Add subtle, world-themed ambient motion to maze scenes.
- Preserve the twelve-hero roster and approved art.
- Review all hero portraits and in-maze rendering at phone and tablet sizes.
- Improve parallax layers, lighting, particles and readable foreground/background separation.
- Deliver one fully polished sample level in the Enchanted Forest before applying the art system to all worlds.

**Exit criteria:** approved screenshots/video capture of the level on at least one low-end and one current Android device; no missing assets; stable frame pacing.

### Q2 — Character presentation

- Produce consistent original character turnarounds and animation sheets for all twelve heroes.
- Implement distinct idle, walk/run, jump, land, celebrate and interaction animations.
- Add character-specific visual effects sparingly (fairy sparkle, ice shimmer, unicorn trail, etc.).
- Validate animation timing, silhouette readability and sprite atlas memory use.

**Exit criteria:** every unlocked hero is recognisable in the closet and during gameplay; no emoji-only fallback for the main hero.

### Q3 — World art and gameplay depth

- Create a visual bible for ten launch worlds: palette, architecture, flora/fauna, hazards, music identity and signature set piece.
- Build layered backgrounds with foreground props and subtle ambient animation.
- Add interactive objects, secret routes, friendly creatures and world-specific puzzles.
- Keep maze navigation clear; decoration must never hide collision boundaries or hazards.
- Author and play-test a difficulty curve rather than relying only on increasing numeric difficulty.

**Exit criteria:** one complete five-level world polished and play-tested before scaling the visual treatment across the campaign.

### Q4 — Audio and cinematic moments

- Commission or create original looping world themes and short interaction sounds.
- Include separate music/effects volume controls, mute, audio focus handling and pause/resume behavior.
- Use short in-engine animated sequences for entrances, world transitions and rewards.
- Use video only where it adds clear value; prefer lightweight, skippable, offline-capable in-engine animation to streaming video in core gameplay.
- Avoid autoplay with sound and provide accessible visual alternatives.

**Exit criteria:** no audio continues unexpectedly after leaving gameplay; assets are licensed; memory and download size budgets are met.

### Q5 — Engineering quality

- Add automated unit, integration and end-to-end tests for profile isolation, unlocks, rewards, save recovery and core play.
- Test Android lifecycle: background/foreground, rotation policy, low memory, audio interruptions and app updates.
- Profile startup, memory, battery, thermal behavior and frame rate on representative low/mid/high Android devices.
- Add crash reporting only after a privacy review and appropriate disclosure/consent.
- Add accessibility: scalable text, contrast, reduced motion option, non-colour-only cues and simple controls.

**Exit criteria:** release candidate has no known blocker bugs; automated checks pass; device test matrix is recorded.

### Q6 — Child safety and Google Play readiness

- Confirm the intended age groups with the parent/product owner and complete Play Console target-audience and content declarations accurately.
- Publish a privacy policy that matches actual app and SDK behavior.
- Complete Data safety, IARC content rating, ads declaration and app access instructions accurately.
- Keep the initial release ad-free and without real-money purchases unless a separate policy, legal and parent review approves a change.
- Audit all dependencies and SDKs; do not add third-party SDKs without a documented purpose and data review.
- Verify Families policy requirements for every target age group and distribution region.
- Prepare store icon, feature graphic, screenshots, short/full descriptions and support contact.
- Use Play App Signing and a protected release process; never commit signing keys or credentials.

**Exit criteria:** parent approves the release candidate, disclosures, store listing and country availability before submission.

## Release strategy

1. Internal testing with parent-approved devices and a small group of trusted testers.
2. Closed testing with structured feedback and crash/performance review.
3. Fix issues and repeat regression testing.
4. Staged production rollout with monitoring and a rollback plan.
5. Expand availability only after stability, support and content readiness are demonstrated.

## Current implementation note

The codebase currently uses Phaser 3, TypeScript, Vite and Capacitor. It contains a twelve-hero character definition and a procedural side-scrolling maze scene. The current Android workflow produces a debug APK artifact; that is not a production-signed Play Store release. Do not describe the game as Play-ready until the Q5 and Q6 exit criteria are met.
