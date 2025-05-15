<script lang="ts">
  import { onMount } from "svelte"

  var raw_creatives = [
  {
    "title": "HVAD sagde David Heinemeier Hansson lige til Folketinget?!",
    "creative": "/clickbait/dhh.png",
    "href": "https://www.ft.dk/aktuelt/webtv/video/20241/diu/tv.9670.aspx?as=1"
  },
  {
    "title": "Den her løsning passer sig selv",
    "creative": "/clickbait/bpc.png",
    "href": "https://www.magenta.dk/cases/os2borgerpc-case-koebenhavns-kommune/"
  },
  {
    "title": "Derfor er Open Source usikkert",
    "creative": "/clickbait/usikkert.png",
    "href": "https://github.com/os2sofd"
  },
  {
    "title": "Du gætter aldrig hvad der reddede den her kommune fra Excelark",
    "creative": "/clickbait/never.png",
    "href": "https://www.magenta.dk/cases/os2mo-reddede-frederikshavn-kommune/"
  },
  {
    "title": "Gladsaxe Kommune sparer 12.000 kWh med det her simple trick",
    "creative": "/clickbait/gladsaxe.png",
    "href": "https://www.magenta.dk/cases/os2borgerpc-baeredygtig-og-besparende/"
  },
  {
    "title": "Hvorfor Open Source ALDRIG bliver ligeså godt som Ægte Software",
    "creative": "/clickbait/never.png",
    "href": "https://example.org"
  },
  {
    "title": "Denne amerikanske kode kan stjæle dine data - kører du den?",
    "creative": "/clickbait/MURICA.png",
    "href": "https://www.microsoft.com/da-dk/"
  },
  {
    "title": "Microsoft elsker open source",
    "creative": "/clickbait/microsofthearts.png",
    "href": "https://pulse.microsoft.com/nl-nl/transform-nl-nl/na/fa1-microsoft-loves-open-source/"
  },
  {
    "title": "OS2 redder open source i Danmark",
    "creative": "/clickbait/os2.png",
    "href": "https://www.os2.eu/"
  },
  {
    "title": "Open Source udviklere er bare hobbyister; ikke professionelle",
    "creative": "/clickbait/hobby.png",
    "href": "https://example.org"
  },
  {
    "title": "Advarsel: Open Source Licenser er et juridisk mareridt",
    "creative": "/clickbait/jura.png",
    "href": "https://github.com/features/copilot"
  },
  {
    "title": "Proprietær Kode er Fremtiden: Hvorfor Open Source holder Digitaliseringen tilbage",
    "creative": "/clickbait/prop.png",
    "href": "https://example.org"
  },
  {
    "title": "Silkeborg Kommune afslører!",
    "creative": "/clickbait/silkeborg.png",
    "href": "https://www.magenta.dk/cases/silkeborg-ville-accelerere-digitalt-men-manglede-vigtig-data/"
  },
  {
    "title": "Sådan fik de fuldt overblik over organisation og medarbejdere",
    "creative": "/clickbait/blackboard.png",
    "href": "https://www.magenta.dk/cases/silkeborg-ville-accelerere-digitalt-men-manglede-vigtig-data/"
  },
  {
    "title": "Stopper McDonalds med at servere Big Macs?",
    "creative": "/clickbait/mcd.png",
    "href": "https://example.org"
  },
  {
    "title": "10 ting du aldrig vidste om Morten Kjærsgaard",
    "creative": "/clickbait/morten.png",
    "href": "https://example.org"
  },
  {
    "title": "Denne ene unix kommando vil ændre dit liv for evigt",
    "creative": "/clickbait/unix.png",
    "href": "https://example.org"
  },
  {
    "title": "Alex Thirifays gjorde det her hver dag i en måned, og du vil ikke tro på resultatet!",
    "creative": "/clickbait/alextrick.png",
    "href": "https://example.org"
  },
  {
    "title": "5 hemmeligheder, som din projektleder ikke vil have, at du kender",
    "creative": "/clickbait/pm.png",
    "href": "https://example.org"
  },
  {
    "title": "Hvad sker der, når du drikker vand på tom mave hver morgen? Nummer 3 vil chokere dig!",
    "creative": "/clickbait/vand.png",
    "href": "https://example.org"
  }
];

  
  function randomize(creatives){
    for(var i = creatives.length - 1; i > 0; i--){
      var swapIndex = getRandomInt(0, i + 1);
      var tmp = creatives[swapIndex];
      creatives[swapIndex] = creatives[i];
      creatives[i] = tmp;
    }
  }

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var kaboodleRoot = "/src/lib/assets/kaboodle"
  var creatives = []

  onMount(async () => {
    randomize(raw_creatives);
    creatives = raw_creatives.slice(0, 12)
  })
</script>

<style>
.kaboodle-module {
  overflow: hidden;
  margin: 10px auto;
  text-align: center;
}

.kaboodle-item {
  display: inline-block;
  width: 220px;
  overflow: hidden;
  margin: 8px 10px 2px 10px;
  text-align: left;
}

.kaboodle-item p {
  height: 60px;
  margin-bottom: 0px;
  overflow: hidden;
  font-weight: bold;
  font-size: 14px;
  color: black;
}

.kaboodle-item:hover {
  cursor: pointer;
  text-decoration: underline;
}
</style>

<div class="kaboodle-module">
  {#each creatives as creative}
    <a href={creative.href}>
      <div class="kaboodle-item">
        <img src="{kaboodleRoot}/{creative.creative}"/>
        <p>{creative.title}</p>
      </div>
    </a>
  {/each}
</div>
