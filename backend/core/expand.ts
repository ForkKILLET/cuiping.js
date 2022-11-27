import type { BondCount, BondDir, Chem, Group } from './parse.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'

export type ExpandedBond = {
	c: BondCount,
	d: BondDir,
	t: ExpandedChem,
	f: Group
}

export type ExpandedChem = {
	g: Group,
	bonds: ExpandedBond[]
}

export function expandAggregateBonds(
	chem: Chem,
	rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
	depth: number = 0
): ExpandedChem {
	const bonds: ExpandedBond[] = []
	chem.bonds.forEach(b => {
		const [ d0 ] = b.d

		b.d.forEach((d, i) => {
			let rD = rotateD
			let fX = flipX
			let fY = flipY

			if (i) {
				if (d + d0 === 360)
					fY = ! fY
				else if (d + d0 === 180)
					fX = ! fX
				else {
					const dd = d - d0
					rD += MathEx.stdAng(flipX === flipY ? dd : - dd)
				}
			}

			d += rotateD
			if (flipX) d = 180 - d
			if (flipY) d = 360 - d
			d = MathEx.stdAng(d)

			Debug.D(
				'>'.repeat(depth + 1) + ' '.repeat(8 - depth) +
				'rd %d,\tfx %o,\tfy %o\t-> %d',
				rotateD, flipX, flipY, d
			)

			bonds.push({
				c: b.c,
				d,
				t: expandAggregateBonds(b.n, rD, fX, fY, depth + 1),
				f: chem.g
			})
		})
	})
	return {
		g: chem.g,
		bonds
	}
}
