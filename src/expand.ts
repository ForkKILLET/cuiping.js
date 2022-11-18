import type { Chem, Group } from './parse.js'
import { MathEx, Debug } from './util.js'

type ExpandedBind = {
	c: number,
	d: number,
	n: ExpandedChem
}

type ExpandedChem = {
	g: Group,
	binds: ExpandedBind[]
}

export function expandAggregateBinds(
	chem: Chem,
	rotateD: number = 0, flipX: boolean = false, flipY: boolean = false,
	depth: number = 0
): ExpandedChem {
	const binds: ExpandedBind[] = []
	chem.binds.forEach(b => {
		const [ d0 ] = b.d

		b.d.forEach(d => {
			let rD = rotateD
			let fX = flipX
			let fY = flipY

			if (d + d0 === 360)
				fY = ! fY
			else if (d + d0 === 180)
				fX = ! fX
			else {
				const dd = d - d0
				rD += MathEx.stdAng(flipX === flipY ? dd : - dd)
			}

			d += rotateD
			if (flipX) d = 180 - d
			if (flipY) d = 360 - d
			d = MathEx.stdAng(d)

			Debug.log(
				'>'.repeat(depth + 1) + ' '.repeat(8 - depth) +
				'rd %d,\tfx %o,\tfy %o\t-> %d',
				rotateD, flipX, flipY, d
			)

			binds.push({
				c: b.c,
				d,
				n: expandAggregateBinds(b.n, rD, fX, fY, depth + 1)
			})
		})
	})
	return {
		g: chem.g,
		binds
	}
}
