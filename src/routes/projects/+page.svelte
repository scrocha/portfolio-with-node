<svelte:head>
  <title>Projetos</title>
</svelte:head>

<script>
  import projects from "$lib/projects.json";
</script>

  <main>
    <h1>{ projects.length } Projetsos</h1>
    <div class="projects">
      {#each projects as p}
        <article>
          <h2>{ p.title }</h2>
          <img src={ p.image } alt="" />
          <p>
            { p.description }
          </p>
        </article>
      {/each}
    </div>
  </main>
  
  <footer>
    <p>&copy; 2025 Sillas Rocha da Costa. Todos os direitos reservados.</p>
  </footer>
  