<svelte:head>
  <title>Projetos</title>
</svelte:head>

<script>
  import projects from "$lib/projects.json";
  import Project from "$lib/Project.svelte";
  import Pie from '$lib/Pie.svelte';
  import * as d3 from 'd3';



let query = "";

// let filteredProjects;
$: filteredProjects = projects.filter(project => {
    let values = Object.values(project).join("\n").toLowerCase();
    return values.includes(query.toLowerCase());
});


let pieData;

    $: {
        // Initialize to an empty object every time this runs
        pieData = {};
        
        // Calculate rolledData and pieData based on filteredProjects here
        let rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);

        // We don't need 'let' anymore since we already defined pieData
        pieData = rolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }

// Define arcData and arcs outside the reactive block

let selectedYearIndex = -1;

let selectedYear;
$: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

</script>

  <main>
    <h1>{ projects.length } Projetos</h1>
    <Pie data={pieData} bind:selectedIndex={selectedYearIndex} />

    <input type="search" bind:value={query} aria-label="Search projects" placeholder="🔍 Search projects..." />

    <div class="projects">
      {#each filteredProjects as p}
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
  