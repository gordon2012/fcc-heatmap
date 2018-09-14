let data;

// Resizing variables
const maxW = 800;
const maxH = 600;

const maxPadding = 50;
const minPadding = 50;
const wrapPadding = 15;

let w = 800;
let h = 600;
let padding = maxPadding;

// Helper function to improve performance
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

// Window resizing wrapped in said function
var resize = debounce(function () {
    const title = document.getElementById('title');
    const titleStyle = getComputedStyle(title);
    const titleHeight = title.offsetHeight + parseInt(titleStyle.marginTop) + parseInt(titleStyle.marginBottom);

    if(window.innerWidth < 900) {
        w = window.innerWidth - (wrapPadding * 2);
        h = window.innerHeight - titleHeight - (wrapPadding * 2) - 5;
        padding = minPadding;
    } else {
        w = maxW;
        h = maxH;
        padding = maxPadding;
    }

    drawHeatMap();
}, 100);

// Tooltip
const tooltip = d3.select('body').append('div')
    .attr('id', 'tooltip')
    .attr('class', 'card')
    .style('opacity', 0);

// Draws the Heat Map
const drawHeatMap = () => {
    const svg = d3.select('.svg-target')
    .html('')
    .append('svg')
    .attr('class', 'card')
    .attr('width', w)
    .attr('height', h);

    // x axis

    // y axis

    // rects?
    // tooltip?

    // Legend

}

// Get data
data = [];
resize();
