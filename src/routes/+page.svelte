<svelte:head>
  <title>Sobre Mim</title>
</svelte:head>

<script>
let profileData = fetch("https://api.github.com/users/scrocha");
</script>

{#await profileData}
  <p>Carregando...</p>
{:then response}
  {#await response.json()}
    <p>Decodificando...</p>
  {:then data} 
    <section>
      <h2>Estatísticas do Meu Github</h2>
      <dl>
        <dt>Seguidores</dt>
        <dd>{data.followers}</dd>
        <dt>Seguindo</dt>
        <dd>{data.following}</dd>
        <dt>Repositórios Públicos</dt>
        <dd>{data.public_repos}</dd>
      </dl>
    </section>
  {:catch error}
    <p class="error">Algo deu errado: {error.message}</p>
  {/await}
  {:catch error}
    <p class="error">Algo deu errado: {error.message}</p>
{/await}

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

