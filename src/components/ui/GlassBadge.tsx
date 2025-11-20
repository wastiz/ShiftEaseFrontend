import React, { FC } from 'react';
import '@/app/globals.css';
import { div } from 'framer-motion/client';

interface GlassBadgeProps {
    width?: string;
    height?: string;
    children?: React.ReactNode;
}

const GlassBadge: FC<GlassBadgeProps> = ({ width, height, children }) => {
    return (
        <div
            className="shadow-[5px_5px_5px_0px_#333333]"
            style={{ width, height }}
        >
            <div
                className="
                h-full w-full 
                bg-gradient-to-br
                from-black/30
                to-black/5
                rounded-sm
                p-4
                shadow-[inset_0px_0.08rem_0.3rem_0.08rem]
                shadow-current/20
                
                ring-inset
                ring-1 
                ring-glassPrimary/20
                "
            >
                {children}
            </div>
        </div>
    );
};

export default GlassBadge;
