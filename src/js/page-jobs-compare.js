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
    var jobList = {};
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
    d3.json("data/json_files/11-1011.json", function (error, graph) {
        drawnetwork(graph, '#graph1', '#jobname1', '#description1', svg1);
    });

    d3.json("data/json_files/11-1021.json", function (error, graph) {
        drawnetwork(graph, '#graph2', '#jobname2', '#description2', svg2);
    });


    // Mobile collapser job filters
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

        d3.json("data/json_files/" + $('#jobs1').val() + ".json", function (error, graph) {
            update(graph, "jobname1", "description1", svg1);
        });

        d3.json("data/json_files/" + $('#jobs2').val() + ".json", function (error, graph) {
            update(graph, "jobname2", "description2", svg2);
        });
    });

    // Generate dropdowns
    generatedropdown('#search1', '#graph1', '#jobname1', '#description1', '#jobs1', '#categories1', svg1);
    generatedropdown('#search2', '#graph2', '#jobname2', '#description2', '#jobs2', '#categories2', svg2);

    // Search box "for"
    for (j = 0; j < category_data.length; j++) {
        var item = category_data[j];
        for (k = 0; k < item.jobs.length; k++) {
            jobList[item.jobs[k].title] = item.jobs[k].OCC_Code;
        }
    }

    tags.autocomplete({
        source: Object.keys(jobList),
        select: autoCompleteSelect
    });

    // Random Jobs
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

        addJobDetails(graph, selector2);


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

        //console.log(d3.select(".categories-list"));

        if (selector === "#graph2") {
            createRoundLegend(svg);
        }

    };

    function generatedropdown(selector, selector2, selector3, selector4, selector5, selector6, svg) {

        $.fn.changeType = function () {
            var options_categories = '';
            $.each(category_data, function (i, d) {
                if (i == 0 && selector == "#search1") {
                    options_categories += '<option selected=true value="' + d.code + '">' + d.category + '<\/option>';
                    var d = category_data[0];
                    var options = '';
                    $.each(d.jobs, function (i, j) {
                        options += '<option value="' + j.OCC_Code + '">' + j.title + '<\/option>';
                    });
                    $(selector5).html(options);

                } else {
                    if (i == 0 && selector == "#search2") {
                        options_categories += '<option value="' + d.code + '">' + d.category + '<\/option>';
                        var d = category_data[0];
                        var options = '';
                        $.each(d.jobs, function (i, j) {
                            if (i == 1) {
                                options += '<option selected=true value="' + j.OCC_Code + '">' + j.title + '<\/option>';
                            } else {
                                options += '<option value="' + j.OCC_Code + '">' + j.title + '<\/option>';
                            }
                        });
                        $(selector5).html(options);

                    } else {
                        options_categories += '<option value="' + d.code + '">' + d.category + '<\/option>';
                    }
                }
            });
            $(selector6, this).html(options_categories);

            $(selector6, this).change(function () {
                var index = $(this).get(0).selectedIndex;
                var d = category_data[index];
                var options = '<option>Select Title ...<\/option>';
                if (index >= 0) {
                    $.each(d.jobs, function (i, j) {
                        options += '<option value="' + j.OCC_Code + '">' + j.title + '<\/option>';
                    });
                } else {
                    options += '';
                }
                $(selector5).html(options);

                seachText = $('[data-tags="1"]');
                if (selector6 == "#categories2") {
                    seachText = $('[data-tags="2"]');
                }
                seachText.val("");

            })
        };

        $(selector).changeType();

        $(selector5).change(function (d) {
            d3.json("data/json_files/" + this.value + ".json", function (error, graph) {
                update(graph, selector3, selector4, svg);

            });
        })


    };

    // Update method
    function update(graph, selector, selector2, svg) {

        $(selector).text(graph.title);
        $(selector2).text(graph.description)
            .attr("text-align", "justify");

        addJobDetails(graph, selector);


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
            .attr("r", function (d) {
                d.rca = tempObject[d.name].toString();
                return Math.min(30, tempObject[d.name] * 5 + 1);

            });


        //change if auto toggle selected
        if (!on) {
            nodeupdate
                .style("fill", function (d) {
                    if (d.p_auto == -1) {
                        return "#aaaaaa"
                    } else {
                        return color(d.p_auto);
                    }
                });

        } else {
            nodeupdate
                .style("fill", function (d) {
                    return d.scolor;
                });
        }
        var svgleg = d3.selectAll(".legendsvg");
        drawLegend(svgleg);

    }

    function autoCompleteSelect (event, ui) {
        var index = $(event.target).data("tags");

        selectedJob = ui.item.label;

        if ($.inArray(selectedJob, Object.keys(jobList)) > -1) {
            d3.json("data/json_files/" + jobList[selectedJob] + ".json", function (error, graph) {
                update(graph, '#jobname' + index, '#description' + index, eval("svg" + index));

                for (c = 0; c < category_data.length; c++) {
                    cat_jobs = category_data[c].jobs
                    for (j = 0; j < cat_jobs.length; j++) {
                        if (cat_jobs[j].title == selectedJob) {
                            combocat = $('#categories' + index);
                            combocat.val(category_data[c].code)
                            var options = '';
                            for (x = 0; x < cat_jobs.length; x++) {
                                options += '<option value="' + cat_jobs[x].OCC_Code + '">' + cat_jobs[x].title + '<\/option>';
                            }
                            combo = $('#jobs' + index);
                            combo.html(options);
                            combo.val(jobList[selectedJob]);
                            break;
                        }
                    }
                }
            });
        }
    }

    function randomTrigger () {

        var index = $(this).data("random");

        var randomCategorieIndex = Math.floor(Math.random() * category_data.length);
        var randomCategorie = category_data[randomCategorieIndex];
        var randomjobIndex = Math.floor(Math.random() * randomCategorie.jobs.length);
        var randomjob = randomCategorie.jobs[randomjobIndex];

        // update catefories dropdown

        $('#categories' + index).val(randomCategorie.code);

        // update jobs drop down
        var options = '';
        $.each(randomCategorie.jobs, function (i, j) {
            options += '<option value="' + j.OCC_Code + '">' + j.title + '<\/option>';
        });

        $('#jobs' + index).html(options);
        $('#jobs' + index).val(randomjob.OCC_Code);


        d3.json("data/json_files/" + randomjob.OCC_Code + ".json", function (error, graph) {
            update(graph, '#jobname' + index, '#description' + index, eval("svg" + index));
        });

        seachText = $('#tags' + index);
        seachText.val("");
    }

    function addJobDetails(graph, selector) {
        textDetails = "";
        if (typeof graph.employees != 'undefined') {
            textDetails = textDetails + "TOTAL EMPLOYEES:" + graph.employees + "<br>";
        }
        if (typeof graph.wage != 'undefined') {
            textDetails = textDetails + "WAGE:" + graph.wage + "<br>";
        }
        if (typeof graph.automation != 'undefined') {
            textDetails = textDetails + "RISK OF AUTOMATION:" + graph.automation + "<br>";
        }
        if (typeof graph.cognitive != 'undefined') {
            textDetails = textDetails + "COGNITIVE FRACTION:" + graph.cognitive + "<br>";
        }
        if (selector == "#jobname1") {
            detailsSelector = "#jobdetails1";
        } else {
            detailsSelector = "#jobdetails2";
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