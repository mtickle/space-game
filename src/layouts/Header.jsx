

const Header = ({ stars }) => {

    return (
        <header className="w-full bg-gray-900 p-4 flex items-center justify-between text-xl text-orange-400">
            <h1 className="text-4xl font-baumans tracking-wide" style={{ fontFamily: '"Baumans", cursive' }}>Galactic Map Lab</h1>
        </header>
    );
};

export default Header;