Vue.component('d3-force-directed-graph', {
  template: `
    <canvas :id="id" :height="graphHeight" :width="graphWidth"></canvas>
  `,
  // svg cannot be property by itself, changes object type during assignment, within ddd object is fine
  data () {
    return {
      canvas: false,
      context: false,
      simulation: false,
      nodeRadius: 5,
      id: 'd3-' + Math.round(Math.random() * 1000000)
    }
  },
  props: {
    d3Data: {
      type: Array,
      default: () => [],
    },
    graphHeight: {
      type: Number,
      default: 0,
    },
    graphWidth: {
      type: Number,
      default: 0,
    },
  },
  computed: {
  },
  watch: {
    /**
     * Data is now available to build structure of graph
     */
    d3Data () {
      this.simulation = d3
        .forceSimulation()
        .force('x', d3.forceX(this.graphWidth / 2))
        .force('y', d3.forceY(this.graphHeight / 2))
        // collide will prevent nodes from overlapping
        .force('collide', d3.forceCollide(this.nodeRadius + 5))
        // charge will instruct nodes to repulse each other
        .force('charge', d3
          .forceManyBody()
          .strength(-70)
        )
        // Mapping array links and nodes
        .force('link', d3
          .forceLink()
          // Indicate which field in nodes is source mapping to
          // .id(d => d.country)
        )
        // Setting decay to 0 simulation will never stop
        // .alphaDecay(0)
        .on('tick', this.update);
      
      // Ref: https://github.com/d3/d3-force
      // Once simulation is executed, x, y, vy, vx will be added to nodes
      this.simulation
        .nodes(this.d3Data.nodes)
        // Passing data to the links network
        .force('link')
        .links(this.d3Data.links);
      
      this.enableDrag();
    },
    graphHeight () {
      this.restartSimulation();
    },
    graphWidth () {
      this.restartSimulation();
    },
  },
  methods: {
    enableDrag () {
      let dragsubject = () => this.simulation.find(d3.event.x, d3.event.y);
      let dragstarted = () => {
        if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
      }
      let dragged = () => {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
      }
      let dragended = () => {
        if (!d3.event.active) this.simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      this.canvas.call(
        d3.drag()
          .container(this.canvas.node())
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
    },
    drawLink (link) {
      this.context.moveTo(link.source.x, link.source.y);
      // Draw path
      this.context.lineTo(link.target.x, link.target.y);
    },
    drawNode (node) {
      this.context.beginPath();
      // Dimension flag in sprite `flags.png`
      let sprite = {
        height: 11,
        width: 16,
      };

      // Extract values from style rule, remove negative sign, e.g. 66 from -66px
      let getSpritePosition = (styleValue) => {
        // May start with -
        // Take all digits before "px"
        return styleValue.match(/[-]?([\d]+)/)[1];
      };

      let img = new Image(sprite.width, sprite.height);   
      img.src = "./assets/img/flags.png";
      img.className = `flag flag-${node.code}`;
      let computedStyle = window.getComputedStyle(img);

      this.context.drawImage(
        img,
        getSpritePosition(computedStyle.backgroundPositionX),
        getSpritePosition(computedStyle.backgroundPositionY),
        sprite.width,
        sprite.height,
        node.x - 8,
        node.y - 5,
        sprite.width,
        sprite.height
      );
    },
    restartSimulation () {
      if (!this.simulation) return;

      this.simulation
        .force('center', d3.forceCenter(this.graphWidth / 2, this.graphHeight / 2))
        .alpha(1)
        .restart();
    },
    update () {
      this.context.clearRect(0, 0, this.graphWidth, this.graphHeight);
    
      this.context.globalAlpha = 1;
      this.d3Data.nodes.forEach(this.drawNode);
    
      this.context.beginPath();
      this.context.globalAlpha = 0.3;
      this.context.strokeStyle = '#aaa';
      this.d3Data.links.forEach(this.drawLink);
      this.context.stroke();
    },
  },
  mounted () {
    // Step #1: Select div to place d3 chart, set dimensions and color
    // Note: Code below must be in mounted(), created() does not work
    this.canvas = d3.select(`#${this.id}`);
    this.context = this.canvas.node().getContext('2d');
  },
});
