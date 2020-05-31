<template>
  <div id="app">
    <h1>
      <b-badge class="logo"><i class="fas fa-music" variant="success"></i></b-badge>
      <b-badge class="logo"><i class="fas fa-drum" variant="primary"></i></b-badge>
      <b-badge class="logo"><i class="fas fa-guitar" variant="primary"></i></b-badge>
    </h1>
    <artists-table/>
  </div>
</template>

<style>
.logo {
  margin-right: 0.5em;
}

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
</style>

<script>
import ArtistsTable from "./components/ArtistsTable.vue"

export default {
  name: 'App',
  components: {
    ArtistsTable
  }
}
</script>
