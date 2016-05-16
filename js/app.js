var width = 960,
    height = 600;
    
var widthChart = 460,
    heightChart = 300;

var margin = {
    top: 30,
    right: 30,
    left : 80,
    bottom : 30
}   

//for line chart
var xScale = d3.scale.linear()
    .range([margin.left, widthChart - margin.right]);
    
var yScale = d3.scale.linear()
    .range([heightChart - margin.top, margin.bottom]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .ticks(10);

var yAxis = d3.svg.axis()
    .scale(yScale)
    .ticks(7)
    .orient("left");  

//for bubble chart
var x = d3.scale.linear()
    .range([margin.left, widthChart - margin.right]);

var y = d3.scale.linear()
    .range([heightChart - margin.top, margin.bottom]);

var xAxisBubble = d3.svg.axis()
    .scale(x)
    .ticks(3)
    .orient("bottom");

var yAxisBubble = d3.svg.axis()
    .scale(y)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.value); })
    .interpolate("basis");

var projection = d3.geo.mercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

var path = d3.geo.path()
    .projection(projection);

var color = d3.scale.category20b();

var bubble = d3.layout.pack()
    .sort(null)
    .value(function(d) {
        return d.ContinentSize;
    })
    .size([widthChart, heightChart])
    .padding(3);

var svgBubble = d3.select("body").select(".container").select(".row").select(".bubbleChart").append("svg")
    .attr('width', widthChart)
    .attr('height', heightChart)
    .attr("class", "bubble");
    
var svg = d3.select("body").select(".container").select(".center-block").select(".map").append("svg")
    .attr("width", width)
    .attr("height", height);
    
var svgLineChart = d3.select("body").select(".container").select(".row").select(".lineChart").append("svg")
    .attr("width", widthChart)
    .attr("id", "svgLineChart")
    .attr("height", heightChart);

    
var tooltip = d3.select('body').append('div')
            .attr('class', 'hidden tooltip');    

var tooltipBubble = d3.select('body').append('div')
    .attr('class', 'hidden tooltip'); 

queue()  
    .defer(d3.json, 'topoJSON/countries.topo.json')
    .defer(d3.csv, 'data/countriesModified.csv')
    .defer(d3.csv, 'data/countriesPopulation.csv')
    .defer(d3.csv, 'data/continents.csv')
    .await(visualize);
    
