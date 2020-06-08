<template>
  <div id="app">
    <nav class="navbar navbar-light bg-light">
      <span class="navbar-brand">
        <b-badge class="logo"><i class="fas fa-music" variant="success"></i></b-badge>
        <b-badge class="logo"><i class="fas fa-drum" variant="primary"></i></b-badge>
        <b-badge class="logo"><i class="fas fa-guitar" variant="primary"></i></b-badge>
      </span>
      <locale-switch/>
    </nav>
    <div id="nav">
      <router-link to="/">Home</router-link> |
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
  }
}
</script>
