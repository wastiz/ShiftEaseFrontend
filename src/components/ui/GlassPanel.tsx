import React, { FC } from 'react';

interface GlassPanelProps {
    width?: string;
    height?: string;
    children: React.ReactNode;
}

const GlassPanel: FC<GlassPanelProps> = ({ width, height, children }) => {
    return (
        <div className="glass" style={{ width, height: height || 'auto' }}>
            {children}
        </div>
    );
};

export default GlassPanel;
