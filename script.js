$( document ).ready(function() {

      var nodeDataArray = [];
      var linkDataArray = [];

      $.getJSON("CLM-ontology.json", function(obj) {


        //identify not related nodes
        list = obj.relationships.map(function(a) {return a.target_id;}).filter((x, i, a) => a.indexOf(x) == i);
        list.push.apply(list, obj.relationships.map(function(a) {return a.source_id;}).filter((x, i, a) => a.indexOf(x) == i));
        newList = obj.entities.map(function(a) {return a.id;})
        newList = newList.filter((n) => !list.includes(n))

        for(i=0;i<obj.entities.length;i++){
              var nodeObj = {};
              nodeObj["entityName"] = obj.entities[i].name;
              nodeObj["id"] = obj.entities[i].id;
              nodeObj["category"] = obj.entities[i].category;
              nodeDataArray.push(nodeObj);
         }

         for(i=0;i<obj.relationships.length;i++){
              var relationshipsObj = {};
              relationshipsObj["source"] = nodeDataArray[obj.relationships[i].source_id - 1].entityName;
              relationshipsObj["target"] = nodeDataArray[obj.relationships[i].target_id - 1].entityName;
              relationshipsObj["text"] = obj.relationships[i].type;
              relationshipsObj["category"] = nodeDataArray[obj.relationships[i].target_id - 1].category;
              linkDataArray.push(relationshipsObj);
          }
          for(i=0;i<newList.length;i++){
            var relationshipsObj = {};
            relationshipsObj["source"] = relationshipsObj["target"] = obj.entities[newList[i]].name;
            relationshipsObj["text"] = "";
            relationshipsObj["category"] =  obj.entities[newList[i]].category;
            linkDataArray.push(relationshipsObj);
          }
          init(linkDataArray);
      });

});


function init(links){

  var nodes = {};
  //Some plot parameters
  var radius = 15;
  var color = d3.scale.ordinal()
      .domain(["developer","nondeveloper"])
      .range(["#4285f4", "#fbbc05"]);




  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    link.source = nodes[link.source] || (nodes[link.source] = {name: link.source,category:link.category});
    link.target = nodes[link.target] || (nodes[link.target] = {name: link.target,category:link.category});
  });

  var width = $(document).width() - 20,
      height = $(document).height() - 20;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(200)
      .charge(-1000)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  var legendRectSize = 20;

  var legend = d3.select('svg')
    .selectAll("g")
    .data(color.domain())
    .enter()
    .append('g')
    .attr('class', 'legend')
    .attr("width", 200)
    .attr("height", 200)
    .style("float",'right')
    .attr('transform', function(d, i) {
      var height = legendRectSize;
      var x = width - 130;
      var y = ++i * 25;
      return 'translate(' + x + ',' + y + ')';
  });

  legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .data(color.range())
      .style('fill', function(d,i){ return d});

  legend.append('text')
      .attr('x', legendRectSize + 5 )
      .attr('y', legendRectSize - 5 )
      .text(function(d) { return d; })
      .style("font", "16px times")
      .style("fill", '#000')
      .style('stroke-width', '1');

  // Per-type markers, as they don't inherit styles.
  svg.append("defs").selectAll("marker")
      .data(["part-of", "is-a", "has-a"])
      .enter().append("svg:marker")
      .attr("id", function(d) { return d; })
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5");

  var path = svg.append("g").selectAll("path")
      .data(force.links())
      .enter().append("path")
      .attr("class", function(d) { return "link " + d.text; })
      .attr("id", function(d,i) { return "linkno_"+i;})
      .attr("marker-mid", function(d) { return "url(#" + d.text + ")"; });

  var pathText = svg.append("g").selectAll("path")
      .data(force.links())
      .enter().append("text")
      .attr("class", "link")
      .attr("x", 70)
      .attr("dy", -7)
      .append("textPath")
      .attr("xlink:href",function(d,i){return "#linkno_"+i;})
      .style("font", "18px times")
      .style("fill", "#5a9fc7")
      .text(function(d){return d.text;});


  var circle = svg.append("g").selectAll("circle")
      .data(force.nodes())
      .enter().append("circle")
      .attr("r", radius)
      .call(force.drag)
      .attr("class", function(d) {return "circle_"+ d.category; })
      .attr("id", function(d) { return "circle_"+ d.name; })
      .on("click", click);

  var text = svg.append("g").selectAll("text")
      .data(force.nodes())
      .enter().append("text")
      .attr("x", radius)
      .attr("y", "-0.5em")
      .style("font", "18px times")
      .text(function(d) { return d.name; });


  // Use elliptical arc path segments to doubly-encode directionality.
  function tick() {
    path.attr("d", linkArc);
    //pathText.attr("transform", linkArc);
    circle.attr("transform", transform);
    text.attr("transform", transform);
  }

  function linkArc(d) {
    var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
  }

  function transform(d) {
    return "translate(" + d.x + "," + d.y + ")";
  }

  function click(d) {



  }


}
