
import { useAuth0 } from '@auth0/auth0-react';
//import { synthesizeStarSystem } from '@utils/synthesisUtils';

const Header = ({ stars }) => {
    const { loginWithRedirect, logout, isAuthenticated, user, isLoading } = useAuth0();

    return (
        <header className="w-full bg-gray-900 p-4 flex items-center justify-between text-xl text-orange-400">
            <h1 className="text-4xl font-baumans tracking-wide" style={{ fontFamily: '"Baumans", cursive' }}>Galactic Map Lab</h1>
            <div className="flex space-x-4">
                <div>
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">
                                Welcome, {user.name || user.email}
                            </span>
                            <button
                                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white text-sm shadow-md transition-all"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => loginWithRedirect()}
                            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white text-sm shadow-md transition-all"
                        >
                            Log In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;