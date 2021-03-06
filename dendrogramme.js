var colorin = colorout = "#f00", colornone = "#ccc";
var width = 954, radius = width / 1.2;
var data = hierarchy(donnees);

// Fonctions
const line = d3.lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x)

const tree = d3.cluster()
    .size([2 * Math.PI, radius])

// Main
function main () {
  const root = tree(bilink(d3.hierarchy(data)
    .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

  const svg = d3.create("svg")
  .attr("viewBox", [-width, -width, width * 2, width * 2]);

  const node = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
      .selectAll("g")
      .data(root.leaves())
      .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 94}) translate(${d.y},0)`) // MAGIG NUMBER 97. Original : 90. Pour rotation
      .append("image")
        .attr("width", "90")
        .attr("height", "90")
        .attr("x", 6) // ?
        .attr("href", d => `images/${d.data.id_image}.png`)
        .each(function(d) { d.text = this;  })
        .on("mouseover", overed)
        .on("mouseout", outed)
        .call((text) => {text.append("title").text(d => `${id(d)}
                              ${d.outgoing.length} outgoing
                              ${d.incoming.length} incoming`)});

  const link = svg.append("g")
    .attr("stroke", colornone)
    .attr("stroke-width", 25)
    .attr("fill", "none")
    .selectAll("path")
    .data(root.leaves().flatMap(leaf => leaf.outgoing))
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", ([i, o]) => line(i.path(o)))
    .each(function(d) { d.path = this;  });

  function overed(event, d) {
    link.style("mix-blend-mode", null);
    d3.select(this).attr("font-weight", "bold");
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).raise();
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", colorout).raise();
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorout).attr("font-weight", "bold");
    afficher_grande(d);
  }

  function outed(event, d) {
    link.style("mix-blend-mode", "multiply");
    d3.select(this).attr("font-weight", null);
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null);
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", null).attr("font-weight", null);
    d3.selectAll(d.outgoing.map(d => d.path)).attr("stroke", null);
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", null).attr("font-weight", null);
    cacher_grande(d);
  }
  return svg.node();
}

function hierarchy(data, delimiter = ".") {
  let root;
  const map = new Map;
  data.forEach(function find(data) {
    const {name} = data;
    if (map.has(name)) return map.get(name);
    const i = name.lastIndexOf(delimiter);
    map.set(name, data);
    if (i >= 0) {
      find({name: name.substring(0, i), children: []}).children.push(data);
      data.name = name.substring(i + 1);

    } else {
      root = data;

    }
    return data;

  });
  return root;

}

function bilink(root) {
  const map = new Map(root.leaves().map(d => [id(d), d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.imports.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;

}

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

function creer_images_rondes (donnees) {

  let container = document.getElementById("grandes-images");
  donnees.forEach((image, index) => {
    let img = document.createElement("img");
    img.id = "image_" + image.id_image;
    img.src = "images/" + image.id_image + "-400x400.png";
    img.className = "grande";
    container.appendChild(img);
  });
}

function afficher_grande (image) {
  let el = document.getElementById("image_" + image.data.id_image);

  window.setTimeout(() => {
    el.style.display = "initial";
    window.setTimeout(() => {
      el.style.opacity = 1;
    }, 0);
  }, 250);
}

function cacher_grande (image) {
  let el = document.getElementById("image_" + image.data.id_image);

  el.style.opacity = 0;
  window.setTimeout(() => {
    el.style.display = "none";
  }, 250);
}

window.onload = function () {
  document.getElementById("main").appendChild(main());
  creer_images_rondes(donnees);
  document.getElementById("container-info").innerHTML = textes.fr;
}
