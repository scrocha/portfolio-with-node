<svelte:head>
  <title>Meta-análise do Código</title>
</svelte:head>

<script>
  import * as d3 from 'd3';
  import { onMount } from 'svelte';
  import Pie from '$lib/Pie.svelte';
  
  let csvData = [];
  let loading = true;
  let error = null;
  
  // Estatísticas que vamos calcular
  let fileTypes = [];
  let totalLines = 0;
  let fileCount = 0;
  let authorStats = [];
  
  onMount(async () => {
    try {
      const response = await fetch('/loc.csv');
      const text = await response.text();
      
      // Processando o CSV
      csvData = d3.csvParse(text);
      
      // Calculando estatísticas básicas
      fileCount = new Set(csvData.map(d => d.file)).size;
      totalLines = csvData.length;
      
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
      <h2>Visão Geral</h2>
      <dl>
        <dt>Total de arquivos:</dt>
        <dd>{fileCount}</dd>
        
        <dt>Total de linhas:</dt>
        <dd>{totalLines}</dd>
      </dl>
    </section>
    
    <section>
      <h2>Distribuição por Tipo de Arquivo</h2>
      <Pie data={fileTypes} />
    </section>
    
    <section>
      <h2>Contribuições por Autor</h2>
      <table>
        <thead>
          <tr>
            <th>Autor</th>
            <th>Linhas</th>
            <th>Porcentagem</th>
          </tr>
        </thead>
        <tbody>
          {#each authorStats as { author, lines }}
            <tr>
              <td>{author}</td>
              <td>{lines}</td>
              <td>{((lines / totalLines) * 100).toFixed(2)}%</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
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
  }
  
  dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5em 1em;
  }
  
  dt {
    font-weight: bold;
  }
</style>
