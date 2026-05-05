import { useEffect, useLayoutEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface SliderProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'xs'| 'sm' | 'md' | 'lg';
}

export const Slider = ({ isOpen, onClose, children, size = 'sm' }: SliderProps) => {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);
    const scrollY = useRef<number>(0);

    useLayoutEffect(() => {
        if (isOpen) {
            setMounted(true);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            // Store current scroll position
            scrollY.current = window.scrollY;

            requestAnimationFrame(() => {
                setVisible(true);
                // Prevent scrolling by setting overflow hidden
                document.body.style.overflow = 'hidden';
                // Lock the scroll position by setting top margin
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY.current}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.width = '100%';
            });
        } else {
            setVisible(false);
            // Restore scroll position and body styles
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';

            // Restore scroll position
            window.scrollTo(0, scrollY.current);

            const timeout = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(timeout);
        }

        return () => {
            // Cleanup function to restore body style and scroll position
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY.current);
        };
    }, [isOpen]);

    if (!mounted) return null;

    const modalWidth = {
        xs: 'w-4/5 md:w-1/5',  
        sm: 'w-4/5 md:w-1/3', 
        md: 'w-4/5 md:w-3/5',
        lg: 'w-4/5 md:w-3/4',
    }[size];

    const modalContent = (
        <>
            <div
                data-testid="overlay"
                className={`fixed inset-0 z-50 bg-gray-600/50 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            <div
                data-testid="small-modal-container"
                className={`fixed top-0 right-0 h-full z-50 bg-white text-gray-900 py-2 overflow-y-hidden transform transition-transform duration-300 ease-in-out ${modalWidth} ${
                    visible ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <button
                    className="absolute top-4 right-4 p-2 bg-gray-200 hover:bg-gray-300 rounded-full focus:outline-none cursor-pointer"
                    onClick={onClose}
                >
                    <X className="h-5 w-5" />
                </button>
                <div className="p-2 h-full overflow-y-auto">{children}</div>
            </div>
        </>
    );

    return createPortal(modalContent, document.body);
};