<script>
    import * as d3 from "d3";
    export let data = [];
    export let width = 600;
    export let barHeight = 50;
    export let colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    $: dataForStack = [Object.fromEntries(data)];
    $: stackedData = d3.stack().keys(Object.keys(data[0]))(dataForStack);
    $: total =
        d3.max(stackedData, (series) => d3.max(series, (d) => d[1])) || 1;

    const xScale = d3.scaleLinear().domain([0, total]).range([0, width]);
    const MIN_LABEL_WIDTH = 50;
</script>

<svg {width} height={barHeight}>
    {#each stackedData as series, i (series.key)}
        {#each series as d, j}
            <rect
                x={xScale(d[0])}
                y="0"
                width={xScale(d[1]) - xScale(d[0])}
                height={barHeight - 5}
                fill={colorScale(series.key)}
            />
            {#if xScale(d[1]) - xScale(d[0]) > MIN_LABEL_WIDTH}
                <text
                    x={(xScale(d[0]) + xScale(d[1])) / 2}
                    y={barHeight / 2}
                    text-anchor="middle"
                    fill="white"
                >
                    {series.key}: {d[1] - d[0]}
                </text>
            {/if}
        {/each}
    {/each}
</svg>

<div class="legend">
    {#each stackedData as series}
        <span style="color: {colorScale(series.key)}"
            >{series.key}: {series[0][1] - series[0][0]}</span
        >
    {/each}
</div>

<style>
    .legend {
        display: flex;
        gap: 1em;
        margin-top: 0.5em;
        font-size: 0.95em;
        flex-wrap: wrap;
    }
</style>
