import React, { useCallback, useEffect, useRef } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadAll } from "@tsparticles/all"; // Use loadAll to ensure everything is loaded including emitters
import type { Container } from "@tsparticles/engine"; 

interface MissEffectProps {
    trigger: boolean;
}

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const [init, setInit] = React.useState(false);
    const containerRef = useRef<Container | undefined>(undefined);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            // This loads all plugins and shapes from the tsparticles bundle
            await loadAll(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = async (container?: Container) => {
        containerRef.current = container;
    };

    useEffect(() => {
        if (trigger && containerRef.current) {
            // Check if addEmitter exists before calling
            const container = containerRef.current as any;
            if (typeof container.addEmitter === "function") {
                container.addEmitter({
                    direction: "none",
                    life: {
                        count: 1,
                        duration: 0.1,
                        delay: 0,
                    },
                    rate: {
                        delay: 0,
                        quantity: 50, 
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
                             value: { min: 0.3, max: 1 }, 
                             animation: {
                                 enable: true,
                                 speed: 3,
                                 sync: false,
                                 destroy: "min" 
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
            } else {
                console.warn("addEmitter is not available on tsparticles container");
            }
        }
    }, [trigger]);

    if (!init) return null;

    return (
        <Particles
            id="tsparticles-miss"
            particlesLoaded={particlesLoaded}
            options={{
                fullScreen: { enable: true, zIndex: 1000 }, 
                fpsLimit: 120,
                particles: {
                    number: {
                        value: 0, 
                    },
                },
            }}
        />
    );
};

export default MissEffect;
