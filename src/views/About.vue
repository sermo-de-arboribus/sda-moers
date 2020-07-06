<template>
  <div class="about container">
    <section>
      <h1>{{ $t("aboutPage.imprint") }}</h1>
      <p>{{ $t("aboutPage.privateWebsiteOf") }}<br/>
        <br/>
         Kai Weber<br/>
         {{ $t("aboutPage.superViewer") }}<br/>
         Mühleweg 7<br/>
         72138 Kirchentellinsfurt<br/>
         {{ $t("aboutPage.germany")}}<br/>
         sermo_de_arboribus[{{$t("aboutPage.atSign")}}]seznam.cz
      </p>
      <img src="../assets/Moers-Superzuschauer.jpg" style="width:50%"/>
    </section>
    <section>
      <h2>{{ $t("aboutPage.privacyHeader")}}</h2>
      <p>{{$t("aboutPage.privacyLine1")}}</p>
      <p>{{$t("aboutPage.privacyLine2")}}</p>
      <p>{{$t("aboutPage.privacyLine3")}}</p>
    </section>
    <section>
      <h2>{{ $t("aboutPage.liabilityNoteHeader")}}</h2>
      <p>{{ $t("aboutPage.liabilityNoteContent")}}</p>
    </section>
    <section>
      <h2>{{$t("aboutPage.sourceCodeHeader")}}</h2>
      <i18n path="aboutPage.sourceCodeContent">
        <template v-slot:githublink>
          <a href="https://github.com/sermo-de-arboribus/sda-moers">GitHub</a>
        </template>
      </i18n>
    </section>
    <hr/>
    <section>
      <h3>Rechtliche Hinweise</h3>
      <p>© 2020 Kai Weber</p>
      <p>moers festival and mœrs festival are trademarks of Moers Kultur GmbH</p>
      <p>The logos of All About Jazz, Allmusic, Bandcamp, Discogs, Soundcloud, Twitter, and Youtube are trademarks of the respective companies that run those websites.</p>
      <p>All other logos are open source logos by <a href="https://fontawesome.com/">Font Awesome</a>.</p>
      <p>This website uses the JavaScript framework <a href="https://vuejs.org/">Vue.js</a> and the <a
        href="https://xaksis.github.io/vue-good-table/">vue-good-table</a> library.</p>
    </section>
  </div>
</template>

<style>
section {
  margin-top: 1em;
}
</style>