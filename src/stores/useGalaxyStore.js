import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useGalaxyStore = create(
    persist(
        (set, get) => ({
            // Map view
            offsetX: 0,
            offsetY: 0,
            scale: 1,

            // Star selection and memory
            selectedStar: null,
            selectedPlanet: null,
            visitedStars: [],
            homeSystem: null,

            // Filters
            factionFilter: 'All',
            starTypeFilter: 'All',

            // Actions
            setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
            setScale: (scale) => set({ scale }),

            adjustOffset: (dx, dy) => {
                const { offsetX, offsetY } = get();
                set({ offsetX: offsetX + dx, offsetY: offsetY + dy });
            },


            setSelectedStar: (star) => {
                const visited = get().visitedStars;
                if (!visited.includes(star.name)) {
                    set({ visitedStars: [...visited, star.name] });
                }
                set({ selectedStar: star });
            },
            clearSelectedStar: () => set({ selectedStar: null }),

            setSelectedPlanet: (planet) => set({ selectedPlanet: planet }),
            clearSelectedPlanet: () => set({ selectedPlanet: null }),

            setHomeSystem: (system) => set({ homeSystem: system }),
            clearHomeSystem: () => set({ homeSystem: null }),

            setFactionFilter: (faction) => set({ factionFilter: faction }),
            setStarTypeFilter: (type) => set({ starTypeFilter: type }),

            resetGalaxy: () =>
                set({
                    offsetX: 0,
                    offsetY: 0,
                    scale: 1,
                    selectedStar: null,
                    selectedPlanet: null,
                    visitedStars: [],
                    homeSystem: null,
                }),
        }),
        {
            name: 'galaxy-store',
            partialize: (state) => ({
                offsetX: state.offsetX,
                offsetY: state.offsetY,
                scale: state.scale,
                visitedStars: state.visitedStars,
                homeSystem: state.homeSystem,
            }),
        }
    )
);
