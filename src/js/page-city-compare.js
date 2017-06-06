(function($, w){
    var legendtip = null;
    var collapsers = $(".u-collapser");
    var startx = 0;
    var width = 800;
    var height = 400;
    var xscale = d3.scale.linear().domain([-10, 21]).range([startx, width]);
    var yscale = d3.scale.linear().domain([-1, 25]).range([0, height]);
    var random = $("[data-random]");
    var tags = $("[data-tags]");
    var cityList = {};
    var $body = $("body");
    var tip;
    var svg1;
    var svg2;
    var svglengend, legendtip;

    var colorDomain = [0.37, 0.52, 0.67]; //[min,max]
    var colorRange = ["#2c25fb", '#eeeeee', "#ff3333"]; //["0000ff", "#ffffff", "#ff0000"]

    var color = d3.scale.linear()
        .domain(colorDomain)
        .range(colorRange);

    var on = true;
    var $toggle = $(".toggle-button :checkbox");

    var iconobjs = [
        {key: 'Basic Skills', icon: 'basic24.png'},
        {key: 'Social Skills', icon: 'social24.png'},
        {key: 'Management Skills', icon: 'manage24.png'},
        {key: 'Cognitive Abilities', icon: 'cognitive24.png'},
        {key: 'Cognitive Abilititices', icon: 'cognitive24.png'},
        {key: 'Knowledge', icon: 'knowledge24.png'},
        {key: 'Mental Processes', icon: 'mental24.png'},
        {key: 'Interacting With Others', icon: 'interaction24.png'},
        {key: 'Technical Skills', icon: 'tech24.png'},
        {key: 'Psychomotor Abilities', icon: 'psychomotor24.png'},
        {key: 'Sensory Abilities', icon: 'senses24.png'},
        {key: 'Information Input', icon: 'infoin24.png'},
        {key: 'Work Output', icon: 'workout24.png'},
        {key: 'Physical Abilities', icon: 'physical24.png'},
        {key: 'Other', icon: 'other24.png'}
    ];


    // Init graphics
    d3.json("data/json_files/1.json", function(error, graph) {
        drawnetwork(graph, '#graph1', '#cityname1', '#description1', svg1);
    });

    d3.json("data/json_files/2.json", function(error, graph) {
        drawnetwork(graph, '#graph2', '#cityname2', '#description2', svg2);
    });


    // Mobile collapser city filters
    collapsers.on("click", function(e){
        if (w.innerWidth > 575){
            return;
        }

        var $collapser = $(this);

        $collapser.toggleClass("u-active");

        e.preventDefault();
        e.stopImmediatePropagation();
    });

    // Mobile hide tooltips touching elsewhere
    $body.on("touchstart", mobileHideTooltips);

    // Graphics tooltips
    tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            icon = "none";
            for (i = 0, x = iconobjs.length; i < x; i++) {
                if (iconobjs[i].key == d.group) {
                    icon = iconobjs[i].icon;
                }
            }
            risk = d.p_auto.toString();
            return "<h2 class='h6'><img src='img/icons/" + icon + "'><b>&nbsp;" + d.group + "</b'></h2>"
                + "<p><pre>" + d.name.toUpperCase() + "</pre></p>"
                + "<p><b>RCA : " + d.rca.substring(0, 6) + "</b>"
                + "<br><b>Risk of Automation : " + risk.substring(0, 6) + "</b>"
                + "</p>";
        });

    // Cache SVGs
    svg1 = svg("#graph1");
    svg2 = svg("#graph2");

    // Legend tooltips
    legendtip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<b>" + d.Group + "</b>";
        });

    svglengend = d3.select("#graph2").append("svg")
        .attr("width", width)
        .attr("height", 80)
        .attr('id', 'svglengend');

    //Risk of automation toggle
    $toggle.on('change', function () {
        on = !on;

        d3.json("data/json_files/" + $('#dropdownmenu1').val() + ".json", function (error, graph) {
            update(graph, "#cityname1", "#description1", svg1);
        });

        d3.json("data/json_files/" + $('#dropdownmenu2').val() + ".json", function (error, graph) {
            update(graph, "#cityname2", "#description2", svg2);
        });
    });

    // Generate dropdowns
    d3.csv("data/data_generating/cities.csv", function(error, data) {
        generatedropdown(data, '#dropdownmenu1', '#graph1', '#cityname1', '#description1', svg1);
        generatedropdown(data, '#dropdownmenu2', '#graph2', '#cityname2', '#description2', svg2);

        // Search box "for"
        for (j = 0; j < data.length; j++) {
            var item = data[j]
            cityList[item.AREA_NAME] = item.City_Code;
        }

        // Tags autocomplete on load
        tags.autocomplete({
            source: Object.keys(cityList ),
            select: autoCompleteSelect
        });
    });

    // Random Cities
    random.on("click", randomTrigger);

    /**
     * Hoisting functions and methods to leave code above much more descriptive
     */

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    }

    function drawnetwork(graph, selector, selector2, selector3, svg) {
        var force = d3.layout.force()
            .linkDistance(1)
            .linkStrength(1)
            .size([width, height]);

        var drag = force.drag()
            .on("dragstart", dragstart);

        svg.selectAll(".node").remove();

        $(selector2).text(graph.title);
        $(selector3).text(graph.description)
            .attr("text-align", "justify");

        addCityDetails(graph, selector2);


        var nodes = graph.nodes.slice(),
            links = [],
            bilinks = [];

        graph.links.forEach(function (link) {
            var s = nodes[link.source],
                t = nodes[link.target],
                i = {}; // intermediate node
            nodes.push(i);
            links.push({
                source: s,
                target: i
            }, {
                source: i,
                target: t
            });
            bilinks.push([s, i, t]);
        });

        force
            .nodes(nodes)
            .links(links)
            .start();

        var link = svg.selectAll(".link")
            .data(bilinks)
            .enter().append("line")
            .attr("class", "link")
            .attr('x1', function (d) {
                return xscale(+d[0].cx)
            })
            .attr('x2', function (d) {
                return xscale(+d[2].cx)
            })
            .attr('y1', function (d) {
                return yscale(+d[0].cy)
            })
            .attr('y2', function (d) {
                return yscale(+d[2].cy)
            });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", function (d) {
                return Math.min(30, +d.rca * 5 + 1);
            })
            .attr("cx", function (d) {
                return xscale(+d.cx)
            })
            .attr("cy", function (d) {
                return yscale(+d.cy)
            })
            //.attr("fixed", true)
            .style("fill", function (d) {
                return d.scolor
            })
            .on('mouseover', function(d,i){
                tip.show(d, i);
                tip.attr('class', 'd3-tip n active');
            })
            .on('mouseout', function(d,i){
                tip.hide(d, i);
                tip.attr('class', 'd3-tip n');
            })
            .call(drag);

        d3.selectAll(".categories-list")
            .append("svg")
            .attr({
                class: "legendsvg",
                viewBox: "0 0 660 50"
            });

        var svgleg = d3.selectAll(".legendsvg");

        svgleg.call(legendtip);

        drawLegend(svgleg);

        if (selector === "#graph2") {
            createRoundLegend(svg);
        }

    };

    function generatedropdown(data, selector, selector2, selector3, selector4, svg) {
        var options = "",
            select = $(selector);

        data.forEach(function(val){
            options += '<option value="' + val.City_Code+ '">'+ val.AREA_NAME +'</option>';
        });

        select
            .html(options)
            .on("change", function() {
                d3.json("data/json_files/" + this.value + ".json", function(error, graph) {
                    update(graph, selector3, selector4, svg);
                });

            })
            .trigger("change");
        if (selector == "#dropdownmenu2") {
            select.val( select.find("option").eq(1).val() );
        }
    };

    // Update method
    function update(graph, selector, selector2, svg) {
        $(selector).text(graph.city_name);

        addCityDetails(graph, selector);

        // read new data
        var nodearray = graph.nodes;
        var tempObject = {};
        for (var i = 0; i < nodearray.length; ++i) {
            tempObject[nodearray[i]['name']] = +nodearray[i]['rca'];
        }

        // update node size
        var nodeupdate = svg.selectAll(".node");
        nodeupdate
            .transition()
            .duration(750)
            .attr("r", function(d) {
                d.rca=tempObject[d.name].toString();
                return Math.min(15, Math.max(3, (tempObject[d.name] - 0.956) / (1.08 - 0.956) * 10));

            });

        //change if auto toggle selected
        if (!on) {
            nodeupdate
                .style("fill", function(d) {
                    if (d.p_auto == -1) {
                        return "#aaaaaa"
                    } else {
                        return color(d.p_auto);
                    }
                });
        } else {
            nodeupdate
                .style("fill", function(d) {
                    return d.scolor;
                });
        }
        var svgleg=d3.selectAll(".legendsvg");
        drawLegend(svgleg);
    }

    function autoCompleteSelect (event, ui) {
        var index = $(event.target).data("tags");
        selectedCity = ui.item.label;

        if ($.inArray(selectedCity, Object.keys(cityList)) > -1) {
            d3.json("data/json_files/" + cityList[selectedCity] + ".json", function (error, graph) {
                update(graph, "#cityname" + index, "#description" + index, eval("svg" + index));
            });

            combo = $('#dropdownmenu' + index);
            combo.val(cityList[selectedCity]);
        }
    }

    function randomTrigger () {

        var index = $(this).data("random");

        var randomCategorieIndex = Math.floor(Math.random() * category_data.length);
        var randomCategorie = category_data[randomCategorieIndex];

        // update catefories dropdown
        $('#dropdownmenu' + index).val(randomCategorie.code);

        d3.json("data/json_files/" + randomCategorie.code + ".json", function (error, graph) {
            update(graph, '#cityname' + index, '#description' + index, eval("svg" + index));
        });

        seachText = $('#tags' + index);
        seachText.val("");
    }

    function addCityDetails(graph, selector) {
        textDetails = " ";
        if (typeof graph.income != 'undefined') {
            textDetails = textDetails + "MEDIAN HOUSEHOLD INCOME:" + graph.income + "<br>";
        }
        if (typeof graph.population != 'undefined') {
            textDetails = textDetails + "POPULATION:" + graph.population + "<br>";
        }
        if (typeof graph.GDP != 'undefined') {
            textDetails = textDetails + "GDP:" + graph.GDP + "<br>";
        }
        if (typeof graph.employees != 'undefined') {
            textDetails = textDetails + "TOTAL EMPLOYEES:" + graph.employees + "<br>";
        }
        if (typeof graph.cognitive != 'undefined') {
            textDetails = textDetails + "COGNITIVE FRACTION:" + graph.cognitive + "<br>";
        }
        if (selector == "#cityname1") {
            detailsSelector = "#description1";
        } else {
            detailsSelector = "#description2";
        }

        $(detailsSelector)
            .html(textDetails);
    }

    function createRoundLegend(svg) {
        svgheight = parseInt(svg.style("height"));
        var g = svg.append("g");

        //svg.selectAll("#lengendcircle").remove();

        var lengendcircle = g.append("g")
            .attr("id", "lengendcircle")
            .attr("transform", "translate(10," + (svgheight - 80) + ") ");

        var sizetext = '14px';

        var sizes = [6, 12, 18];

        for (var i in sizes) {
            lengendcircle.append("circle")
                .attr("r", sizes[i])
                .attr("cx", 75)
                .attr("cy", 2 * sizes[sizes.length - 1] - sizes[i] + 10)
                .attr('stroke', 'black')
                .attr("fill", 'none')
                .attr("class", "legendcircle");
        };

        lengendcircle.append("text")
            .style("font-size", sizetext)
            .style("color", "black")
            .attr("x", 65)
            .attr("y", 6)
            .text("high")
            .attr("class", "legendcircle");

        lengendcircle.append("text")
            .style("font-size", sizetext)
            .style("color", "black")
            .attr("x", 97)
            .attr("y", 30)
            .text("RCA")
            .attr("class", "legendcircle");

        lengendcircle.append("text")
            .style("font-size", sizetext)
            .style("color", "black")
            .attr("x", 65)
            .attr("y", 60)
            .text("low")
            .attr("class", "legendcircle");


    }

    function drawLegend(svg) {

        svg.selectAll("*").remove();

        var legenddata = [
            {
                "Group": "Social",
                "icon": "social32.png",
                "color": "#1477A4"
            },
            {
                "Group": "Interaction",
                "icon": "interaction32.png",
                "color": "#11D6D3"
            },
            {
                "Group": "Mental",
                "icon": "mental32.png",
                "color": "#38a538"
            },
            {
                "Group": "Managerial",
                "icon": "manage32.png",
                "color": "#BDEC43"
            },
            {
                "Group": "Basic",
                "icon": "basic32.png",
                "color": "#0DDE91"
            },
            {
                "Group": "Cognitive",
                "icon": "cognitive32.png",
                "color": "#993C99"
            },
            {
                "Group": "Knowledge",
                "icon": "knowledge32.png",
                "color": "#FCF91C"
            },
            {
                "Group": "Technical",
                "icon": "tech32.png",
                "color": "#A15000"
            },
            {
                "Group": "Psychomotor",
                "icon": "psychomotor32.png",
                "color": "#FF4C42"
            },
            {
                "Group": "Sensory",
                "icon": "senses32.png",
                "color": "#ff00ff"
            },
            {
                "Group": "Info In",
                "icon": "infoin32.png",
                "color": "#FFC2FC"
            },
            {
                "Group": "Work Out",
                "icon": "workout32.png",
                "color": "#DD7600"
            },
            {
                "Group": "Physical",
                "icon": "physical32.png",
                "color": "#FDC337"
            }
        ];

        var legenddata2 = [{
            "Group": "Low Risk",
            "color": 0.37
        }, {
            "Group": "",
            "color": 0.42
        }, {
            "Group": "",
            "color": 0.47
        }, {
            "Group": "Neutral",
            "color": 0.52
        }, {
            "Group": "",
            "color": 0.57
        }, {
            "Group": "",
            "color": 0.62
        }, {
            "Group": "High Risk",
            "color": 0.67
        }];


        if (on) {
            var legend = svg.selectAll(".legend")
                .data(legenddata)
                .enter()
                .append("image")
                .attr("xlink:href", function (d, i) {
                    return "img/icons/" + d.icon;
                })
                .on('mouseover', function(d,i){
                    legendtip.show(d, i);
                    legendtip.attr('class', 'd3-tip n active');
                })
                .on('mouseout', function(d,i){
                    legendtip.hide(d, i);
                    legendtip.attr('class', 'd3-tip n');
                });


            var titlelegend1 = svg.selectAll(".legendtitle1")
                .data(["Job Component"])
                .enter().append("text")
                .attr("class", "legendtitle")
                .style("font-weight", "bold")
                .text("Socio-Cognitive Categories");

            var titlelegend2 = svg.selectAll(".legendtitle2")
                .data(["Job Component"])
                .enter().append("text")
                .attr("class", "legendtitle")
                .style("font-weight", "bold")
                .text("Sensory-Physical Categories");


            titlelegend1
                .attr("x", 33)
                .attr("y", 15);

            titlelegend2
                .attr("x", 460)
                .attr("y", 15);

            legend
                .attr("width", 32)
                .attr("height", 32)
                .attr("x", function (d, i) {
                    if (i < 7) {
                        return i * 35;
                    } else {
                        return i * 35 + 206;
                    }
                })
                .attr("y", 20);


        } else {
            var legend = svg.selectAll(".legend")
                .data(legenddata2)
                .enter().append("rect")
                .attr("class", "legend")
                .attr("fill", function (d) {
                    return color(d.color)
                })

            var textLegend = svg.selectAll(".legendtext")
                .data(legenddata2)
                .enter().append("text")
                .attr("class", "legendtitle")
                .style("font-weight", "bold")
                .text(function (d) {
                    return d.Group
                });

            legend_size = 94;
            legend_offset = 16;

            legend
                .attr("x", function (d, i) {
                    return legend_size * i;
                })
                .attr("y", function (d, i) {
                    return 25;
                })
                .attr("width", legend_size)
                .attr("height", 15)

            textLegend
                .attr("x", function (d, i) {
                    return i * legend_size + legend_offset;
                })
                .attr("y", 18);
        }
    }

    function svg (selector){
        var graph = d3.select(selector)
            .append("svg")
            .attr({
                class: "graph_jobs",
                height: height,
                viewBox: "0 0 " + width + " " + height
            });

        graph.call(tip);

        return graph;
    }

    function mobileHideTooltips (){
        $(".d3-tip.active").removeClass("active");
    }


})(jQuery, window);