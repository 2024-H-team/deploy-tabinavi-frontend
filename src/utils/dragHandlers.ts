declare global {
    interface Window {
        preventScrollHandler?: (e: Event) => void;
    }
}

export const handleDragStart = () => {
    const preventScroll = (e: Event) => {
        e.preventDefault();
    };

    document.addEventListener('wheel', preventScroll, { passive: false });
    document.addEventListener('touchmove', preventScroll, { passive: false });

    window.preventScrollHandler = preventScroll;
};

export const handleDragEnd = () => {
    if (window.preventScrollHandler) {
        document.removeEventListener('wheel', window.preventScrollHandler);
        document.removeEventListener('touchmove', window.preventScrollHandler);
        delete window.preventScrollHandler;
    }
};
