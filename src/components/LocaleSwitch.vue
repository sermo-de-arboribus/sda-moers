<template>
    <span class="language-switch dropdown">
        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span :class="`flag-icon flag-icon-${locale}`"/> {{ $t("localeSwitch.chooseLanguage") }}
        </a>
        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
            <a v-for="loc in availableLocales" :key="loc.code" class="dropdown-item" @click="switchToLocale(loc.code)">
                <span :class="`flag-icon flag-icon-${loc.code}`"></span> {{loc.name}}
            </a>
        </div>
    </span>
</template>

<script>
import { mapMutations, mapState } from "vuex";

export default {
    name: "LanguageSwitch",
    computed: {
        ...mapState("i18n", ["availableLocales", "locale", "setLocaleSetByBrowserPreference"])
    },
    methods: {
        switchToLocale(locale) {
            this.setLocale(locale);
            this.setLocaleSetByBrowserPreference(false);
        },

        ...mapMutations("i18n", ["setLocale"])
    }
}
</script>