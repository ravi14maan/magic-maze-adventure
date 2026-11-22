# Original 3D hero model set

This milestone generates a consistent set of original 3D fantasy characters using Blender, with both GLB models and transparent PNG renders for the game UI.

## Included heroes

- normal-girl — Mira the Explorer
- normal-boy — Leo the Maze Master
- unicorn — Starlight Unicorn
- witch — Willow the Spellkeeper
- princess — Princess Rosalia
- mermaid — Coral the Mermaid
- fairy — Luna the Fairy
- dragon-rider — Ember the Dragon Rider
- star-explorer — Nova the Star Explorer
- crystal-knight — Crystal Knight
- prince — Prince Adrian
- ice-mage — Aurora the Ice Mage

Legacy IDs `male-explorer` and `knight` map to star-explorer and crystal-knight.

## Art direction

Premium storybook 3D toy characters with consistent scale and proportions, rounded sculpted forms, expressive eyes and smiles, layered costumes, detailed signature accessories, PBR materials, soft studio lighting and transparent portrait renders. All geometry is generated from original procedural meshes and does not use third-party character IP.

## Outputs

- `public/assets/characters3d/<hero-id>.glb` — original static 3D model for each hero.
- `public/assets/characters3d/previews/<hero-id>.png` — transparent studio render used by the character closet and in-game hero sprite.
- `public/assets/characters3d/manifest.json` — model and preview inventory.

The current app displays the high-quality PNG renders. The GLB files are shipped with the app as the source 3D assets for a later interactive 3D renderer.

## Important scope

The models are detailed static posed meshes, not yet skeletal-rigged or animated. The current Phaser runner uses the rendered PNG portraits as character sprites; it does not yet load GLB geometry in a real-time 3D scene. A follow-on milestone should add a shared humanoid rig, skin weights, facial controls, idle/run/jump/land/celebrate clips, and a Three.js or Babylon.js runtime.

## Regenerate

Requires Blender 4.x:

```bash
blender --background --python tools/generate_hero_models_blender.py
```

The Android build workflow installs Blender, generates the GLB models and PNG portraits, then compiles the debug APK.
