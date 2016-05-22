
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
    .ticks(10)
    .tickFormat(d3.format("d"));

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
    .orient("bottom")
    .tickFormat(d3.format("d"));

var yAxisBubble = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("d"));

var line = d3.svg.line()
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.value); });
//    .interpolate("basis");

var projection = d3.geo.mercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

var path = d3.geo.path()
    .projection(projection);

var color = d3.scale.category20b();
//var color = d3.scale.linear().range(["white", "blue"]);

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

var svgCompare = d3.select("body").select(".container").select("#countriesToCompare").append("svg")
    .attr("width", widthChart)
    .attr("height", heightChart)
    .append("g")
    .attr("transform", "translate(" + widthChart / 2 + "," + heightChart / 2 + ")");;
    
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
    
var countriesObj = {};
var countriesArr = [];     

function visualize(error, countries, data, population, continents) {
    if (error) return console.error(error);
    
    continents.forEach(function(d) {
        d.size = +d["ContinentSize"];
        d.population = +d["ContinentPopulation"];
        d.continentName = d["ContinentName"];
    });
    
    //BUBBBLE CHART
    y.domain([
        d3.min(continents, function(d) {return d.population}),
        d3.max(continents, function(d) {return d.population})
    ]);
    
    x.domain([
        d3.min(continents, function(d) {return d.size}),
        d3.max(continents, function(d) {return d.size})
    ]);
    
    
    function getCurrentPopulation() {
        var worldPopulation = 0;
        for (var i = 0; i < continents.length; i++) {
            worldPopulation += continents[i].population;
        }
        return worldPopulation;
    }
    
     d3.select("#worldPopulation").text(getCurrentPopulation());
    
    svgBubble.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (heightChart - margin.bottom)  + ")")
        .call(xAxisBubble)
        .append("text")
        .attr("class", "label")
        .attr("x", widthChart)
        .attr("y", -6)
        .attr("text-anchor", "end")
        .text("Continent size");

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
        .style("fill", function(d) { return color(d.continentName); })
        .attr("opacity", 1)
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("opacity", .5);
        })
        .on("mouseout", function(d) {
            tooltipBubble.classed('hidden', true);
            d3.select(this)
                .transition()
                .duration(50)
                .attr("fill", "#747e87")
                .attr("opacity", 1)
        })
        .on("mousemove", function(d) {
            var mouse = d3.mouse(svg.node()).map(function(d) {
                return parseInt(d);
            });
            tooltipBubble.classed('hidden', false)
                .attr('style', 'left:' + (mouse[0] + 150) +
                        'px; top:' + (mouse[1] + 180) + 'px')
            .html("<p class=\"centerTip\">" + d.continentName + "</br>" 
                  + "Size:" 
                  + d.size + "km2" + "</br>" 
                  + "Population: " + d.population + "</p>");
        });
    
    for (var i = 0; i < data.length; i++) {
        countriesObj[i] = {
            countryName : data[i].CountryName,
            countryCode : data[i].CountryCode, 
            years : [
                {year : "1980", value : data[i].y1980, population : population[i].y1980},
                {year : "1981", value : data[i].y1981, population : population[i].y1981},
                {year : "1982", value : data[i].y1982, population : population[i].y1982},
                {year : "1983", value : data[i].y1983, population : population[i].y1983},
                {year : "1984", value : data[i].y1984, population : population[i].y1984},
                {year : "1985", value : data[i].y1985, population : population[i].y1985},
                {year : "1986", value : data[i].y1986, population : population[i].y1986},
                {year : "1987", value : data[i].y1987, population : population[i].y1987},
                {year : "1988", value : data[i].y1988, population : population[i].y1988},
                {year : "1989", value : data[i].y1989, population : population[i].y1989},
                {year : "1990", value : data[i].y1990, population : population[i].y1990},
                {year : "1991", value : data[i].y1991, population : population[i].y1991},
                {year : "1992", value : data[i].y1992, population : population[i].y1992},
                {year : "1993", value : data[i].y1993, population : population[i].y1993},
                {year : "1994", value : data[i].y1994, population : population[i].y1994},
                {year : "1995", value : data[i].y1995, population : population[i].y1995},
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
    console.log(countriesArr[0]);
    
    function chooseCountry(d) {
        var countryId = d.id;
        for (var i = 0; i < countriesArr.length - 1; i++) {
            if (countriesArr[i].countryCode === countryId) {
                var min = d3.min(countriesArr[i].years, function(d) {return d.value;});
                var max = d3.max(countriesArr[i].years, function(d) {return d.value});
                yScale.domain([min, max]);
                
                var minYear = d3.min(countriesArr[i].years, function(d) {return d.year;});
                var maxYear = d3.max(countriesArr[i].years, function(d) {return d.year});
                xScale.domain([minYear, maxYear]);
                
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
                
                svgLineChart.selectAll("dot")
                    .data(countriesArr[i].years)
                    .enter()
                    .append("circle")
                    .attr("r", 5)
                    .attr("fill", "transparent")
                    .attr("stroke", "#ecffc4")
                    .attr("stroke-width", 1.5)
                    .attr("cx", function(d) { return xScale(d.year); })
                    .attr("cy", function(d) { return yScale(d.value); })
                    .on("mouseover", function(d) { 
                        d3.select(this)
                            .transition()
                            .duration(50)
                            .attr("r", 9)
                            .attr("stroke-width", 4); 
                    })
                    .on("mouseout", function(d) { 
                        tooltip.classed('hidden', true);
                        d3.select(this)
                            .transition()
                            .duration(50)
                            .attr("r", 5)
                            .attr("stroke-width", 1.5); 
                    })
                    .on("mousemove", function(d) {
                        var mouse = d3.mouse(svg.node()).map(function(d) {
                            return parseInt(d);
                        });
                        tooltip.classed('hidden', false)
                        .attr('style', 'left:' + (mouse[0] + 150) + 'px; top:' + (mouse[1] + 180) + 'px')
                        .html("<p class=\"centerTip\">" + d.year + " : " + d.value + "</p>");
                    });
                
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
        console.log("pop" + getCountryPopulation(d.id));
        d3.select("#countryPopulation")
            .text("(current URBAN population: " + getCountryPopulation(d.id) + ")");
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
            .attr('style', 'left:' + (mouse[0] + 150) +
                    'px; top:' + (mouse[1] + 180) + 'px')
            .html("<p class=\"centerTip\">" + getCountryName(d.id) + "</p>");
    });  
    
    var listOfCountries = [];
    function getListOfCountries() {
        for (var i = 0; i < countriesArr.length; i++) {
            console.log("list start " + countriesArr[i]);
            listOfCountries.push(countriesArr[i].countryName);
        }
        return listOfCountries;
    }
    
    var inputA = document.getElementById("countryA");
    new Awesomplete(inputA, {
       list : getListOfCountries() 
    });
    var inputB = document.getElementById("countryB");
    new Awesomplete(inputB, {
       list : getListOfCountries()
    });
    
};

function getCountryPopulation(id) {
    for (var i = 0; i < countriesArr.length; i++) {
        if (countriesArr[i].countryCode === id) {
            return countriesArr[i].years[countriesArr[i].years.length-1].population;
        }
    }
}

function getCountryName(id) {
    for (var i = 0; i < countriesArr.length; i++) {
        if (countriesArr[i].countryCode === id) {
            if (countriesArr[i].countryName !== undefined) {
                return countriesArr[i].countryName;  
            }
            else {
                return id;
            }
        }
    }
}

var chosenCountries = [];   

var radius = Math.min(widthChart, heightChart) / 2;

var arc = d3.svg.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var pie = d3.layout.pie()
        .sort(function(d) { return d.value; })                          
        .value(function(d) { return d.value; });

var colorPie = d3.scale.ordinal()
    .range(["#98abc5", "#a05d56"]);

function chooseCountries() {
    console.log("xds");
    if (chosenCountries.length === 2) {
        chosenCountries.length = 0;
    }
    var countryA = document.getElementById("countryA").value;
    var countryB = document.getElementById("countryB").value;
    if (countryA.length !== 0 || countryB.length !== 0) {
        chosenCountries.push(countryA, countryB);
    }
    
    drawDonutChart();
    
    return createData(chosenCountries, populationsArr);
};

var populationsArr = []; 

function createPopulationArray(chosenCountries) {
    if (chosenCountries.length !== 0) {
        for (var i = 0; i < countriesArr.length; i++) {
            var name = countriesArr[i].countryName;
            if (chosenCountries[0] ===  name || chosenCountries[1] === name) {
                if (populationsArr.length === 2) {
                    populationsArr.length = 0;
                }
                populationsArr.unshift(getCountryPopulation(countriesArr[i].countryCode));
            }
        }
    }
    return populationsArr;
}

var dataToCompare = [];

function createData(chosenCountries, populationArr) {
    populationAr = createPopulationArray(chosenCountries);
    for (var i = 0; i < chosenCountries.length; i++) {
        dataToCompare[i] = {name: chosenCountries[i], value: populationArr[i]};
    }
    console.log(dataToCompare);
    return dataToCompare;
}

function drawDonutChart() {
    var data = createData(chosenCountries, populationsArr);
    
    svgCompare.selectAll("*").remove();
    
    svgCompare.datum(data).selectAll("path")
        .data(pie)
        .enter()
        .append("path")
        .attr("fill", function(d, i) { return colorPie(i); })
        .attr("d", arc);
    
    svgCompare.append("text")
      .attr("text-anchor", "middle") 
      .text(function(d) { return data.name; }); 
}
