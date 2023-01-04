import type { Locales } from './i18n/locales' 

export default [
    [ { zh: '甲烷', en: 'methane' }, 'C[--||H]' ],
    [ { zh: '氮气', en: 'nitrogen' }, 'N#N' ],
    [ { zh: '乙烯', en: 'ethylene' }, 'C[H\\/]=C[\\/H]' ],
    [ { zh: '碳碳双键 (官能团)', en: 'C-C double bond (functional group)' }, 'C[?\\/]=C[\\/?]' ],
    [ { zh: '酮羰基 (官能团)', en: 'carbonyl group (functional group)' }, 'R^1-C[=|O]-R^2' ],
    [ { zh: '2-氯-1,3-丁二烯 (仅碳链)', en: 'chloroprene (carbon chain only)' }, 'C=C[|Cl]-C=C' ],
    [ { zh: '乙酸', en: 'acetic acid' }, 'C[H-,||H]-C[=|O]-O-H' ],
    [ { zh: '2-氯丙烷 (附样式)', en: '2-chloropropane (with style)' }, 'CH3-CH{B}[|Cl{C:green}]-CH3' ],
	[ { zh: '新戊烷', en: 'neopentane' }, 'C+{L:2}C[||H,-H]' ],
    [ { zh: 'ATP', en: 'ATP' }, 'A-Pi-{~,C:red}Pi-{~,C:red}Pi' ],
    [ { zh: '铵根离子', en: 'ammonium ion' }, 'NH4^+' ],
    [ { zh: '一氧化碳 (配位键)', en: 'carbon oxide (coordinated bond)' }, 'C#{<}O' ],
    [ { zh: '氯化铝 (使用引用)', en: 'aluminium chloride (using ref)' },
        String.raw`Al{&:1}[Cl\/]/Cl\{>}&2;` + '\n' + String.raw`Al{&:2}[/\Cl]!/Cl!\{>}&1`
    ]
] as [
    { [k in Locales]: string }, string
][]
