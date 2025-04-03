<script>
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <!-- <h2>{data.title}</h2> -->
    <svelte:element this={"h" + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="" />
    <p>
        {data.description}
    </p>
</article>

<style>
    article{
	margin: 0.5em;
	display: grid;
	grid-template-rows: subgrid;
	grid-row: span 3;
    }

    article h2{
        margin: 0;
    }
    img {
        height: 12em;
    }
</style>