// src/store/useGalaxyStore.js
import { create } from 'zustand';

const useGalaxyStore = create((set) => ({
    offsetX: 0,
    offsetY: 0,
    scale: 1,

    selectedStar: null,
    hoveredStar: null,

    factionFilter: 'All',
    starTypeFilter: 'All',
    showVisited: false,

    setOffsetX: (x) => set({ offsetX: x }),
    setOffsetY: (y) => set({ offsetY: y }),
    setScale: (s) => set({ scale: s }),

    setSelectedStar: (star) => set({ selectedStar: star }),
    setHoveredStar: (star) => set({ hoveredStar: star }),

    setFactionFilter: (filter) => set({ factionFilter: filter }),
    setStarTypeFilter: (filter) => set({ starTypeFilter: filter }),
    setShowVisited: (val) => set({ showVisited: val }),
}));

export default useGalaxyStore;
