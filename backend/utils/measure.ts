// Todo: allow to customize
// Todo: measure text

export const getWidth = (ch: string) => {
    if (ch.length)
        return 1 + (ch.length - 1) * 0.6
    return 0
}
