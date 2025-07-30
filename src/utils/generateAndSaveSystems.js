// generateAndSaveSystems.js

// --- 1. Import your functions ---
// Adjust these paths based on where your functions are located
// import { synthesizeStarSystem } from './src/utils/systemSynthesis.js'; // Example path
// import { saveThingsToDatabase } from './src/utils/dbUtils.js';     // Example path
// import { generateFullStarProfile } from './src/utils/starProfileGenerator.js'; // NEW: Import star generator

import { generateFullStarProfile } from './starUtils.js';
import { saveThingsToDatabase } from './storageUtils.js';
import { synthesizeStarSystem } from './synthesisUtils.js';


// You might also need to import other utilities that these functions depend on,
// e.g., synthesizePlanetarySystem, generateFaction, uuidv4 etc.
// Ensure all dependencies are importable in this Node.js environment.

// --- 2. Define the loop parameters ---
const PAUSE_DURATION_MS = 2000; // 2 seconds
let isRunning = true; // Control flag to stop the loop

// --- 3. The asynchronous loop function ---
async function generateAndSaveLoop() {
    let iteration = 0;
    while (isRunning) {
        iteration++;
        console.log(`\n--- Starting Iteration ${iteration} ---`);

        let generatedStar = null;
        let fullSystem = null;

        try {
            // >>> Generate Star
            generatedStar = generateFullStarProfile();

            if (!generatedStar || !generatedStar.id || !generatedStar.name) {
                console.warn(`Iteration ${iteration}: generateFullStarProfile returned an invalid star. Skipping this iteration.`);
                await new Promise(resolve => setTimeout(resolve, PAUSE_DURATION_MS));
                continue;
            }
            console.log(`Iteration ${iteration}: Generated Star: ${generatedStar.name} (ID: ${generatedStar.id})`);

            // >>>>>> Generate Star System
            fullSystem = synthesizeStarSystem(generatedStar);

            if (!fullSystem) {
                console.warn(`Iteration ${iteration}: synthesizeStarSystem returned null for star ${generatedStar.name}. Skipping save.`);
                await new Promise(resolve => setTimeout(resolve, PAUSE_DURATION_MS));
                continue;
            }

            console.log(`Iteration ${iteration}: Synthesized system: ${fullSystem.starName || fullSystem.name} (ID: ${fullSystem.starId || fullSystem.id})`);

            // Save the generated system to the database
            const saveResult = await saveThingsToDatabase("postStarSystem", fullSystem);
            console.log(`Iteration ${iteration}: Save successful! Result:`, saveResult);

        } catch (error) {
            console.error(`Iteration ${iteration}: An error occurred:`, error);
            // Log the full error object for better debugging
            if (error.stack) {
                console.error("Stack trace:", error.stack);
            }
        }

        // Pause for the defined duration
        console.log(`Iteration ${iteration}: Pausing for ${PAUSE_DURATION_MS / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, PAUSE_DURATION_MS));
    }
    console.log("Loop stopped.");
}

// --- 4. Start the loop ---
console.log("Starting continuous star system generation and saving. Press Ctrl+C to stop.");
generateAndSaveLoop();

// --- 5. Handle process termination (Ctrl+C) ---
process.on('SIGINT', () => {
    console.log("\nStopping loop gracefully...");
    isRunning = false; // Set flag to false to break the while loop
    process.exit(0); // Exit the Node.js process
});