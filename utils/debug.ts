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
