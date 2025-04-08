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
  let commits = [];
  let maxFileLength = 0;
  let longestFile = '';
  let avgLineLength = 0;
  let maxLineLength = 0;
  let longestLine = '';
  let maxDepth = 0;
  let avgDepth = 0;
  
  onMount(async () => {
    try {
      const response = await fetch('/loc.csv');
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
      <div class="stats-container">
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
        
        <dl class="stats">
          <dt>Profundidade máxima:</dt>
          <dd>{maxDepth} níveis</dd>
          
          <dt>Profundidade média:</dt>
          <dd>{avgDepth.toFixed(2)} níveis</dd>
          
          <dt>Tamanho médio de linha:</dt>
          <dd>{avgLineLength.toFixed(2)} caracteres</dd>
          
          <dt>Linha mais longa:</dt>
          <dd title={longestLine}>{maxLineLength} caracteres</dd>
        </dl>
      </div>
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
    padding: 1.5em;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    border-width: 0.15em;
    border-style: solid;
    border-color: var(--grey, #ccc);
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
</style>
