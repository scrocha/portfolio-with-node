<svelte:head>
  <title>Meta-análise do Código</title>
</svelte:head>

<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Pie from '$lib/Pie.svelte';
  import Bar from '$lib/Bar.svelte';
  import {
    computePosition,
    autoPlacement,
    offset,
  } from '@floating-ui/dom';
  
  let csvData = [];
  let loading = true;
  let error = null;
  
  // Estatísticas que vamos calcular
  let fileTypes = [];
  let totalLines = 0;
  let fileCount = 0;
  let authorStats = [];
  let commits = [];
  let maxFileLength = 0;
  let longestFile = '';
  let avgLineLength = 0;
  let maxLineLength = 0;
  let longestLine = '';
  let maxDepth = 0;
  let avgDepth = 0;

  let width = 1000, height = 600;
  let margin = { top: 10, right: 10, bottom: 30, left: 20 };
  let usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left
  };
  usableArea.width = usableArea.right - usableArea.left;
  usableArea.height = usableArea.bottom - usableArea.top;

  $: minDate = d3.min(commits.map(d => d.date));
  $: maxDate = d3.max(commits.map(d => d.date));
  $: maxDatePlusOne = new Date(maxDate);
  $: maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);

  $: xScale = d3.scaleTime()
      .domain([minDate, maxDatePlusOne])
      .range([usableArea.left, usableArea.right])
      .nice();

  $: yScale = d3.scaleLinear()
      .domain([24, 0])
      .range([usableArea.bottom, usableArea.top]);

  $: rScale = d3.scaleSqrt()
      .domain(d3.extent(commits.map(d => d.totalLines)))
      .range([2, 30]);

  let xAxis, yAxis, yAxisGridlines;

  $: {
      d3.select(xAxis).call(d3.axisBottom(xScale));
      d3.select(yAxis).call(d3.axisLeft(yScale).tickFormat(d => String(d % 24).padStart(2, "0") + ":00"));
      d3.select(yAxisGridlines).call(
          d3.axisLeft(yScale)
            .tickFormat("")
            .tickSize(-usableArea.width)
      );
  }
  
  let hoveredIndex = -1;
  $: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};
  let cursor = {x: 0, y: 0};
  let tooltipPosition = {x: 0, y: 0};
  let commitTooltip;
  let clickedCommits = []; // Nova variável para rastrear commits clicados
  
  async function dotInteraction(index, evt) {
    let hoveredDot = evt.target;
    if (evt.type === "mouseenter") {
      hoveredIndex = index;
      cursor = {x: evt.x, y: evt.y};
      tooltipPosition = await computePosition(hoveredDot, commitTooltip, {
        strategy: "fixed", // because we use position: fixed
        middleware: [
          offset(5), // spacing from tooltip to dot
          autoPlacement() // to handle viewport edges
        ],
      });
    }
    else if (evt.type === "mouseleave") {
      hoveredIndex = -1;
    }
    else if (evt.type === "click") {
      let commit = commits[index];
      if (!clickedCommits.includes(commit)) {
        // Adiciona o commit ao array clickedCommits
        clickedCommits = [...clickedCommits, commit];
      }
      else {
        // Remove o commit do array
        clickedCommits = clickedCommits.filter(c => c !== commit);
      }
    }
  }

  onMount(async () => {
    try {
      const response = await fetch('./loc.csv');
      const text = await response.text();
      
      // Processando o CSV
      csvData = d3.csvParse(text);
      
      // Convertendo tipos de dados
      csvData = csvData.map(row => ({
        ...row,
        line: Number(row.line || 0),
        depth: Number(row.depth || 0),
        length: Number(row.length || 0),
        date: row.date ? new Date(row.date + "T00:00" + (row.timezone || "")) : null,
        datetime: row.datetime ? new Date(row.datetime) : null
      }));
      
      // Calculando estatísticas básicas
      fileCount = new Set(csvData.map(d => d.file)).size;
      totalLines = csvData.length;
      
      // Análise de commits
      commits = d3.groups(csvData, d => d.commit).map(([commit, lines]) => {
        if (!lines.length || !commit) return null;
        
        let first = lines[0];
        let {author, date, time, timezone, datetime} = first;
        let ret = {
          id: commit,
          url: `https://github.com/scrocha/portfolio-with-node/commit/${commit}`,
          author, date, time, timezone, datetime,
          hourFrac: datetime ? datetime.getHours() + datetime.getMinutes() / 60 : 0,
          totalLines: lines.length
        };
        
        // Adiciona lines como propriedade não enumerável
        Object.defineProperty(ret, "lines", {
          value: lines,
          configurable: true,
          writable: true,
          enumerable: false,
        });
        
        return ret;
      }).filter(c => c !== null);
      
      // Ordenando commits por tamanho para que os menores fiquem visíveis
      commits = d3.sort(commits, d => -d.totalLines);

      // Estatísticas adicionais
      const fileGroups = d3.groups(csvData, d => d.file);
      maxFileLength = d3.max(fileGroups, group => group[1].length) || 0;
      longestFile = fileGroups.find(group => group[1].length === maxFileLength)?.[0] || '';
      
      avgLineLength = d3.mean(csvData, d => d.length) || 0;
      maxLineLength = d3.max(csvData, d => d.length) || 0;
      longestLine = csvData.find(d => d.length === maxLineLength)?.content || '';
      
      maxDepth = d3.max(csvData, d => d.depth) || 0;
      avgDepth = d3.mean(csvData, d => d.depth) || 0;
      
      // Contando tipos de arquivo
      const fileTypeCount = d3.rollups(
        csvData, 
        v => v.length, 
        d => {
          const parts = d.file.split('.');
          return parts.length > 1 ? parts[parts.length - 1] : 'sem extensão';
        }
      );
      
      fileTypes = fileTypeCount.map(([type, count]) => {
        return { label: type, value: count };
      });
      
      // Estatísticas por autor
      const authorCount = d3.rollups(
        csvData,
        v => v.length,
        d => d.author
      );
      
      authorStats = authorCount.map(([author, count]) => {
        return { author, lines: count };
      }).sort((a, b) => b.lines - a.lines);
      
    } catch (err) {
      error = err;
    } finally {
      loading = false;
    }
  });

  $: allTypes = Array.from(new Set(csvData.map(d => d.type)));

  $: selectedLines = (clickedCommits.length > 0 ? clickedCommits : commits).flatMap(d => d.lines);

  $: selectedCounts = d3.rollup(
    selectedLines,
    v => v.length,
    d => d.type
  );

  $: languageBreakdown = allTypes.map(type => [type, selectedCounts.get(type) || 0]);

