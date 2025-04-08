<svelte:head>
  <title>Sobre Mim</title>
</svelte:head>

<script>
import { onMount } from "svelte";

let githubData = null;
let loading = true;
let error = null;

onMount(async () => {
  try {
    const response = await fetch("https://api.github.com/users/scrocha");
    githubData = await response.json();
  } catch (err) {
    error = err;
  } finally {
    loading = false;
  }
});
</script>

{#if loading}
  <p>Carregando...</p>
{:else if error}
  <p class="error">Algo deu errado: {error.message}</p>
{:else}
  <section>
    <h2>Estatísticas do Meu Github</h2>
    <dl>
      <dt>Seguidores</dt>
      <dd>{githubData.followers}</dd>
      <dt>Seguindo</dt>
      <dd>{githubData.following}</dd>
      <dt>Repositórios Públicos</dt>
      <dd>{githubData.public_repos}</dd>
    </dl>
  </section>
{/if}

<main>
  <section id="about">
    <h2 style="text-align: center;">Sobre Mim</h2>
    <p>Sou graduando em Ciência de Dados e Inteligência Artificial pela Fundação Getúlio Vargas, apaixonado por usar dados para resolver problemas do mundo real. Meus interesses incluem aprendizado de máquina, análise de dados e desenvolvimento de soluções inovadoras para desafios complexos.</p>
    <figure>
      <img src="Sillas.jpg" alt="Sillas Rocha da Costa" width="400" height="400" >
    </figure>
  </section>
</main>
    
<footer>
  <p>&copy; 2025 Sillas Rocha da Costa. Todos os direitos reservados.</p>
</footer>

