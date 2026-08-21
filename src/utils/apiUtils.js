/**
 * Fetches the full details of a star system from the API.
 * If the system doesn't exist, it sends a request to create it.
 * @param {object} star - The basic star object.
 * @returns {Promise<object>} The full star system data from the API.
 */
export const fetchSystemDetails = async (star) => {
    // 1. Ensure we have the full star object
    if (!star || !star.id) {
        throw new Error("Invalid star data provided.");
    }

    const apiKey = import.meta.env.VITE_API_KEY;
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
        const getResponse = await fetch(`${baseUrl}/api/v1/systems/${star.id}`, {
            headers: { 'x-api-key': apiKey }
        });

        let systemData = null;

        // 2. If it is NOT a 404, try to parse it
        if (getResponse.status !== 404) {
            if (!getResponse.ok) {
                throw new Error(`API error! Status: ${getResponse.status}`);
            }
            systemData = await getResponse.json();
        }

        // 3. If systemData is still null (because it was a 404), create it!
        if (!systemData) {
            console.log(`System ${star.name} is undiscovered. Generating new system...`);

            const postResponse = await fetch(`${baseUrl}/api/v1/systems`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey
                },
                body: JSON.stringify(star),
            });

            if (!postResponse.ok) {
                throw new Error(`Failed to create system via API. Status: ${postResponse.status}`);
            }

            return await postResponse.json();
        }

        // 4. Otherwise, return the loaded data
        return systemData;

    } catch (error) {
        console.error("Failed to fetch or create system details:", error);
        throw error;
    }
};