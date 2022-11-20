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
	sind: (deg: number) => (
		Math.sin(MathEx.d2r(deg))
	),
	cosd: (deg: number) => (
		Math.cos(MathEx.d2r(deg))
	),
	tand: (deg: number) => (
		Math.tan(MathEx.d2r(deg))
	)
}
