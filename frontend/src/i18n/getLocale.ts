import messages from './messages'

const availableLocales = Object.keys(messages)
const defaultLocale = 'en'

export const getLocale = () => {
    const savedLocale = localStorage.getItem('cuipingLocale')
    if (savedLocale) return savedLocale
    for (const lang of navigator.languages) {
        const locale = availableLocales.find(locale => lang.startsWith(locale))
        if (locale) return locale
    }
    return defaultLocale
}