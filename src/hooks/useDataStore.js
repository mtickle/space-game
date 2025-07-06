// hooks/useDataStore.js

import { useAuth0 } from '@auth0/auth0-react';
import { useCallback, useEffect, useState } from 'react';

const useDataStore = () => {
    const { user, isAuthenticated } = useAuth0();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadBookmarks = useCallback(async () => {
        if (!user?.sub) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/bookmarks?userId=${user.sub}`);
            const json = await res.json();
            setBookmarks(json.bookmarks || []);
        } catch (e) {
            console.error('Error loading bookmarks:', e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addBookmark = async (bookmark) => {
        try {
            await fetch('/api/bookmarks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.sub, ...bookmark })
            });
            await loadBookmarks();
        } catch (e) {
            console.error('Failed to add bookmark', e);
        }
    };

    const deleteBookmark = async (bookmarkName) => {
        try {
            await fetch(`/api/bookmarks/${bookmarkName}?userId=${user.sub}`, { method: 'DELETE' });
            await loadBookmarks();
        } catch (e) {
            console.error('Failed to delete bookmark', e);
        }
    };

    useEffect(() => {
        if (isAuthenticated) loadBookmarks();
    }, [isAuthenticated, loadBookmarks]);

    return {
        bookmarks,
        loading,
        addBookmark,
        deleteBookmark,
        refreshBookmarks: loadBookmarks
    };
};

export default useDataStore;
