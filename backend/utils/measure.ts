export const getWidth = (ch: string) =>
    ch === '.' ? 0 : 1 + (ch.length - 1) * 0.3