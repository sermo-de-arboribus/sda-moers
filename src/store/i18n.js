module.exports = {
    namespaced: true,

    state: {
        locale: "de",
        localeSetByBrowserPreference: false
    },

    mutations: {
        setLocale (state, locale) {
            state.locale = locale;
        },

        setLocaleSetByBrowserPreference (state, flag) {
            state.localeSetByBrowserPreference = flag;
        }
    }
}
