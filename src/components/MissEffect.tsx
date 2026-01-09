import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

interface MissEffectProps {
    trigger: boolean;
}

const MissEffect: React.FC<MissEffectProps> = ({ trigger }) => {
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadSlim(engine);
    }, []);

    if (!trigger) return null;

    return (
        <Particles
            id="tsparticles-miss"
            init={particlesInit}
            options={{
                fullScreen: { enable: true, zIndex: 100 },
                fpsLimit: 120,
                particles: {
                    number: {
                        value: 0, 
                    },
                    color: {
                        value: ["#ff0000", "#ff7700", "#ffff00"],
                    },
                    shape: {
                        type: "circle",
                    },
                    opacity: {
                        value: 1,
                        animation: {
                            enable: true,
                            speed: 2,
                            minimumValue: 0,
                            sync: false,
                        },
                    },
                    size: {
                        value: 5,
                        random: {
                            enable: true,
                            minimumValue: 2,
                        },
                        animation: {
                            enable: true,
                            speed: 20,
                            minimumValue: 0.1,
                            sync: false,
                        },
                    },
                    move: {
                        enable: true,
                        gravity: {
                            enable: true,
                            acceleration: 10
                        },
                        speed: {
                            min: 10,
                            max: 20,
                        },
                        direction: "none",
                        random: false,
                        straight: false,
                        outModes: {
                            default: "destroy",
                        },
                    },
                },
                emitters: {
                    direction: "none",
                    life: {
                        count: 1,
                        duration: 0.1,
                        delay: 0,
                    },
                    rate: {
                        delay: 0,
                        quantity: 100,
                    },
                    size: {
                        width: 0,
                        height: 0,
                    },
                    position: {
                        x: 50,
                        y: 50,
                    },
                },
            }}
        />
    );
};

export default MissEffect;
