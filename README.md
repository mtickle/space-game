# 🌌 Starweave: Galactic Cartography Mainframe

## 🚀 Overview

**Starweave** is a dynamic frontend interface and procedural generation engine for a massive, unexplored galaxy. Built with React and HTML5 Canvas, it allows users to navigate a sprawling starfield, click on unknown stars, and instantly generate rich, highly detailed star systems on the fly.

Designed with a sleek, retro-futuristic terminal aesthetic, Starweave handles everything from orbital mechanics to complex atmospheric compositions and political alliances.

## ✨ Key Features

* **Interactive Starfield:** A fully interactive HTML5 Canvas star map with panning, zooming, and star selection.

* **Syllabic Star Name Generation:** A custom linguistic algorithm that dynamically generates organic, alien-sounding star names (Start + Mid + End segments) to ensure millions of unique, readable combinations.

* **Deep Procedural Systems:** When a new star is discovered, the engine generates:

  * **Planets:** Over 50 distinct planet types (e.g., *Chthonian, Sub-Glacial, Magma Ocean, Gas Dwarf*) complete with size and base-type mapping.

  * **Atmospheres:** Realistic and exotic atmospheric profiles tied to planet types (e.g., *Helium-rich, Thin Martian, Plasma, Unknown Organic*).

  * **Moons:** Up to 3 moons per planet drawn from a pool of 50 classifications (e.g., *Tidally Locked, Irregular, Spore, Cybernetic*).

* **Political Alliances:** Systems are dynamically assigned to one of 12 distinct galactic factions, each with its own alignment (e.g., *Lawful Good Terran Federation*, *Chaotic Evil Obsidian Syndicate*).

* **Orbital System Viewer:** Dive into a specific star system to watch planets physically orbit their parent star in real-time, rendered smoothly on a dedicated Canvas layer.

* **Immersive UI:** Built with Tailwind CSS and Lucide React icons, featuring a glowing, dark-mode terminal UI that makes you feel like a true galactic navigator.

## 🛠️ Tech Stack

* **Framework:** React

* **Styling:** Tailwind CSS

* **Rendering:** HTML5 Canvas API

* **Icons:** Lucide React

* **Build Tool:** Vite (Recommended)

## 📦 Quick Start

1. **Clone the repository:**

   git clone https://github.com/mtickle/space-game.git
   cd starweave

2. **Install dependencies:**

   npm install

3. **Run the development server:**

   npm run dev

4. **Explore:**
   Open `http://localhost:5173` in your browser. Click on any star in the field to initiate a deep-space system scan!

## 🧬 Data Structures

Starweave is built to be easily extensible. All generation data is separated into clean, modular constants:

* `planetTypes`: Array of objects defining type, color, weight, and base atmospheric type.

* `atmosphereProfiles`: Deep dictionary mapping elements and percentages to specific planet bases.

* `moonTypes`: Extensive array of lunar descriptors.

* `alliances`: Faction data including D&D-style alignments and UI colors.

* `nameSegments`: Syllabic arrays (starts, mids, ends) used by the `generateStarName()` function.

## 🤝 Contributing

This galaxy is vast and always expanding. Contributions are welcome! Whether it's adding new planet types, refining the orbital math, or integrating a backend database for persistent universe tracking, feel free to open a Pull Request.

## 📜 License

[MIT License](LICENSE) - Explore the cosmos freely.
