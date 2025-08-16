/**
 * Fetches the full details of a star system from the API.
 * If the system doesn't exist, it sends a request to create it.
 * @param {object} star - The basic star object.
 * @returns {Promise<object>} The full star system data from the API.
 */
export const fetchSystemDetails = async (star) => {
    if (!star || !star.id) {
        throw new Error("Invalid star data provided.");
    }

    const apiKey = import.meta.env.VITE_API_KEY;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
        const getResponse = await fetch(`${baseUrl}/api/v1/systems/${star.id}`, {
            headers: { 'x-api-key': apiKey }
        });

        // --- MODIFIED LOGIC ---
        // This block now handles the 404 silently.

        if (getResponse.ok) { // Status is 200-299
            //console.log(`System ${star.name} found in DB. Loading...`);
            return await getResponse.json();
        }

        if (getResponse.status === 404) {
            // It's a new system, so we proceed to create it. No error is logged.
            //console.log(`System ${star.name} not found in DB. Creating...`);
            const postResponse = await fetch(`${baseUrl}/api/v1/systems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(star),
            });
            if (!postResponse.ok) {
                throw new Error('Failed to create system via API');
            }
            return await postResponse.json();
        }

        // If the status is anything else (e.g., 500), it's a real error.
        throw new Error(`API error! Status: ${getResponse.status}`);

    } catch (error) {
        // This will now only catch actual errors, not the intentional 404.
        console.error("Failed to fetch or create system details:", error);
        throw error; // Re-throw the error so the component can handle it
    }
};