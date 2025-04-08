<script>
  import { onMount } from 'svelte';
  
  let cppProjects = [
    {
      title: "Algoritmos em C++",
      description: "Implementação de diversos algoritmos clássicos de computação usando C++",
      image: "/images/cpp-algorithms.png"
    },
    {
      title: "Sistema de Gerenciamento",
      description: "Um sistema completo de gerenciamento de dados desenvolvido em C++ com Qt",
      image: "/images/cpp-management.png"
    },
    {
      title: "Biblioteca de Análise de Dados",
      description: "Uma biblioteca para análise e visualização de dados científicos em C++",
      image: "/images/cpp-data.png"
    }
  ];
  
  let codeExample = `#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> numbers = {5, 2, 8, 1, 7};
    
    // Ordenar os números
    std::sort(numbers.begin(), numbers.end());
    
    // Imprimir os números ordenados
    for(int n : numbers) {
        std::cout << n << " ";
    }
    
    return 0;
}`;
</script>

<svelte:head>
  <title>C++ - Meu Portfolio</title>
</svelte:head>

<main>
  <h1>Meus Projetos em C++</h1>
  
  <section>
    <h2>Sobre C++</h2>
    <p>
      C++ é uma linguagem de programação de propósito geral criada por Bjarne Stroustrup como uma extensão da linguagem C.
      É amplamente utilizada para desenvolvimento de software de sistemas, aplicativos de desktop, jogos e sistemas embarcados.
    </p>
    <p>
      Trabalho com C++ há diversos anos, aplicando conceitos avançados como programação orientada a objetos, 
      templates, STL (Standard Template Library) e otimização de código.
    </p>
  </section>
  
  <section>
    <h2>Projetos Destacados</h2>
    <div class="projects-grid">
      {#each cppProjects as project}
        <div class="project-card">
          <h3>{project.title}</h3>
          <div class="img-placeholder" style="background-image: url({project.image})"></div>
          <p>{project.description}</p>
        </div>
      {/each}
    </div>
  </section>
  
  <section>
    <h2>Exemplo de Código</h2>
    <pre><code>{codeExample}</code></pre>
  </section>
</main>

<style>
  main {
    max-width: 1000px;
    margin: 0 auto;
    padding: 1em;
  }
  
  section {
    margin: 2em 0;
    padding: 1.5em;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5em;
    margin-top: 1.5em;
  }
  
  .project-card {
    padding: 1em;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .project-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  .img-placeholder {
    height: 150px;
    background-color: #eee;
    border-radius: 4px;
    margin: 1em 0;
    background-size: cover;
    background-position: center;
  }
  
  pre {
    background-color: #282c34;
    color: #abb2bf;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', monospace;
  }
  
  h1, h2, h3 {
    color: #333;
  }
  
  @media (max-width: 768px) {
    .projects-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
