//import i18n from "../i18n"

module.exports = {
    namespaced: true,

    state: {
        availableLocales: [
            {
                "code": "cn",
                "name": "中文"
            },
            {
                "code": "cs",
                "name": "česky"
            },
            {
                "code": "de",
                "name": "deutsch"
            },
            {
                "code": "en",
                "name": "english"
            },
            {
                "code": "fr",
                "name": "français"
            }
        ],
        i18nComponent: null,
        locale: "de",
        localeSetByBrowserPreference: false
    },

    mutations: {
        setI18nComponent (state, component) {
            state.i18nComponent = component;
        },

        setLocale (state, locale) {
            state.locale = locale;
            if(state.i18nComponent) {
                state.i18nComponent.locale = locale;
            }
        },

        setLocaleSetByBrowserPreference (state, flag) {
            state.localeSetByBrowserPreference = flag;
        }
    }
}
