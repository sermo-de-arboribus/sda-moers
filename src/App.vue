<template>
  <div id="app">
    <vue-headful 
      :description="$t('htmlHeader.description')"
      :keywords="$t('htmlHeader.keywords')"
      :lang="currentLanguage"
      :title="$t('htmlHeader.title')" />
    <nav class="navbar navbar-light bg-light">
      <div class="navbar-brand">
        <b-badge class="logo"><i class="fas fa-music" variant="success"></i></b-badge>
        <b-badge class="logo"><i class="fas fa-drum" variant="primary"></i></b-badge>
        <b-badge class="logo"><i class="fas fa-guitar" variant="primary"></i></b-badge>
      </div>
      <div class="navbar-text">
        <div class="navbar-item">
          <i18n path="general.header" tag="div">
            <template v-slot:festivalName>
                {{$t("general.festivalName")}}
            </template>
          </i18n>
        </div>
      </div>

      <locale-switch class="navbar-item"/>

    </nav>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/table">{{$t("general.table")}}</router-link> |
      <router-link to="/network">{{$t("general.network")}}</router-link> |
      <router-link to="/export">{{$t("general.export")}}</router-link> |
      <router-link to="/about">{{$t("general.imprint")}}</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
@import "./styles/flag-icon.css";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  margin-left: 1em;
  margin-right: 1em;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.logo {
  margin-right: 0.5em;
}
</style>

<script>
import LocaleSwitch from "./components/LocaleSwitch";

export default {
  name: "App",
  components: {
    LocaleSwitch
  },
  computed: {
    currentLanguage() {
      return this.$store.state.i18n.locale;
    }
  }
}
</script>
