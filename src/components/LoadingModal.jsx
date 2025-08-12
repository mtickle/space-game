// src/components/LoadingModal.js


function LoadingModal({ isOpen, message }) {
    // If the modal isn't supposed to be open, render nothing.
    if (!isOpen) {
        return null;
    }

    return (
        // Modal Overlay
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {/* Modal Content */}
            <div className="rounded-lg bg-white p-8 text-center shadow-xl">
                {/* Spinner */}
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600"></div>
                {/* Message */}
                <p className="text-lg font-medium text-gray-700">{message}</p>
            </div>
        </div>
    );
}

export default LoadingModal;