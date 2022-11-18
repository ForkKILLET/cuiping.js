export const MathEx = {
	rem: (x: number, y: number) => {
		const m = x % y
		if (isNaN(m)) return m
		return m < 0 ? m + y : m
	},
	stdAng: (deg: number): number => {
		return MathEx.rem(deg, 360)
	}
}

type LogType = (...p: Parameters<typeof console.log>) => void

export const Debug: {
	on: boolean,
	red: ((s: string) => string),
	log: LogType,
	error: LogType
} = {
	on: false,
	red: s => s,
	log: (...p) => {
		if (Debug.on) console.log(...p)
	},
	error: (s, ...p) => {
		console.error(Debug.red(s), ...p)
	}
}
