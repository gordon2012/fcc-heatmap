let data;

// Resizing variables
const maxW = 2000;
const maxH = 600;

const maxPadding = 75;
const minPadding = 75;
const wrapPadding = 15;

let w = maxW;
let h = maxH;
let padding = maxPadding;

// Helper function to improve performance when resizing the window
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if(!immediate) {
                func.apply(context, args);
            }
        }
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if(callNow) {
            func.apply(context, args);
        }
    };
};

// Render function and resizing wrapped in debounce
var drawHeatMap = debounce(function () {
    const title = document.getElementById('title');
    const titleStyle = getComputedStyle(title);
    const titleHeight = title.offsetHeight + parseInt(titleStyle.marginTop) + parseInt(titleStyle.marginBottom);

    if(window.innerWidth < maxW + 2 * maxPadding) {
        w = window.innerWidth - (wrapPadding * 2);
        h = window.innerHeight - titleHeight - (wrapPadding * 2);
        padding = minPadding;
    } else {
        w = maxW;
        h = maxH;
        padding = maxPadding;
    }
    renderHeatMap();
}, 100);

// Draws the Heat Map
const renderHeatMap = () => {
    const svg = d3.select('.svg-target')
    .html('')
    .append('svg')
    .attr('class', 'card')
    .attr('width', w)
    .attr('height', h);

    // Title
    d3.select('.title-baseTemp').html(`${data.baseTemperature}&deg;C`);

    // x axis
    const xScale = d3.scaleLinear()
        .domain([d3.min(data.monthlyVariance, d => d.year), d3.max(data.monthlyVariance, d => d.year)])
        .range([padding, w - padding])
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));
    svg.append('g')
        .attr('transform', `translate(0, ${h - padding})`)
        .attr('id', 'x-axis')
        .call(xAxis);

    // y axis
    const nums = [...Array(12).keys()];
    const dates = nums.map(n => `${`0${n+1}`.slice(-2)}/01/1970`);
    const months = dates.map(d => (new Date(d)).toLocaleString('en-us', {month: 'long'}));
    const yScale = d3.scaleBand()
        .domain(months)
        .range([padding, h - padding]);
    const yAxis = d3.axisLeft(yScale);
    svg.append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);

    // Color scale
    const colorScale = d3.scaleLinear()
        .domain([d3.min(data.monthlyVariance, d => d.variance), d3.max(data.monthlyVariance, d => d.variance)])
        .range([0,1]);

    // Rects
    svg.selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')
            .attr('x', (d,i) => xScale(d.year) + 1)
            .attr('y', d =>  padding + (h - padding * 2) / 12 * (d.month - 1))
            .attr('width', (w - padding * 2) / data.monthlyVariance.length * 12)
            .attr('height', yScale.bandwidth())
            .attr('fill', d => d3.interpolateRdYlBu(1 - colorScale(d.variance)))
            .attr('class', 'cell')
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => d.variance)
            .attr('data-monthName', d => months[d.month - 1])
            .attr('data-temperature', d => (data.baseTemperature + d.variance).toFixed(1))
            .attr('data-variance', d => d.variance.toFixed(1))

    // Legend
    const legendScale = d3.scaleSequential(t => d3.interpolateRdYlBu(1-t))
        .domain([
            d3.min(data.monthlyVariance, d => data.baseTemperature + d.variance),
            d3.max(data.monthlyVariance, d => data.baseTemperature + d.variance)
        ]);
    svg.append('g')
        .attr('id', 'legend')
        .attr('transform', `translate(${padding}, ${h - padding + (padding / 3)})`);
    var legend = d3.legendColor()
        .cells(10)
        .shapePadding(0)
        .shapeWidth(((w-padding*2) / 10))
        .orient('horizontal')
        .scale(legendScale);
    svg.select('#legend')
        .call(legend);
}

// Get data
(async () => {
    const response = await fetch('global-temperature.json');
    data = await response.json();
    drawHeatMap();
})();

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', drawHeatMap);

    // Tooltip
    document.querySelector('body').addEventListener('mouseover', event => {
        const el = event.target;

        if(el.classList.contains('cell')) {
            const elr = el.getBoundingClientRect();
            const d = el.dataset;

            const tt = document.getElementById('tooltip');
            const ttr = tt.getBoundingClientRect();
            tt.style.opacity = 1;
            tt.style.left = `${elr.x - ttr.width/2}px`;
            tt.style.top = `${elr.y - ttr.height - 10}px`;

            tt.dataset.year = d.year;
            tt.innerHTML = `
                <strong>${d.monthName} ${d.year}</strong><br>
                <hr>
                ${d.temperature}&deg;C<br>
                ${d.variance < 0 ? '' : '+'}${d.variance}&deg;C
            `;
        }
    });
    document.querySelector('body').addEventListener('mouseout', event => {
        if(event.target.classList.contains('cell')) {
            document.getElementById('tooltip').style.opacity = 0;
        }
    });
});
