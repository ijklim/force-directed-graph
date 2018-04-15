const WRAPPER = {
  margin: 20,
  headerHeight: 100,
  background: 'rgba(255, 255, 255, .95)',
}

Vue.component('d3-wrapper', {
  template: `
    <div
      class="elevation-5"
      :style="wrapperStyles"
    >
      <div :style="wrapperHeader">
        {{ appName }}<br>
      </div>

      <d3-force-directed-graph
        :d3-data="d3Data"
        :graph-width="graphWidth"
        :graph-height="graphHeight"
      />
    </div>
  `,
  data () {
    return {
      wrapperHeight: 0,
      wrapperWidth: 0,
    }
  },
  props: {
    appName: {
      type: String,
      default: ''
    },
    d3Data: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    graphHeight () {
      return this.wrapperHeight - WRAPPER.headerHeight;
    },
    graphWidth () {
      return this.wrapperWidth;
    },
    wrapperStyles () {
      return `` +
        `height:${this.wrapperHeight}px;` +
        `width:${this.wrapperWidth}px;` +
        `margin:auto;` +
        `background:${WRAPPER.background};` +
        ``;
    },
    wrapperHeader () {
      return `` +
        `height:${WRAPPER.headerHeight}px;` +
        `width:100%;` +
        `text-align:center;` +
        `font-size:2.2rem;` +
        `padding-top:25px;` +
        ``;
    },
  },
  methods: {
    adjustWrapperSize () {
      this.wrapperHeight = window.innerHeight - (WRAPPER.margin * 2);
      this.wrapperWidth = window.innerWidth - (WRAPPER.margin * 2);
    },
  },
  mounted () {
    this.adjustWrapperSize();
    window.addEventListener('resize', this.adjustWrapperSize);
  },
});