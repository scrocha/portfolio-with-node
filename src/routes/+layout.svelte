
<script>
import { base } from "$app/paths";
import { page } from "$app/stores";


let pages = [
    { url: "/", title: "Sobre Mim" },
    { url: "/projects", title: "Projetos" },
    { url: "/resume", title: "Currículo" },
    { url: "/contact", title: "Contato" },
    { url: "https://github.com/scrocha", title: "GitHub" }
];


let localStorage = globalThis.localStorage ?? {};

let colorScheme = localStorage.colorScheme ?? "light dark";


let root = globalThis?.document?.documentElement;
root?.style.setProperty("color-scheme", colorScheme);
$: root?.style.setProperty("color-scheme", colorScheme);
$: localStorage.colorScheme = colorScheme;


</script>


<nav>
    {#each pages as p}
        <a
            href={p.url.startsWith("http") ? p.url: `${base}${p.url}`}
            class:current={$page.route.id === p.url}
            target={p.url.startsWith("http") ? "_blank" : undefined}
        >
            {p.title}
        </a>
    {/each}
</nav>


<label class="color-scheme">
    Theme:
    <select bind:value={colorScheme}>
        <option value="light dark"> Automatic </option>
        <option value="light"> Light </option>
        <option value="dark"> Dark </option>
    </select>
</label>


<style>
:root {
  --grey: oklch(80% 3% 200);
  --collor-accent: oklch(65% 50% 70);
  --collor-accent-bg: oklch(65% 50% 70 / 25%);
}

nav {
  display: flex;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--grey);
}

nav a {
  flex: 1;
  text-decoration: none;
  color: inherit;
  text-align: center;
  padding: 0.5em;
}

nav .current {
border-bottom-width: 0.4em;
border-bottom-style: solid;
border-bottom-color: var(--grey);
padding: 0.1em;

}
nav a:hover{
border-bottom-width: 0.4em;
border-bottom-style: solid;
border-bottom-color: var(--collor-accent);
padding-bottom: -0.1em;
background-color: var(--collor-accent-bg);
}

</style>


<slot />
