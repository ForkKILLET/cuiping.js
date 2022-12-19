// Todo: allow to customize

export const getWidth = (ch: string) => {
    if (ch === '.') return 0
    return 1 + (ch.length - 1) * 0.6
}