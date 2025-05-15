<script lang="ts">
  import { onMount } from "svelte"

  var raw_creatives = [
    {"title": "Is Donald Trump The Best Candidate for 2016?  Vote Here.", "creative":  "/creatives/trump.jpg", "href": "http://newsmax.com"},
    {"title": "These Photos From The Past Are Bitter Sweet", "creative":  "/creatives/rifle.jpg", "href": "http://buzzlamp.com"},
    {"title": "Most Satisfied People Don't Wait For What They Want, They Go Get It", "creative":  "/creatives/satisfied.jpg", "href": "http://elitedaily.com/life/satisfied-people-dont-wait-want-go-get"},
    {"title": "10 Tips To Learn Any Language From The Genius Who Speaks 9", "creative":  "/creatives/genius.jpg", "href": "http://elitedaily.com/life/satisfied-people-dont-wait-want-go-get"},
    {"title": "A Lioness Captures A Baby Baboon And Does The LAST Thing You'd Expect", "creative":  "/creatives/lioness.jpg", "href": "http://www.littlebudha.com/baby-baboon-lion-mother"},
    {"title": "Why 'Who Is This?' Is Literally The Most Insulting Test Ever (Video)", "creative":  "/creatives/whois.jpg", "href": "http://elitedaily.com/humor/who-is-this-text-most-insulting-text-video/"},
    {"title": "The Six Worst Types of Coworkers: And How To Deal With Them", "creative":  "/creatives/coworker.jpg", "href": "http://elitedaily.com"},
    {"title": "4 in 5 Americans Are Ignoring Buffet's Warning", "creative":  "/creatives/buffet.jpg", "href": "http://www.fool.com/video-alert/stock-advisor/sa-nightmare-gfx/"},
    {"title": "Warren Buffet Just Gave Americans A Big Warning", "creative":  "/creatives/buffet.jpg", "href": "http://www.fool.com/video-alert/stock-advisor/sa-nightmare-gfx/"},
    {"title": "Americans Urged To Search Their Name On New Site", "creative":  "/creatives/american.jpg", "href": "http://www.instantcheckmate.com/"},
    {"title": "The Most Addicted Shopping Site For Women", "creative":  "/creatives/addicted.jpg", "href": "http://tophatter.com/blog"},
    {"title": "Power Companies Fear This Chicago Family", "creative":  "/creatives/solar.jpg", "href": "http://www.thedailylife.com/new-policy-makes-power-companies-shocked-and-furious"},
    {"title": "Six Reasons Your Wifi Is Your Most Important Relationship", "creative":  "/creatives/wif.jpg", "href": "http://elitedaily.com/life/culture/6-reasons-wifi-connection-important-relationship/"},
    {"title": "7 Overhyped Games That Ended Up Being Terrible", "creative":  "/creatives/terrible.jpg", "href": "http://www.looper.com/2323/hyped-games-ended-terrible/"},
    {"title": "Games That Punish You Seriously For Dying", "creative": "/creatives/dying.jpg", "href": "http://www.looper.com/2117/games-seriously-punish-dying"},
    {"title": "Find Out How This Shitty Dude Met A Girl", "creative": "/creatives/shittydudemale.jpg", "href": "http://www.shittydudefinder.com/?utm_source=kaboodle&utm_medium=referral&utm_content=male"},
    {"title": "But She Likes It...10 Women Who Dig Shitty Dudes", "creative": "/creatives/shittydudefemale.jpg", "href": "http://www.shittydudefinder.com/?utm_source=kaboodle&utm_medium=referral&utm_content=female"},
    {"title": "5 Weiner Dogs Compete In Adorable Water Race", "creative": "/creatives/weinerrace.jpg", "href": "http://www.littlebudha.com/dachshund-500-water-race/"},
    {"title": "Healthy Morning Drinks to Start Your Day Off", "creative": "/creatives/morningdrinks.png", "href": "http://epphany.com/site/post/577/"},
    {"title": "Best Ways to Scare Your Girlfriend", "creative": "/creatives/scaregirlfriend.png", "href": "http://epphany.com/site/post/116/"},
    {"title": "Movies That Ruined the Book", "creative": "/creatives/booksmovies.png", "href": "http://epphany.com/site/post/3"},
    {"title": "The 10 Most Disturbing Pokemon Facts", "creative": "/creatives/pokemon-facts.png", "href": "http://gamerant.com/pokemon-disturbing-facts"},
    {"title": "How To Impress Employers at Info Sessions", "creative": "/creatives/infosessions.png", "href": "http://ptsteadman.github.io/How-To-Impress/"},
    {"title": "So You Want to Date an Artist", "creative": "/creatives/saveartist.png", "href": "http://blog.newhive.com/so-u-want-to-date-an-artist/"},
    {"title": "So You Want to Date an Artist", "creative": "/creatives/saveartist.png", "href": "http://blog.newhive.com/so-u-want-to-date-an-artist/"},
    {"title": "Weight-lifting Kangaroo has Neighborhod on High Alert", "creative": "/creatives/buffkang.png", "href": "http://www.theweathernetwork.com/us/news/articles/animals/massive-super-buff-kangaroo-muscles-in-on-neighbourhood/51634/"},
    {"title": "Are Lentils a Low-Calorie Food?", "creative": "/creatives/lents.png", "href": "http://healthyeating.sfgate.com/lentils-lowcalorie-food-1034.html"},
    {"title": "10 Small Dogs and What They're Like", "creative": "/creatives/pug.jpg", "href": "http://www.sheknows.com/pets-and-animals/articles/808128/top-10-small-breed-dogs"},
    {"title": "15 Hot Female Athletes Who Are Only Famous For Their Looks", "creative": "/creatives/fathletes.jpg", "href": "http://www.rantsports.com/clubhouse/2014/04/04/15-hot-female-athletes-who-are-only-famous-for-their-looks"}
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
