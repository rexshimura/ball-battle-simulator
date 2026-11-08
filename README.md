# Ball Battle Simulator

An arcade-style 2D physics battle simulator built with React 19, HTML5 Canvas, WebGL, and Vite.

## Unique Ball Mechanics

### Accelerator Ball (Unique)
- Accelerates continuously over the course of battle up to 12.0 max speed.
- Kinetic collision damage scales proportionally with velocity.
- Emits high-speed streak particle trails and custom impact SFX.

### Gun Ball (Unique)
- Mounted rotating heavy firearm that targets and fires high-caliber projectiles (32 DMG) every 3 seconds.
- Custom muzzle flare, bullet physics, and ricochet mechanics.

### Knife Ball (Rare)
- Equipped with a compact combat knife spinning rapidly at double speed.
- Delivers close-quarters slashing damage (15 DMG) with precision contact hitboxes.

### Shard Ball (Unique)
- Direct enemy contact locks on and fires 6 consecutive homing shards (1 DMG each).
- Inflicts Shard Target status with custom purple crystal trail effects.

## Epic Ball Mechanics

### Thorn Ball (Epic)
- Direct body impact inflicts -2 -1 Bleed.
- Bouncing off perimeter walls sprouts permanent creeping floral Thorns into the arena:
  - **S (~42px)**: Single twisting climbing stalk with root anchors, ivy leaves, and rosebud.
  - **M (~68px)**: Intertwined dual climbing vines with side branches and thorns.
  - **L (~96px)**: Braided tree-like vine with lateral shoots and crimson wild rose blossom.
- Features continuous segment collision detection (`distToSegment`) dealing 2 damage and -1 -1 Bleed to trespassing enemies.

## Visual & Audio Systems

- **WebGL LaserFlow Victory Aura**: Real-time GLSL shader that tracks the solo champion ball and cradles it dead-center in a golden teardrop aura with organic particle dust and light blooms.
- **Combat Telemetry & HUDs**: Real-time HP bars, damage dealt counters, dynamic status effect badges, and detailed round victory summaries.
- **Interactive Effects Codex**: Searchable in-game reference modal detailing all active skills, passive traits, and status ailments.
- **Audio Sound Manager**: Multi-channel audio pooling with intelligent cooldown throttling to eliminate clipping during intense multi-ball clashes.



