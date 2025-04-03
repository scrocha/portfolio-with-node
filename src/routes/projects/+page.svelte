<svelte:head>
  <title>Projetos</title>
</svelte:head>

<script>
  import projects from "$lib/projects.json";
  import Project from "$lib/Project.svelte";
  import Pie from '$lib/Pie.svelte';
</script>

  <main>
    <h1>{ projects.length } Projetos</h1>
    <Pie/>
    <div class="projects">
      {#each projects as p}
        <Project data={p} />
        <!-- <article>
          <h2>{ p.title }</h2>
          <img src={ p.image } alt="" />
          <p>
            { p.description }
          </p>
        </article> -->
      {/each}
    </div>
  </main>
  
  <footer>
    <p>&copy; 2025 Sillas Rocha da Costa. Todos os direitos reservados.</p>
  </footer>
  