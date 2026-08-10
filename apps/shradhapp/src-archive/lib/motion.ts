type MotionName = keyof typeof motionTokens.duration;

export const motionTokens = {
	duration: {
		instant: 0.08,
		fast: 0.14,
		normal: 0.2,
		slow: 0.32
	},
	easing: [0.2, 0.8, 0.2, 1] as const,
	distance: {
		xs: 4,
		sm: 8,
		md: 16
	},
	scale: {
		press: 0.96,
		subtle: 0.98
	}
} as const;

function isLowEndDevice() {
	if (typeof navigator === 'undefined') return false;
	const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
	return (deviceMemory !== undefined && deviceMemory <= 2) || (deviceMemory === undefined && navigator.hardwareConcurrency <= 4);
}

export const motionConfig = {
	isLowEndDevice,
	transition(name: MotionName = 'normal', reduced = false, essential = false) {
		if (reduced || (!essential && isLowEndDevice())) return { duration: 0 };
		return { duration: motionTokens.duration[name], ease: motionTokens.easing };
	}
};
