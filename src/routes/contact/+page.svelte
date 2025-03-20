<svelte:head>
  <title>Contato</title>
</svelte:head>


  <section id="email-form">
    <h2>Envie um email:</h2>
    <form action="mailto:sillasrocha29@gmail.com" method="GET">
        <label for="email">Email:</label> <br>
        <input name="email" type="email"> <br>
        <label for="subject">Assunto:</label> <br>
        <input name="subject" type="text"> <br>
        <label for="body">Mensagem:</label> <br>
        <textarea name="body"></textarea> <br>
        <button>Enviar</button>
    </form>

    <footer>
        <p>&copy; 2025 Sillas Rocha da Costa. Todos os direitos reservados.</p>
      </footer>
  </section>