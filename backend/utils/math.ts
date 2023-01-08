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
    sind: (deg: number) => Math.sin(MathEx.d2r(deg)),
    cosd: (deg: number) => Math.cos(MathEx.d2r(deg)),
    tand: (deg: number) => Math.tan(MathEx.d2r(deg))
}
