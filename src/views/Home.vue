<template functional>
    <div class="home">
        <i18n path="artistsTable.intro" tag="p">
            <template v-slot:websiteCreator>
                <a href="https://www.facebook.com/kajetan.tkadlec.9" v-if="parent.$i18n.locale === 'cs'">Kajetána Tkalce</a>
                <a href="https://twitter.com/fruehlingstag" v-else>Kai Weber</a>
            </template>
            <template v-slot:dataProvider>
                <a href="https://lambdadigamma.com" v-if="parent.$i18n.locale === 'cs'">Lennarta Fišera</a>
                <a href="https://lambdadigamma.com/" v-else>Lennart Fischer</a>
            </template>
            <template v-slot:tweet>
                <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">{{parent.$t("general.tweet")}}</a>
            </template>
            <template v-slot:issueTracker>
                <a href="https://github.com/sermo-de-arboribus/sda-moers/issues">{{parent.$t("general.issueTracker")}}</a>
            </template>
        </i18n>
        <i18n path="artistsTable.intro2" tag="p">
            <template v-slot:dataProvider>
                <a href="https://lambdadigamma.com" v-if="parent.$i18n.locale === 'cs'">Lennarta Fišera</a>
                <a href="https://lambdadigamma.com/" v-else>Lennart Fischer</a>
            </template>
            <template v-slot:guestarticle>
                <a href="https://radio.friendsofalan.de/gastbeitrag-kai-weber-und-das-moers-festival-20109-2020-als-datenbank-und-das-projekt-coding-da-vinci/">{{parent.$t("general.guestarticle")}}</a>
            </template>
            <template v-slot:tweet>
                <a href="https://twitter.com/lambdadigamma/status/1266849091503472645?s=20">{{parent.$t("general.tweet")}}</a>
            </template>
        </i18n>
        <router-link to="/table">
            <b-button variant="outline-primary">
                {{ parent.$t("general.enter") }}
            </b-button>
        </router-link>
    </div>
</template>