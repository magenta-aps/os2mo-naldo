<script lang="ts">
  import { page } from "$app/stores"

  import dhh from "$lib/assets/kaboodle/clickbait/dhh.png"
  import bpc from "$lib/assets/kaboodle/clickbait/bpc.png"
  import usikkert from "$lib/assets/kaboodle/clickbait/usikkert.png"
  import never from "$lib/assets/kaboodle/clickbait/never.png"
  import gladsaxe from "$lib/assets/kaboodle/clickbait/gladsaxe.png"
  import nevah from "$lib/assets/kaboodle/clickbait/never.png"
  import MURICA from "$lib/assets/kaboodle/clickbait/MURICA.png"
  import microsofthearts from "$lib/assets/kaboodle/clickbait/microsofthearts.png"
  import os2 from "$lib/assets/kaboodle/clickbait/os2.png"
  import hobby from "$lib/assets/kaboodle/clickbait/hobby.png"
  import jura from "$lib/assets/kaboodle/clickbait/jura.png"
  import prop from "$lib/assets/kaboodle/clickbait/prop.png"
  import silkeborg from "$lib/assets/kaboodle/clickbait/silkeborg.png"
  import blackboard from "$lib/assets/kaboodle/clickbait/blackboard.png"
  import mcd from "$lib/assets/kaboodle/clickbait/mcd.png"
  import morten from "$lib/assets/kaboodle/clickbait/morten.png"
  import unix from "$lib/assets/kaboodle/clickbait/unix.png"
  import alextrick from "$lib/assets/kaboodle/clickbait/alextrick.png"
  import pm from "$lib/assets/kaboodle/clickbait/pm.png"
  import vand from "$lib/assets/kaboodle/clickbait/vand.png"

  var raw_creatives = [
  {
    "title": "HVAD sagde David Heinemeier Hansson lige til Folketinget?!",
    "creative": dhh,
    "href": "https://www.ft.dk/aktuelt/webtv/video/20241/diu/tv.9670.aspx?as=1"
  },
  {
    "title": "Den her løsning passer sig selv",
    "creative": bpc,
    "href": "https://www.magenta.dk/cases/os2borgerpc-case-koebenhavns-kommune/"
  },
  {
    "title": "Derfor er Open Source usikkert",
    "creative": usikkert,
    "href": "https://os2mo.dk/"
  },
  {
    "title": "Du gætter aldrig hvad der reddede den her kommune fra Excelark",
    "creative": nevah,
    "href": "https://www.magenta.dk/cases/os2mo-reddede-frederikshavn-kommune/"
  },
  {
    "title": "Gladsaxe Kommune sparer 12.000 kWh med det her simple trick",
    "creative": gladsaxe,
    "href": "https://www.magenta.dk/cases/os2borgerpc-baeredygtig-og-besparende/"
  },
  {
    "title": "Hvorfor Open Source ALDRIG bliver ligeså godt som Ægte Software",
    "creative": never,
    "href": "https://git.caspervk.net/caspervk"
  },
  {
    "title": "Denne amerikanske kode kan stjæle dine data - kører du den?",
    "creative": MURICA,
    "href": "https://www.microsoft.com/da-dk/"
  },
  {
    "title": "Microsoft elsker open source",
    "creative": microsofthearts,
    "href": "https://pulse.microsoft.com/nl-nl/transform-nl-nl/na/fa1-microsoft-loves-open-source/"
  },
  {
    "title": "OS2 redder open source i Danmark",
    "creative": os2,
    "href": "https://github.com/os2sofd"
  },
  {
    "title": "Open Source udviklere er bare hobbyister; ikke professionelle",
    "creative": hobby,
    "href": "https://git.caspervk.net/caspervk"
  },
  {
    "title": "Advarsel: Open Source Licenser er et juridisk mareridt",
    "creative": jura,
    "href": "https://github.com/features/copilot"
  },
  {
    "title": "Proprietær Kode er Fremtiden: Hvorfor Open Source holder Digitaliseringen tilbage",
    "creative": prop,
    "href": "https://www.os2.eu/"
  },
  {
    "title": "Silkeborg Kommune afslører!",
    "creative": silkeborg,
    "href": "https://www.magenta.dk/cases/silkeborg-ville-accelerere-digitalt-men-manglede-vigtig-data/"
  },
  {
    "title": "Sådan fik de fuldt overblik over organisation og medarbejdere",
    "creative": blackboard,
    "href": "https://www.magenta.dk/cases/silkeborg-ville-accelerere-digitalt-men-manglede-vigtig-data/"
  },
  {
    "title": "Stopper McDonalds med at servere Big Macs?",
    "creative": mcd,
    "href": "https://en.wikipedia.org/wiki/Betteridge%27s_law_of_headlines"
  },
  {
    "title": "10 ting du aldrig vidste om MORTEN KJÆRSGAARD",
    "creative": morten,
    "href": "https://example.org"
  },
  {
    "title": "Denne ene UNIX kommando vil ÆNDRE DIT LIV FOR EVIGT",
    "creative": unix,
    "href": "https://github.com/astral-sh/ty"
  },
  {
    "title": "Alex Thirifays gjorde det her hver dag i en måned, og du vil ikke tro på resultatet!",
    "creative": alextrick,
    "href": "https://example.org"
  },
  {
    "title": "5 hemmeligheder, som din projektleder ikke vil have, at du kender",
    "creative": pm,
    "href": "https://old.reddit.com/r/overemployed/"
  },
  {
    "title": "Hvad sker der, når du drikker vand på tom mave hver morgen? NUMMER 3 VIL CHOKERE DIG!",
    "creative": vand,
    "href": "https://dhmo.org/facts.html"
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

  var creatives = []

  $: if ($page) {
    randomize(raw_creatives);
    creatives = raw_creatives.slice(0, 5)
  }
</script>

<style>
.kaboodle-module {
  display: flex;
  overflow: hidden;
  margin: 10px auto;
  text-align: center;
}

.kaboodle-item {
  display: inline-block;
  width: 320px;
  overflow: hidden;
  margin: 8px 10px 2px 10px;
  text-align: left;
}

.kaboodle-item p {
  min-height: 60px;
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
        <img src="{creative.creative}"/>
        <p>{creative.title}</p>
      </div>
    </a>
  {/each}
</div>
