import { encodeXML } from 'entities'
import type { Group, BondCount, AttrOfBond } from './parse.js'
import type { Chem } from './postproc.js'
import { MathEx } from '../utils/math.js'
import { Debug } from '../utils/debug.js'

export type LayoutBond = {
    c: BondCount
    a: AttrOfBond
    g1: Group
    g2: Group
    x1: number
    y1: number
    x2: number
    y2: number
    xo: number
    yo: number
}

export type LayoutGroup = {
    t: Group['t']
    a: Group['a']
    i: Group['i']
    x: number
    y: number
    xo: number
    yo: number
}

export type Layout = {
    groups: LayoutGroup[]
    bonds: LayoutBond[]
}

export function locate(chem: Chem, {
    unitLen: u = 20,
    halfTextBoxWidth: hw = 6,
    halfTextBoxHeight: hh = 8
}: {
    unitLen?: number
    halfTextBoxWidth?: number
    halfTextBoxHeight?: number
}): Layout {
    const groups: LayoutGroup[] = []
    const bonds: LayoutBond[] = []

    const dfs = (
        c: Chem,
        x1: number, y1: number,
        xo: number, yo: number
    ) => {
        groups.push({ ...c.g, x: x1, y: y1, xo, yo })

        const w = c.g.t.w * 2
        const cxo = c.g.t.B[0].w // Note: center offset x, depends on center atom

        c.bonds.forEach(b => {
            // Note: distance to text border
            const xr = MathEx.cosd(b.d) > 0 ? w - cxo : - cxo
            const yr = b.d < 180 ? + 1 : - 1

            const kr = yr / xr // Note: slope of the line from center to corner
            const k = MathEx.tand(b.d) // Note: tangent of the bond angle

            const { t } = c.g
            const { cd } = t.B[0] // Note: collapsed

            const dxo = cd
                ? 0
                : hw * (Math.abs(k) > Math.abs(kr)
                    ? yr / k // Note: yr / dxo = tan d
                    : xr)

            const zw = b.a.length === 0
            const dyo = (cd && ! (t.B[0].s && zw))
                ? 0
                : hh * (Math.abs(k) > Math.abs(kr)
                    ? yr
                    : xr * k) // Note: dyo / xr = tan d

            const { t: T } = b.t.g
            const { cd: Cd } = T.B[0] // Note: target collapsed

            const L = b.a.length ?? 1
            const Lu = L * u

            const x2 = x1 + MathEx.cosd(b.d) * Lu
            const cx2 = x1 + MathEx.cosd(b.d) * (Lu + (Cd ? 0 : T.B[0].w * hw))
            const y2 = y1 + MathEx.sind(b.d) * Lu
            const cy2 = y1 + MathEx.sind(b.d) * (Lu + (Cd ? 0 : hh))

            const txo = MathEx.cosd(b.d) >= 0 // Note: text offset x of target group
                ? 0
                : (- T.w + T.B[0].w) * 2 * hw

            bonds.push({
                g1: b.f, g2: b.t.g,
                x1, y1, x2, y2, xo: xo + dxo, yo: yo + dyo,
                c: b.c, a: b.a
            })

            dfs(
                b.t,
                cx2, cy2,
                xo + dxo + txo,
                yo + dyo
            )
        })
    }

    dfs(chem, 0, 0, 0, 0)

    return {
        groups,
        bonds
    }
}

export function getViewport(l: Layout, h: number) {
    let xMin = + Infinity; let yMin = + Infinity
    let xMax = - Infinity; let yMax = - Infinity
    for (const g of l.groups) {
        if (g.i < 0) continue

        const y = g.y + g.yo
        if (y < yMin) yMin = y
        if (y > yMax) yMax = y
        // Note: calculate border of text
        if (g.t.B[0].nd) {
            const x = g.x + g.xo
            if (x < xMin) xMin = x
            if (x > xMax) xMax = x
        }
        else {
            const w0 = g.t.w ? g.t.B[0].w * h : 0
            const x1 = g.x + g.xo - w0
            const x2 = g.x + g.xo + (g.t.w * 2 * h) - w0
            if (x1 < xMin) xMin = x1
            if (x2 > xMax) xMax = x2
        }
    }
    return {
        xMin, yMin, xMax, yMax,
        xOffset: - xMin,
        yOffset: - yMin,
        width: xMax - xMin,
        height: yMax - yMin
    }
}

export type SvgRendererOption = {
    unitLen?: number
    paddingX?: number
    paddingY?: number
    displayBonds?: boolean
    bondGap?: number
    lineBaseColor?: string
    textBaseColor?: string
    displayBackground?: boolean
    backgroundColor?: string
    halfFontSize?: number
    halfTextBoxWidth?: number
    halfTextBoxHeight?: number
    displayTextBox?: boolean
}

