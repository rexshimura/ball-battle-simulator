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

## 🏆 Complete Roster of Ball Classes

The simulator features **15 unique ball combat archetypes** balanced across 5 rarity tiers:

### ⚪ Common Tier
*Baseline combatants suitable for swarming and frontline engagements.*

| Ball | Stats (HP / DMG / SPD) | Combat Specialty |
| :--- | :---: | :--- |
| **Normal Ball** | 100 HP · 10 DMG · 2.2 SPD | Standard baseline warrior with balanced weight and reliable body bump damage. |
| **Fast Ball** | 100 HP · 7 DMG · 3.6 SPD | Lightweight speedster that darts around the arena to outmaneuver slower opponents. |
| **Big Ball** | 100 HP · 12 DMG · 1.9 SPD | High-mass heavyweight capable of delivering heavy momentum displacement on impact. |

---

### 🟢 Uncommon Tier
*Specialized units equipped with basic armaments, shields, or fortified armor.*

| Ball | Stats (HP / DMG / SPD) | Combat Specialty |
| :--- | :---: | :--- |
| **Stone Ball** | 130 HP · 8 DMG · 1.3 SPD | **Heavy Armor**: Boasts +30% bonus HP (130 HP), heavy mass (2.6), and rocky shell completely immune to bleed. |
| **Steel Ball** | 100 HP · 11 DMG · 2.1 SPD | **Kinetic Barrier**: Automatically generates a +20 Shield energy barrier every 4 hits taken. |
| **Sword Ball** | 100 HP · 6 DMG · 2.1 SPD | **Spinning Blade**: Armed with a rotating steel broadsword that deals heavy slashing damage (22 DMG) on contact. |
| **Spike Ball** | 100 HP · 15 DMG · 2.0 SPD | **Puncture Spikes**: Armored frame covered in steel spikes dealing heavy puncture damage (15 DMG) with bleed immunity. |

---

### 🔵 Rare Tier
*Tactical fighters possessing area control, size growth, or advanced melee weapons.*

| Ball | Stats (HP / DMG / SPD) | Combat Specialty |
| :--- | :---: | :--- |
| **Glass Ball** | 100 HP · 9 DMG · 2.3 SPD | **Brittle Shards**: Fragile crystalline orb that shatters into sharp glass shards upon taking hits, inflicting **Bleed**. |
| **Hammer Ball** | 100 HP · 7 DMG · 1.9 SPD | **Heavy Knockback**: Swings an extended warhammer (24 DMG) that repels enemies with violent kinetic knockback. |
| **Grow Ball** | 100 HP · 9 DMG · 2.2 SPD | **Size Growth & Heavy**: Expands in radius and mass (up to 6.0 mass) upon enemy collision; acquires the **Heavy Effect** at 2.8+ size. |
| **Knife Ball** | 100 HP · 7 DMG · 2.3 SPD | **Rapid Spinning Knife**: Wields a compact combat knife spinning at double rotation speed, dealing rapid 15 DMG slashes in close quarters. |

---

### 🟣 Unique Tier
*High-tech weapon systems and scaling kinetic specialists.*

| Ball | Stats (HP / DMG / SPD) | Combat Specialty |
| :--- | :---: | :--- |
| **Accelerator Ball** | 100 HP · 8 DMG · 2.6 SPD | **Kinetic Acceleration**: Continuously speeds up over time (up to 12.0 max speed); collision damage scales higher as speed increases. |
| **Shard Ball** | 100 HP · 8 DMG · 2.2 SPD | **Homing Shards**: Striking an enemy inflicts *Shard Target* and unleashes 6 consecutive homing crystal shards dealing 1 DMG each. |
| **Gun Ball** | 100 HP · 7 DMG · 2.0 SPD | **Gun Cannon**: Mounts a rotating firearm that fires a high-caliber projectile (32 DMG) every 3 seconds with authentic wall ricochets. |

---

### 🌸 Epic Tier
*Master of arena hazards and environmental bleed traps.*

| Ball | Stats (HP / DMG / SPD) | Combat Specialty |
| :--- | :---: | :--- |
| **Thorn Ball** | 100 HP · 8 DMG · 2.1 SPD | **Thorns & Bleed**: Direct body hits inflict -2 -1 Bleed. Bouncing off walls permanently sprouts creeping floral Thorns (**S**, **M**, **L**) perpendicular into the arena that deal 2 DMG and -1 -1 Bleed. |

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
