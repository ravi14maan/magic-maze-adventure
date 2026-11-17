# Original 3D hero model set

This milestone produces one original glTF Binary (.glb) model for each of the 12 art-ready heroes.

## Assets
The generation workflow emits `public/assets/characters3d/` with:
normal-girl, normal-boy, unicorn, witch, princess, mermaid, fairy, dragon-rider, star-explorer, crystal-knight, prince and ice-mage, plus a manifest.

The legacy IDs `male-explorer` and `knight` remain compatible aliases for star-explorer and crystal-knight; they are not extra models.

## Art direction
A consistent friendly chibi/fantasy toy style: oversized expressive heads, compact proportions, rounded geometry, soft PBR materials, shared scale, and distinct costume silhouettes, palettes and signature props. All geometry is original and does not use third-party character IP.

## Important scope
These are static posed meshes, not skeletal rigs. They are suitable for asset review and a first 3D visual prototype. Before animated 3D gameplay, add a shared humanoid skeleton, skin weights, facial controls, and idle/run/jump/land/celebrate clips. The current Phaser runner remains 2D/2.5D; this milestone does not replace approved 2D artwork or change gameplay rendering.

GLB source coordinates are Z-up with +Y forward. Rotate +90 degrees around X if importing into a Y-up renderer.

## Regenerate
```bash
python -m pip install trimesh numpy
python tools/generate_hero_models.py
```
