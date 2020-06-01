<template>
  <div id="app">
    <h1>
      <b-badge class="logo"><i class="fas fa-music" variant="success"></i></b-badge>
      <b-badge class="logo"><i class="fas fa-drum" variant="primary"></i></b-badge>
      <b-badge class="logo"><i class="fas fa-guitar" variant="primary"></i></b-badge>
    </h1>
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">Impressum</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style>
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