function visualize(error, countries, data, population, continents) {
    if (error) return console.error(error);
    
    continents.forEach(function(d) {
        d.size = +d["ContinentSize"];
        d.population = +d["ContinentPopulation"];
        d.continentName = d["ContinentName"];
    });

    y.domain([
        d3.min(continents, function(d) {return d.population}),
        d3.max(continents, function(d) {return d.population})
    ]);
    
    x.domain([
        d3.min(continents, function(d) {return d.size}),
        d3.max(continents, function(d) {return d.size})
    ]);
    
    svgBubble.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (heightChart - margin.bottom)  + ")")
        .call(xAxisBubble)
        .append("text")
        .attr("class", "label")
        .attr("x", widthChart)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("Country size");

    svgBubble.append("g")
        .attr("transform", "translate(" + (margin.left) + ",0)")
        .attr("class","y axis")
        .call(yAxisBubble)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".5em")
        .attr("x",0 - (heightChart / 2))
        .style("text-anchor", "middle")
        .text("Population"); 

    svgBubble.selectAll(".dot")
        .data(continents)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", function(d) {return (d.size / 10000000) * 6.5})
        .attr("cx", function(d) { return x(d.size); })
        .attr("cy", function(d) { return y(d.population); })
        .style("fill", function(d) { return color(d.ContinentName); })
        .on("mouseout", function(d) {
            tooltipBubble.classed('hidden', true);
            d3.select(this)
                .transition()
                .duration(50)
                .attr("fill", "#747e87")
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });
            tooltipBubble.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 200) +
                        'px; top:' + (mouse[1] + 120) + 'px')
            .html(d.continentName + "</br>" + "Size:" + d.size + "km2" + "</br>" + "Population: " + d.population);
        });
    
    var countriesObj = {};
    var countriesArr = [];
    for (var i = 0; i < data.length-1; i++) {
        countriesObj[i] = {
            countryName : data[i].CountryName,
            countryCode : data[i].CountryCode, 
            years : [
//                {year : "1960", value : data[i].y1960, population : population[i].y1960},
//                {year : "1961", value : data[i].y1961, population : population[i].y1961},
//                {year : "1962", value : data[i].y1962},
//                {year : "1963", value : data[i].y1963},
//                {year : "1964", value : data[i].y1964},
//                {year : "1965", value : data[i].y1965},
//                {year : "1966", value : data[i].y1966},
//                {year : "1967", value : data[i].y1967},
//                {year : "1968", value : data[i].y1968},
//                {year : "1969", value : data[i].y1969},
//                {year : "1970", value : data[i].y1970},
//                {year : "1971", value : data[i].y1971},
//                {year : "1972", value : data[i].y1972},
//                {year : "1973", value : data[i].y1973},
//                {year : "1974", value : data[i].y1974},
//                {year : "1975", value : data[i].y1975},
//                {year : "1976", value : data[i].y1976},
//                {year : "1977", value : data[i].y1977},
//                {year : "1978", value : data[i].y1978},
//                {year : "1979", value : data[i].y1979},
//                {year : "1980", value : data[i].y1980, population : population[i].y1980},
//                {year : "1981", value : data[i].y1981, population : population[i].y1981},
//                {year : "1982", value : data[i].y1982, population : population[i].y1982},
//                {year : "1983", value : data[i].y1983, population : population[i].y1983},
//                {year : "1984", value : data[i].y1984, population : population[i].y1984},
//                {year : "1985", value : data[i].y1985, population : population[i].y1985},
//                {year : "1986", value : data[i].y1986, population : population[i].y1986},
//                {year : "1987", value : data[i].y1987, population : population[i].y1987},
//                {year : "1988", value : data[i].y1988, population : population[i].y1988},
//                {year : "1989", value : data[i].y1989, population : population[i].y1989},
//                {year : "1990", value : data[i].y1990, population : population[i].y1990},
//                {year : "1991", value : data[i].y1991, population : population[i].y1991},
//                {year : "1992", value : data[i].y1992, population : population[i].y1992},
//                {year : "1993", value : data[i].y1993, population : population[i].y1993},
//                {year : "1994", value : data[i].y1994, population : population[i].y1994},
//                {year : "1995", value : data[i].y1995, population : population[i].y1995},
                {year : "1996", value : data[i].y1996, population : population[i].y1996},
                {year : "1997", value : data[i].y1997, population : population[i].y1997},
                {year : "1998", value : data[i].y1998, population : population[i].y1998},
                {year : "1999", value : data[i].y1999, population : population[i].y1999},
                {year : "2000", value : data[i].y2000, population : population[i].y2000},
                {year : "2001", value : data[i].y2001, population : population[i].y2001},
                {year : "2002", value : data[i].y2002, population : population[i].y2002},
                {year : "2003", value : data[i].y2003, population : population[i].y2003},
                {year : "2004", value : data[i].y2004, population : population[i].y2004},
                {year : "2005", value : data[i].y2005, population : population[i].y2005},
                {year : "2006", value : data[i].y2006, population : population[i].y2006},
                {year : "2007", value : data[i].y2007, population : population[i].y2007},
                {year : "2008", value : data[i].y2008, population : population[i].y2008},
                {year : "2009", value : data[i].y2009, population : population[i].y2009},
                {year : "2010", value : data[i].y2010, population : population[i].y2010},
                {year : "2011", value : data[i].y2011, population : population[i].y2011},
                {year : "2012", value : data[i].y2012, population : population[i].y2012},
                {year : "2013", value : data[i].y2013, population : population[i].y2013},
                {year : "2014", value : data[i].y2014, population : population[i].y2014}
            ]
        }
        countriesArr[i] = countriesObj[i];
    }
    
    function getCountryName(id) {
        for (var i = 0; i < countriesArr.length; i++) {
            if (countriesArr[i].countryCode === id) {
                return countriesArr[i].countryName;
            }
        }
    }
    
    function getHowManyCountries() {
        return countriesArr.length;
    }
    
    console.log(countriesArr[0]);
    
    d3.select(".howMany").text(getHowManyCountries);
    
    function chooseCountry(d) {
        var countryId = d.id;
        console.log(countryId);
        for (var i = 0; i < countriesArr.length - 1; i++) {
            if (countriesArr[i].countryCode === countryId) {
                var min = d3.min(countriesArr[i].years, function(d) {return d.value;});
                var max = d3.max(countriesArr[i].years, function(d) {return d.value});
                yScale.domain([min, max]);
                
                var minYear = d3.min(countriesArr[i].years, function(d) {return d.year;});
                var maxYear = d3.max(countriesArr[i].years, function(d) {return d.year});
                xScale.domain([minYear, maxYear]);
                  
                //LINE CHART
                svgLineChart.selectAll("*")
                    .remove();
                
                svgLineChart.append("g")
                    .attr("transform", "translate(0," + (heightChart - margin.bottom) + ")")
                    .attr("class","x axis")
                    .call(xAxis);
                
                svgLineChart.append("g")
                    .attr("transform", "translate(" + (margin.left) + ",0)")
                    .attr("class","y axis")
                    .call(yAxis)
                    .append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".5em")
                    .attr("x",0 - (heightChart / 2))
                    .style("text-anchor", "middle")
                    .text("Population density [people / km2]"); 
                
                svgLineChart.append("path")
                    .datum(countriesArr[i].years)
                    .attr("class", "line")
                    .attr("d", line);
                
                d3.select("#description")
                    .text(countriesArr[i].countryName);
                }
            }
        return countryId;      
    }

//DRAW A MAP
svg.append("g")
    .attr("id", "countries")
    .selectAll("path")
    .data(topojson.feature(countries, countries.objects.countries).features)
    .enter()
    .append("path")
    .attr("fill", "#747e87")
    .style("stroke", "#363b3f")
    .attr("id", function(d) { return d.id; })
    .attr("d", path)
    .on("click", function(d) {
        chooseCountry(d);
        d3.select(".selected").classed("selected", false);
        d3.select(this).classed("selected", true);
    })
    .on("mouseover", function(d) {
        d3.select(this)
            .transition()
            .duration(50)
            .attr("fill", "#b0bf91");
    })
    .on("mouseout", function(d) {
        tooltip.classed('hidden', true);
        d3.select(this)
            .transition()
            .duration(50)
            .attr("fill", "#747e87")
    })
    .on("mousemove", function(d) {
        var mouse = d3.mouse(svg.node()).map(function(d) {
            return parseInt(d);
        });
        tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 200) +
                    'px; top:' + (mouse[1] + 120) + 'px')
            .html(getCountryName(d.id));
    });
               
};
