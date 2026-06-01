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

        // If the status is 500, 401, etc., it's a real error. Throw immediately.
        if (!getResponse.ok) {
            throw new Error(`API error! Status: ${getResponse.status}`);
        }

        // Parse the response. The backend returns 'null' if undiscovered.
        const systemData = await getResponse.json();

        // --- MODIFIED LOGIC ---
        // If it's null, it's a new system. Proceed to create it!
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

        // Otherwise, it wasn't null, so we successfully loaded it from the DB!
        // console.log(`System ${star.name} found in DB. Loading...`);
        return systemData;

    } catch (error) {
        console.error("Failed to fetch or create system details:", error);
        throw error; // Re-throw the error so the component can handle it
    }
};