</script>

<main>
  <h1>Meta-análise do Código</h1>
  
  <p>Esta página apresenta estatísticas e visualizações sobre nosso código-fonte, geradas automaticamente a partir da análise do repositório.</p>
  
  {#if loading}
    <p>Carregando dados de análise do código...</p>
  {:else if error}
    <p class="error">Erro ao carregar dados: {error.message}</p>
  {:else}
    <section>
      <h2>Resumo</h2>
      <dl class="stats">
        <dt>Total de linhas:</dt>
        <dd>{totalLines}</dd>
        <dt>Total de arquivos:</dt>
        <dd>{fileCount}</dd>
        <dt>Total de commits:</dt>
        <dd>{commits.length}</dd>
        <dt>Arquivo mais longo:</dt>
        <dd>{longestFile} ({maxFileLength} linhas)</dd>
      </dl>
    </section>
    
    <section>
      <h2>Distribuição por Tipo de Arquivo</h2>
      <Pie data={fileTypes} />
    </section>
    
    <section>
      <h2>Análise de Commits</h2>
      <p>Total de commits: {commits.length}</p>
      {#if commits.length > 0}
        <table>
          <thead>
            <tr>
              <th>ID do Commit</th>
              <th>Autor</th>
              <th>Data</th>
              <th>Linhas Alteradas</th>
            </tr>
          </thead>
          <tbody>
            {#each commits.slice(0, 10) as commit}
              <tr>
                <td><a href={commit.url} target="_blank">{commit.id.substring(0, 7)}</a></td>
                <td>{commit.author}</td>
                <td>{commit.date ? new Date(commit.date).toLocaleDateString() : 'N/A'}</td>
                <td>{commit.totalLines}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <p><em>Mostrando os 10 commits mais recentes</em></p>
      {/if}
    </section>
    
    <section>
      <h3>Commits por horário do dia</h3>
      <svg viewBox="0 0 {width} {height}">
          <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
          <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
          <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
          <g class="dots">
              {#each commits as commit, index}
                  <circle
                      cx={ xScale(commit.datetime) }
                      cy={ yScale(commit.hourFrac) }
                      r={ rScale(commit.totalLines) }
                      fill="steelblue"
                      fill-opacity="0.5"
                      class:selected={ clickedCommits.includes(commit) }
                      on:mouseenter={evt => dotInteraction(index, evt)}
                      on:mouseleave={evt => dotInteraction(index, evt)}
                      on:click={evt => dotInteraction(index, evt)} />
              {/each}
          </g>
      </svg>
      
      <dl class="info tooltip" bind:this={commitTooltip} hidden={hoveredIndex === -1} style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px">
        <dt>Commit</dt>
        <dd><a href="{ hoveredCommit.url }" target="_blank">{ hoveredCommit.id?.substring(0, 7) }</a></dd>
        <dt>Data</dt>
        <dd>{ hoveredCommit.datetime?.toLocaleString("pt-BR", {dateStyle: "full"}) }</dd>
        <dt>Autor</dt>
        <dd>{ hoveredCommit.author }</dd>
        <dt>Hora</dt>
        <dd>{ hoveredCommit.time }</dd>
        <dt>Linhas Editadas</dt>
        <dd>{ hoveredCommit.totalLines }</dd>
      </dl>
    </section>

    <Bar data={languageBreakdown} width={width} />

  {/if}
</main>

<style>
  main {
    max-width: 800px;
    margin: 0 auto;
    padding: 1em;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1em;
  }
  
  th, td {
    padding: 0.5em;
    border: 1px solid #ccc;
    text-align: left;
  }
  
  th {
    background-color: #f0f0f0;
  }
  
  .error {
    color: red;
    font-weight: bold;
  }
  
  section {
    margin: 2em 0;
    padding: 1.5em;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    border-width: 0.15em;
    border-style: solid;
    border-color: var(--grey, #ccc);
    color: black;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5em;
    margin: 1em 0;
    overflow: visible;
    align-items: start;
  }
  
  dl.stats {
    display: grid;
    grid-template-columns: minmax(140px, auto) 1fr;
    gap: 0.8em 1em;
    margin: 0;
    align-items: baseline;
  }
  
  dt {
    font-weight: bold;
    color: var(--grey, #666);
    text-transform: uppercase;
    word-wrap: break-word;
    margin: 0;
  }
  
  dd {
    font-weight: bold;
    margin: 0;
    overflow-wrap: break-word;
    word-break: break-word;
  }
  
  a {
    color: var(--collor-accent, #0066cc);
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }

  svg {
    overflow: visible;
  }
  .gridlines {
    stroke-opacity: 0.2;
  }

  .info {
    display: grid;
    margin: 0;
    grid-template-columns: auto 1fr;
    background-color: oklch(100% 0% 0 / 80%);
    box-shadow: 1px 1px 3px 3px rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    backdrop-filter: blur(10px);
    padding: 10px;
    transition-duration: 500ms;
    transition-property: opacity, visibility;
  }
  
  .info dt {
    grid-column: 1;
    grid-row: auto;
    color: var(--grey, #666);
  }
  
  .info dd {
    grid-column: 2;
    grid-row: auto;
    font-weight: 400;
    margin-left: 1em;
  }
  
  .tooltip {
    position: fixed;
    z-index: 1000;
  }
  
  .tooltip[hidden]:not(:hover, :focus-within) {
    opacity: 0;
    visibility: hidden;
  }
  
  circle {
    transition: 200ms;
    transform-origin: center;
    transform-box: fill-box;
  }
  
  circle:hover {
    transform: scale(1.5);
  }
  
  .selected {
    fill: var(--collor-accent, oklch(65% 50% 70));
    stroke: #333;
    stroke-width: 1px;
  }
</style>
