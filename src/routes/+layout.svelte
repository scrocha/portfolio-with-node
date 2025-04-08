<script>
import { base } from "$app/paths";
import { page } from "$app/stores";

let pages = [
    { url: "/", title: "Sobre Mim" },
    { url: "/projects", title: "Projetos" },
    { url: "/resume", title: "Currículo" },
        { url: "/contact", title: "Contato" },
    { url: "/meta", title: "Meta-análise" },
    { url: "https://github.com/scrocha", title: "GitHub" }
];

let localStorage = globalThis.localStorage ?? {};

let colorScheme = localStorage.colorScheme ?? "light dark";

let root = globalThis?.document?.documentElement;
root?.style.setProperty("color-scheme", colorScheme);
$: root?.style.setProperty("color-scheme", colorScheme);
$: localStorage.colorScheme = colorScheme;

</script>

<header>
  <nav>
    <ul>
      {#each pages as p}
        <li>
          <a
            href={p.url.startsWith("http") ? p.url : `${base}${p.url}`}
            class:current={$page.route.id === p.url}
            target={p.url.startsWith("http") ? "_blank" : undefined}
          >
            {p.title}
            {#if !p.url.startsWith("http") && $page.route.id === p.url}
              <div class="active-indicator"></div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

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
  background-color: rgba(245, 245, 245, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5em;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  width: 100%;
}

nav li {
  flex: 1;
  position: relative;
}

nav a {
  text-decoration: none;
  color: black; /* Força o texto da navbar a permanecer preto */
  text-align: center;
  padding: 1em 0.5em;
  display: block;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
}

nav .current {
  color: var(--collor-accent);
  font-weight: 600;
}

.active-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: var(--collor-accent);
  border-radius: 2px 2px 0 0;
}

nav a:hover {
  background-color: var(--collor-accent-bg);
  transform: translateY(-2px);
}

nav a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 3px;
  background-color: var(--collor-accent);
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

nav a:hover::after {
  width: 80%;
}

@media (max-width: 768px) {
  nav ul {
    flex-direction: column;
  }
  
  nav li {
    margin-bottom: 0.5em;
  }
  
  nav a {
    padding: 0.5em;
  }
}
</style>

<slot />
