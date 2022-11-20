export const MathEx = {
	rem: (x: number, y: number) => {
		const m = x % y
		if (isNaN(m)) return m
		return m < 0 ? m + y : m
	},
	stdAng: (deg: number) => (
		MathEx.rem(deg, 360)
	),
	d2r: (deg: number) => (
		deg / 180 * Math.PI
	),
	r2d: (rad: number) => (
		rad / Math.PI * 180
	),
	round: (x: number, n: number) => {
		if (! Number.isInteger(n) || n < 0) throw RangeError('n must be a postive integer')
		const p = 10 ** n
		return Math.round(x * p) / p
	},
	sind: (deg: number) => (
		MathEx.round(Math.sin(MathEx.d2r(deg)), 15)
	),
	cosd: (deg: number) => (
		MathEx.round(Math.cos(MathEx.d2r(deg)), 15)
	),
	tand: (deg: number) => (
		MathEx.round(Math.tan(MathEx.d2r(deg)), 15)
	)
}
