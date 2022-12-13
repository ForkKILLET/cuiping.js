 export default [
    [ { zh: '甲烷', en: 'methane' }, 'C[--||H]' ],
    [ { zh: '氮气', en: 'nitrogen' }, 'N#N' ],
    [ { zh: '乙烯', en: 'ethylene' }, 'C[H\\/]=C[\\/H]' ],
    [ { zh: '碳碳双键 (官能团)', en: 'C-C double bond (functional group)' }, 'C[*\\/]=C[\\/*]' ],
    [ { zh: '2-氯-1,3-丁二烯 (仅碳链)', en: 'chloroprene (carbon chain only)' }, 'C=C[|Cl]-C=C' ],
    [ { zh: '乙酸', en: 'acetic acid' }, 'C[H-,||H]-C[=|O]-O-H' ],
    [ { zh: '2-氯丙烷 (附样式)', en: '2-chloropropane (with style)' }, 'CH3-CH{B}[|Cl{C:green}]-CH3' ],
    [ { zh: 'ATP', en: 'ATP' }, 'A-Pi-{HE,C:red}Pi-{HE,C:red}Pi' ]
] as [ Record<string, string>, string][]