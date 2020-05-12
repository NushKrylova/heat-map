function drawChart(data) {
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const baseTemperature = data.baseTemperature;
    const monthlyVarianceData = data.monthlyVariance;
    const yearsData = monthlyVarianceData.map(d => d["year"])

    const variance = monthlyVarianceData.map(d => baseTemperature + d["variance"])
    var minTemp = Math.min(...variance);
    var maxTemp = Math.max(...variance);
    var colors = ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]

    function formatMonth(m) {
        var d = new Date(0);
        d.setUTCMonth(m - 1);
        return d3.timeFormat("%B")(d)
    }

    function fillTemperatureArray(min, max, count) {
        var array = [];
        var step = (max - min) / count;
        var base = min;
        for (var i = 1; i < count; i++) {
            array.push(base + i * step);
        }
        return array;
    }
    const temperatureArray = fillTemperatureArray(minTemp, maxTemp, colors.length)

    var colorScale = d3.scaleThreshold()
        .domain(temperatureArray)
        .range(colors);

    var fontSize = 16;
    var chartWidth = 5 * Math.ceil(variance.length / 12); //~1300;
    var chartHeight = 33 * 12; //~400;
    var padding = { left: 9 * fontSize, right: 9 * fontSize, top: 1 * fontSize, bottom: 8 * fontSize };

    const w = chartWidth + padding.left + padding.right;
    const h = chartHeight + padding.top + padding.bottom;

    // render svg
    var svg = d3.select('.chart')
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + padding.left + "," + padding.top + ")");

    // render yAxis
    var yScale = d3.scaleBand()
        .domain(months)
        .range([0, chartHeight]);

    var yAxis = d3.axisLeft(yScale)
        .tickFormat(formatMonth);

    svg.append('g')
        .attr('transform', `translate(-1, 0)`)
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("class", "tick")
        .append("text");

    //render xAxis
    var xScale = d3.scaleBand()
        .domain(yearsData)
        .range([0, chartWidth])

    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .tickValues(xScale.domain().filter(year => year % 10 === 0));

    svg.append("g")
        .attr('transform', `translate(-1, ${chartHeight})`)
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("class", "tick")
        .append("text")

    svg.selectAll('rect')
        .data(monthlyVarianceData)
        .enter().append('g').append('rect')
        .attr('class', 'cell')
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('y', d => yScale(d["month"]))
        .attr('x', d => xScale(d["year"]))
        .attr('data-month', d => d["month"] - 1)
        .attr('data-year', d => d["year"])
        .attr('data-temp', d => baseTemperature + d["variance"])
        .attr('fill', d => {
            var temp = baseTemperature + d["variance"];
            var color = colorScale(temp);
            return color;
        })
        .on("mouseover", d => {
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9)
                .attr("data-year", d["year"]);
            tooltip.html(d["year"] + "-" + formatMonth(d["month"]) + "<br/>"
                + d3.format(".1f")(baseTemperature + d["variance"]) + "&#8451;" + "<br/>"
                + d3.format(".1f")(d["variance"]) + "&#8451;")
                .style("left", (d3.event.pageX + 10) + "px")
                .style("top", (d3.event.pageY - 28) + "px")
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -200)
        .attr('y', -80)
        .attr("class", "label")
        .text('Months');

    svg.append('text')
        .attr('x', 600)
        .attr('y', 450)
        .attr("class", "label")
        .text('Years');

    let tooltip = d3.select(".chart")
        .append("div")
        .attr("class", "tooltip")
        .attr("id", "tooltip")
        .style("opacity", 0);

    //add legend
    const legendCellHeight = 20;
    const legendCellWidth = 40;

    var legendContainer = svg.append("g")
        .attr("id", "legend")

    var legend = legendContainer.selectAll("g")
        .data(colors)
        .enter().append("g")
        .attr("class", "legend-label")
        .attr("transform", (d, i) => "translate(" + (i * legendCellWidth) + ",0)");

    var legendRect = legend.append("rect")
        .attr("y", chartHeight + 80)
        .attr("width", legendCellWidth)
        .attr("height", legendCellHeight)
        .style("fill", d => d);

    //add text to the legend
    legend.append("text")
        .data(temperatureArray)
        .attr("y", chartHeight + legendCellHeight + 95)
        .attr("x", legendCellWidth - 7)
        .attr("class", "legend-text")
        .attr("class", "tick")
        .text(d => d3.format(".1f")(d))

}

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(response => response.json())
    .then(data => drawChart(data));
