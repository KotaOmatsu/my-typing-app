import { useCallback, useEffect, useRef } from "react";
import Particles, { initParticlesEngine, useParticles } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Container, Engine } from "@tsparticles/engine"; // Correct type import for v3

interface MissEffectProps {
    trigger: boolean;
}

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const [init, setInit] = React.useState(false);
    const containerRef = useRef<Container | undefined>(undefined);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container?: Container) => {
        containerRef.current = container;
    };

    useEffect(() => {
        if (trigger && containerRef.current) {
            // Manually add an emitter for explosion effect
            containerRef.current.addEmitter({
                direction: "none",
                life: {
                    count: 1,
                    duration: 0.1,
                    delay: 0,
                },
                rate: {
                    delay: 0,
                    quantity: 50, // More particles
                },
                size: {
                    width: 0,
                    height: 0,
                },
                position: {
                    x: 50,
                    y: 50,
                },
                particles: {
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "destroy",
                        },
                        random: false,
                        speed: {
                            min: 10,
                            max: 20
                        },
                        straight: false
                    },
                    number: {
                        value: 0
                    },
                    opacity: {
                         value: { min: 0.3, max: 1 }, // Random opacity
                         animation: {
                             enable: true,
                             speed: 3,
                             sync: false,
                             destroy: "min" // Fade out
                         }
                    },
                    shape: {
                        type: ["circle", "square", "triangle"]
                    },
                    size: {
                        value: { min: 3, max: 8 }
                    },
                    color: {
                        value: ["#ff0000", "#ff7700", "#ffff00", "#ffffff"]
                    },
                }
            });
        }
    }, [trigger]);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles-miss"
            particlesLoaded={particlesLoaded}
            options={{
                fullScreen: { enable: true, zIndex: 1000 }, // Higher zIndex
                fpsLimit: 120,
                particles: {
                    number: {
                        value: 0, // Start empty
                    },
                },
                // We don't define emitters here, we add them dynamically
            }}
        />
    );
};

// Helper for React state
import React from 'react';

export default MissEffect;