export type SvgResult = {
    svg: string
    id: string
    width: number
    height: number
}

export function renderSVG(c: Chem, opt: SvgRendererOption = {}): SvgResult {
    const l = locate(c, opt)

    const {
        unitLen: u = 20,
        paddingX = 20,
        paddingY = 20,
        displayBonds = true,
        bondGap: bg = 2,
        lineBaseColor = 'black',
        textBaseColor = 'black',
        displayBackground = false,
        backgroundColor = 'white',
        halfFontSize = 8,
        halfTextBoxWidth: hw = 6,
        halfTextBoxHeight: hh = 8,
        displayTextBox = false
    } = opt

    let svg = ''

    const vp = getViewport(l, hw)
    Debug.D('layout: %o, viewport: %o', l, vp)

    const O = { x: 0, y: 0 }
    const R = (n: number) => MathEx.round(n, 7)
    const X = (x: number) => R(x + vp.xOffset + paddingX + O.x)
    const Y = (y: number) => R(y + vp.yOffset + paddingY + O.y)
    const A = (attrs: string[]) => attrs.length ? ' ' + attrs.join(' ') : ''
    const ln = (
        x1: number, y1: number, x2: number, y2: number, attr: string[],
        to: boolean = false, from: boolean = false
    ) => {
        svg += `<line x1="${X(x1)}" y1="${Y(y1)}" x2="${X(x2)}" y2="${Y(y2)}"${A(attr)}></line>`
        if (to) arrow(x1, y1, x2, y2, attr)
        if (from) arrow(x2, y2, x1, y1, attr)
    }
    const arrow = (x1: number, y1: number, x2: number, y2: number, attr: string[]) => {
        const wh = 4
        const xwh = wh * (x2 - x1) / u
        const ywh = wh * (y2 - y1) / u
        const wv = 1.5
        const xwv = wv * (y2 - y1) / u
        const ywv = wv * (x2 - x1) / u
        svg += '<path d="'
            + `M ${X(x2)} ${Y(y2)}`
            + `L ${X(x2 - xwh + xwv)} ${Y(y2 - ywh - ywv)}`
            + `L ${X(x2 - xwh - xwv)} ${Y(y2 - ywh + ywv)} Z`
        + `"${A([ ...attr, 'tofill=""' ])}></path>`
    }

    const id = `mol-${(Math.random() * 1e6 | 0)}-${Date.now().toString().slice(- 10)}`
    const width = R(vp.width + paddingX * 2)
    const height = R(vp.height + paddingY * 2)

    svg += `<svg id="${id}" xmlns="http://www.w3.org/2000/svg" `
        + `width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
    svg += '<style>'
            + `#${id} text {`
                + 'dominant-baseline: central;'
                + 'text-anchor: middle;'
                + `font-size: ${halfFontSize * 2}px;`
                + 'font-family: serif;'
            + '}'
            + `#${id} text:not([nobasecolor]) {`
                + `fill: ${textBaseColor};`
            + '}'
            + `#${id} path:not([tofill]) {fill: none;}`
            + `#${id} path[tofill] {`
                + `fill: ${lineBaseColor};`
            + '}'
            + `#${id} text[box-align=sub] {`
                + `font-size: ${halfFontSize * 1.5}px;`
                + 'dominant-baseline: hanging;'
            + '}'
            + `#${id} text[box-align=sup] {`
                + `font-size: ${halfFontSize * 1.5}px;`
                + 'dominant-baseline: alphabetic;'
            + '}'
            + `#${id} text[bold] {font-weight: bold;}`
            + `#${id} line:not([nobasecolor]):not([debug]), #${id} path:not([nobasecolor]) {`
                + `stroke: ${lineBaseColor};`
            + '}'
            + `#${id} [debug] {`
                + 'stroke: red;'
                + 'fill: none;'
            + '}'
            + `#${id} [mask] {fill: ${backgroundColor};}`
        + '</style>'

    if (displayBackground)
        svg += `<rect x="0" y="0" width="${width}" height="${height}" fill="${backgroundColor}"></rect>`

    if (displayBonds) {
        for (const {
            x1, y1, x2, y2, xo, yo, c, a
        } of l.bonds) {
            O.x = xo
            O.y = yo

            const attr: string[] = []
            if (a.color) attr.push('nobasecolor=""', `stroke="${a.color}"`)

            if (a.highEnergy) {
                const w = 6
                const x3 = (x1 + 1 / 3 * x2) / (1 + 1 / 3)
                const y3 = (y1 + 1 / 3 * y2) / (1 + 1 / 3)
                const x4 = (x1 + 3 * x2) / (1 + 3)
                const y4 = (y1 + 3 * y2) / (1 + 3)
                const xw = w * (y2 - y1) / u
                const yw = w * (x2 - x1) / u
                svg += '<path d="'
                    + `M ${X(x1)} ${Y(y1)} `
                    + `C ${X(x3 + xw)} ${Y(y3 - yw)} ${X(x4 - xw)} ${Y(y4 + yw)} ${X(x2)} ${Y(y2)}`
                + `"${A(attr)}></path>`
            }
            else if (c === 1) {
                ln(x1, y1, x2, y2, attr, !! a.to, !! a.from)
            }
            else if (c === 2) {
                if (a.side) {
                    const xg = (bg + 1) * (y2 - y1) / u
                    const yg = (bg + 1) * (x2 - x1) / u
                    if (a.side === 'L') {
                        ln(x1, y1, x2, y2, attr, !! a.to, !! a.from)
                        ln(x1 + xg, y1 - yg, x2 + xg, y2 - yg, attr, (a.to ?? 0) > 1, (a.from ?? 0) > 1)
                    }
                    else if (a.side === 'R') {
                        ln(x1, y1, x2, y2, attr, !! a.to, !! a.from)
                        ln(x1 - xg, y1 + yg, x2 - xg, y2 + yg, attr, (a.to ?? 0) > 1, (a.from ?? 0) > 1)
                    }
                }
                else {
                    let xg = (bg / 2 + 0.5) * (y2 - y1) / u
                    let yg = (bg / 2 + 0.5) * (x2 - x1) / u
                    if (yg < 0) {
                        xg = - xg
                        yg = - yg
                    }
                    ln(x1 + xg, y1 - yg, x2 + xg, y2 - yg, attr, !! a.to, !! a.from)
                    ln(x1 - xg, y1 + yg, x2 - xg, y2 + yg, attr, (a.to ?? 0) > 1, (a.from ?? 0) > 1)
                }
            }
            else if (c === 3) {
                let xg = (bg + 1) * (y2 - y1) / u
                let yg = (bg + 1) * (x2 - x1) / u
                if (yg < 0) {
                    xg = - xg
                    yg = - yg
                }
                ln(x1 + xg, y1 - yg, x2 + xg, y2 - yg, attr, !! a.to, !! a.from)
                ln(x1, y1, x2, y2, attr, (a.to ?? 0) > 1, (a.from ?? 0) > 1)
                ln(x1 - xg, y1 + yg, x2 - xg, y2 + yg, attr, (a.to ?? 0) > 2, (a.from ?? 0) > 2)
            }
        }
    }

    for (const { x, y, xo, yo, t, a, i } of l.groups) {
        O.x = xo
        O.y = yo

        let w = 0
        for (const B of t.B) {
            const attr: string[] = []
            if (a.color)
                attr.push('nobasecolor=""', `fill="${a.color}"`)
            if (a.bold)
                attr.push('bold=""')

            if (w > 0) w += B.w / 2

            const rx = X(x + (w * 2 - B.w) * hw)
            const ry = Y(
                B.a === 'base' ? y - hh : B.a === 'sub' ? y - hh / 4 : y - hh * 3 / 2
            )
            const rw = R(hw * B.w * 2)
            const rh = hh * 2

            if (! B.nd) {
                if (B.cd) {
                    svg += `<rect x="${rx}" y="${ry}" `
                        + `width="${rw}" height="${rh}" `
                        + 'mask=""'
                    + '></rect>'
                }
                if (B.a !== 'base') attr.push(`box-align="${B.a}"`)
                svg += `<text x="${X(x + w * 2 * hw)}" y="${Y(y)}"${A(attr)}>`
                        + encodeXML(B.s)
                    + '</text>'
            }

            if (displayTextBox) {
                if (B.cd) {
                    ln(x - 3, y - 3, x + 3, y + 3, [ 'debug=""' ])
                    ln(x - 3, y + 3, x + 3, y - 3, [ 'debug=""' ])
                }
                else {
                    svg += `<rect x="${rx}" y="${ry}" `
                        + `width="${rw}" height="${rh}" `
                        + 'debug=""'
                    + '></rect>'
                }
            }

            w += B.w / 2
        }

        svg += `<rect group-id="${i}" fill="none" `
            + `x="${X(x - t.B[0].w * hw)}" y="${Y(y - hh)}" `
            + `width="${R(hw * w * 2 + t.B[0].w * hw)}" height="${hh * 2}"`
        + '></rect>'
    }

    svg += '</svg>'

    const result = { svg, id, width, height }
    Debug.D('svg: %o', result)

    return result
}
