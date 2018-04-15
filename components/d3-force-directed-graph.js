Vue.component('d3-force-directed-graph', {
  template: `
    <div>
    <canvas :id="id" :height="graphHeight" :width="graphWidth"></canvas>
    </div>
  `,
  // svg cannot be property by itself, changes object type during assignment, within ddd object is fine
  data () {
    return {
      canvas: false,
      context: false,
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
      this.drawData();
    },
    graphHeight () {
      if (this.d3Data.length > 0) this.drawData();
    },
    graphWidth () {
      if (this.d3Data.length > 0) this.drawData();
    },
  },
  methods: {
    enableDrag (simulation) {
      let dragsubject = () => simulation.find(d3.event.x, d3.event.y);
      let dragstarted = () => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d3.event.subject.fx = d3.event.subject.x;
        d3.event.subject.fy = d3.event.subject.y;
        console.log('remove', d3.event.subject);
      }
      let dragged = () => {
        d3.event.subject.fx = d3.event.x;
        d3.event.subject.fy = d3.event.y;
      }
      let dragended = () => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d3.event.subject.fx = null;
        d3.event.subject.fy = null;
      }

      this.canvas
        .call(d3.drag()
          .container(this.canvas.node())
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));
    },
    drawLink (link) {
      this.context.moveTo(link.source.x, link.source.y);
      // Draw path
      this.context.lineTo(link.target.x, link.target.y);
    },
    drawNode (node) {
      this.context.beginPath();
      // Change color of node
      this.context.fillStyle = 'red';
      this.context.moveTo(node.x, node.y);
      // Draw circle
      this.context.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
      this.context.fill();
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
    /**
     * Draw d3Data
     */
    drawData () {
      let simulation = d3
        .forceSimulation()
        .force('x', d3.forceX(this.graphWidth / 2))
        .force('y', d3.forceY(this.graphHeight / 2))
        // collide will prevent nodes from overlapping
        .force('collide', d3.forceCollide(this.nodeRadius + 5))
        // charge will instruct nodes to repulse each other
        .force('charge', d3
          .forceManyBody()
          .strength(-100)
        )
        // Mapping array links and nodes
        .force('link', d3
          .forceLink()
          // Indicate which field in nodes is source mapping to
          // .id(d => d.country)
        )
        .on('tick', this.update);
        
      // Once simulation is executed, x, y, vy, vx will be added to nodes
      simulation
        .nodes(this.d3Data.nodes)
        // Passing data to the links network
        .force('link')
        .links(this.d3Data.links);
      
      this.enableDrag(simulation);
    },
  },
  mounted () {
    // Step #1: Select div to place d3 chart, set dimensions and color
    // Note: Code below must be in mounted(), created() does not work
    this.canvas = d3.select(`#${this.id}`);
    this.context = this.canvas.node().getContext('2d');
  },
});
