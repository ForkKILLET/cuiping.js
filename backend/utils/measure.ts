// Todo: allow to customize

export const getWidth = (ch: string) => {
    if (ch === '.') return 0
    if (ch.match(/\d/)) return 0.5
    return 1 + (ch.length - 1) * 0.4
}