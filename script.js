let data;

// Resizing variables
const maxW = 1200;
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

// Tooltip
const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('class', 'card')
    .style('opacity', 0);

// Draws the Heat Map
const renderHeatMap = () => {
    const svg = d3.select('.svg-target')
    .html('')
    .append('svg')
    .attr('class', 'card')
    .attr('width', w)
    .attr('height', h);

    // x axis
    const xScale = d3.scaleLinear()
        .domain([d3.min(data.monthlyVariance, d => d.year), d3.max(data.monthlyVariance, d => d.year)])
        .range([padding, w - padding])
        // .nice();

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'));

    svg.append('g')
        .attr('transform', `translate(0, ${h - padding})`)
        .attr('id', 'x-axis')
        .call(xAxis);

    // y axis
    const nums = [...Array(12).keys()].reverse();
    const dates = nums.map(n => `${`0${n+1}`.slice(-2)}/01/1970`);
    const months = dates.map(d => (new Date(d)).toLocaleString('en-us', {month: 'long'}));
    const yScale = d3.scaleBand()
        .domain(months)
        .range([h - padding, padding]);

    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('transform', `translate(${padding}, 0)`)
        .attr('id', 'y-axis')
        .call(yAxis);

    // rects.. need color

    console.log(data.monthlyVariance.filter(d => d.variance < 0).map(d => Math.abs(d.variance)));

    const bScale = d3.scaleLinear()
    // .domain([0, d3.max(data.monthlyVariance.map(d => Math.abs(d.variance)).filter(d => d < 0))])
        .domain([0, d3.max(data.monthlyVariance.filter(d => d.variance < 0).map(d => Math.abs(d.variance)))])
        .range([0,255]);

    console.log(bScale(3.4));


    // console.log(   h, padding  );
    console.log(`  ( (h - padding*2) / 12 ) * (1 + 1)   `)
    console.log(`  ( (${h} - ${padding}*2) / 12 ) * (1 + 1)   `)
    console.log(  ( (h - padding*2) / 12 ) * (1 + 1)   )
    svg.selectAll('rect')
        .data(data.monthlyVariance)
        .enter()
        .append('rect')

            // .attr('x', (d,i) =>((w-(padding*2)) / data.monthlyVariance.length) * i + padding)
            .attr('x', (d,i) =>    xScale(d.year)   )

            // .attr('y', d => (padding * yScale(0.5)))

            .attr('y', d =>  padding + (h-padding*2)/12 * (d.month - 1)     )

            // orig
            .attr('width', (w - padding*2) / data.monthlyVariance.length * 12)

            // .attr('width', 12)

            .attr('height',  (h-(padding * 2)) / 12  )
            .attr('stroke-width', 0)
            .attr('fill', 'red');


            // min/blue  -->  max/red


    // tooltip?

    // Legend
}

// Get data
(async () => {
    const response = await fetch('global-temperature.json');
    data = await response.json();
    console.log(data);
    drawHeatMap();
})();

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('resize', drawHeatMap);
});