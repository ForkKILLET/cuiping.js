type LogType = (...p: Parameters<typeof console.log>) => void

export const Debug: {
	on: boolean,
	errStyle: ((s: string) => string),
	D: LogType,
	E: LogType,
	O: (object: any) => void
} = {
	on: false,
	errStyle: s => s,
	D: (...p) => {
		if (Debug.on) console.log(...p)
	},
	E: (s, ...p) => {
		console.error(Debug.errStyle(s), ...p)
	},
	O: (obj) => {
		console.dir(obj, { depth: Infinity })
	}
}
