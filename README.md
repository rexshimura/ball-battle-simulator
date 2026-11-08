# ⚔️ Ball Battle Simulator

An action-packed, 2D physics-driven battle simulator built with **React 19**, **HTML5 Canvas**, **WebGL**, and **Vite**.

Build custom team match-ups, aim trajectory angles, and watch distinct ball classes clash in high-speed, kinetic arena combat featuring specialized weapons, status effects, and real-time physics collisions!

---

## 🎮 Gameplay Showcase

### 🎯 1. Interactive Arena Setup & Aiming
Drag and drop any ball from the roster onto **Side A (Blue)** or **Side B (Red)**. Drag from any placed ball to set its initial launch angle and speed vector, adjust positions freely, or remove balls with a single click before starting the match.

<p align="center">
  <img src="public/gif/bbs-gif3.gif" alt="Setting Ball Trajectory and Placement" width="100%" />
</p>

---

### 💥 2. High-Impact Physics Battles
Once unleashed, balls bounce off perimeter walls and collide with authentic momentum conservation, kinetic knockback, weapon sweeps, and projectile ballistics.

<p align="center">
  <img src="public/gif/bbs-gif1.gif" alt="Ball Battles Combat Showcase 1" width="100%" />
</p>

<p align="center">
  <img src="public/gif/bbs-gif2.gif" alt="Ball Battles Combat Showcase 2" width="100%" />
</p>

---

## 🕹️ Game Controls & How to Play

| Phase | Action | Control |
| :--- | :--- | :--- |
| **Planning** | **Add Ball** | Select any ball from the sidebar roster and click on the arena (Left = Blue, Right = Red). |
| **Planning** | **Aim Trajectory** | Click and drag away from any placed ball to aim its starting launch direction and initial speed vector. |
| **Planning** | **Move Ball** | Drag an existing ball to reposition it within its team's territory. |
| **Planning** | **Remove Ball** | Click the red delete icon on any selected ball or clear all with the Reset button. |
| **Battle** | **Start Battle** | Click **Start Battle** to unleash all balls simultaneously into the arena. |
| **Battle** | **Pause / Resume** | Freeze the action at any moment to inspect current trajectories and health telemetry. |
| **Battle** | **Replay / Reset** | Quick **Retry Battle** with the exact same initial setup or start a fresh match with **New Battle**. |

---

## 🔮 Ball Classes & Rarity Tiers

Combatants in Ball Battle Simulator are categorized into **5 distinct rarity tiers**, spanning agile baseline brawlers, armored tanks, kinetic speedsters, artillery cannons, and botanical hazard planters — **with many more ball classes and abilities actively on the way!**

- **⚪ Common**: Baseline combatants (e.g., *Normal*, *Fast*, *Big*) ideal for frontline engagements, rapid scouting, and momentum-based swarms.
- **🟢 Uncommon**: Armored units and blade specialists (e.g., *Stone*, *Steel*, *Sword*, *Spike*) featuring kinetic shields, puncture spikes, and bleed immunity.
- **🔵 Rare**: Tactical fighters and scaling behemoths (e.g., *Glass*, *Hammer*, *Grow*, *Knife*) equipped with brittle shard bursts, heavy knockback warhammers, rapid combat knives, and dynamic size growth.
- **🟣 Unique**: Advanced weapon systems and scaling speedsters (e.g., *Accelerator*, *Shard*, *Gun*) featuring velocity-scaled kinetic damage, homing crystal volleys, and rotating high-caliber firearms.
- **🌸 Epic**: Masters of environmental warfare (e.g., *Thorn*) capable of permanently claiming the arena perimeter with creeping floral vines and lethal bleed ailments.

> 💡 *You can inspect every unit's live combat stats, passives, and weapon scaling at any time during gameplay via the in-game **Effects & Weapons Codex**!*

---

## ⚡ Status Effects & Combat Mechanics

- **🩸 Bleed**: True damage ticks dealt directly to unit health over time. Armored units (Stone, Spike, Steel) resist or mitigate bleed effects.
- **🛡️ Shield**: Extra temporary barrier points that absorb incoming damage before touching baseline health.
- **🏋️ Heavy**: High-density chassis that resists knockback displacement, standard on Stone Ball and earned by Grow Ball upon expanding past 2.8 size (+30% HP boost).
- **🚀 Accelerate**: Dynamic kinetic state where collision damage rises in direct proportion to current velocity.
- **🎯 Shard Target**: Locks an enemy as the target for consecutive homing crystal volleys.
- **🌿 Thorns Hazard**: Permanent creeping botanical traps anchored to perimeter walls that reach into the arena, damaging and bleeding enemy units that cross their path.

---

## 🌟 Visual & Audio Polish

- **WebGL LaserFlow Victory Spotlight**: GLSL fragment shader rendering a dynamic golden illumination beam that cradles the solo match victor dead-center upon victory.
- **Real-Time Telemetry HUD**: Interactive health bars, live damage dealt metrics, team survivor counters, and an in-depth victory breakdown card.
- **Searchable Effects Codex**: Comprehensive in-game modal detailing every ball trait, status condition, and weapon attribute.
- **Throttled Sound Suite**: Over 25 spatial sound effects with channel pooling and intelligent cooldown throttling to prevent audio distortion during chaotic clashes.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/rexshimura/ball-battle-simulator.git

# Enter project directory
cd ball-battle-simulator

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open your browser at `http://localhost:5173` to play!

---

## 📜 License
Distributed under the **Apache License 2.0**. See [`LICENSE`](./LICENSE) for full terms and conditions. Built with passion for retro arcade physics and battle simulators.
