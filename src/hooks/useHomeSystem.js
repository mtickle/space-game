import { useState } from 'react';

const LOCAL_KEY = 'homeSystem';

export const useHomeSystem = () => {
    const [homeSystem, setHomeSystem] = useState(() => {
        return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
    });

    const setHome = (system) => {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(system));
        setHomeSystem(system);
    };

    const clearHome = () => {
        localStorage.removeItem(LOCAL_KEY);
        setHomeSystem({});
    };

    return { homeSystem, setHome, clearHome };
};
