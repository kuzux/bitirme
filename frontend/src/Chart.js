import * as d3 from "d3";

const defaults = {
  // target element or selector to contain the svg
  target: '#chart',

  // width of chart
  width: 400,

  // height of chart
  height: 400,

  // margin
  margin: { top: 15, right: 0, bottom: 35, left: 60 },

  // enable axis, when disabled margin is removed
  axis: true,

  // axis padding
  axisPadding: 5,

  // number of x-axis ticks
  xTicks: 5,

  // number of y-axis ticks
  yTicks: 3,

  // size of axis ticks
  tickSize: 5,

  // tick formatter
  tickFormat: null,

  // line interpolation
  interpolate: 'basis',

  // color range from 'cold' to 'hot'
  color: ['rgb(0, 180, 240)', 'rgb(243, 42, 100)'],

  // color interpolation function
  colorInterpolate: d3.interpolateHcl,

  // opacity range for the domain 0-N
  opacityRange: [0.10, 1],

  // gap size
  gap: 1,

  // bin type: 'circle', 'rect'
  type: 'rect',

  // axis type: linear, time
  axisType: 'linear',

  // mouseover callback for tooltips or value display
  mouseover: _ => {},

  // mouseout callback for tooltips or value display
  mouseout: _ => {}
}

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

export default class Heatmap {

	constructor(config) {
		this.set(config)
		if (!this.axis) this.margin = zeroMargin
		this.init()
	}	

	set(config) {
    	Object.assign(this, defaults, config)
  	}

  	dimensions() {
	    const { width, height, margin } = this
	    const w = width - margin.left - margin.right
	    const h = height - margin.top - margin.bottom
	    return [w, h]
  	}

	init(){
		//const{ target, width, height, margin, axisPadding, interpolate} = this
		//const{ axis, tickSize, xTicks, yTicks, axisType, tickFormat } = this
		//const{ color, colorInterpolate, opacityRange } = this

		const [w, h] = this.dimensions()

		const{ target, width, height, margin, axisPadding} = this
		const{ tickSize, xTicks, yTicks, tickFormat } = this
		const { color, colorInterpolate, opacityRange } = this

		this.chart = d3.select(target)
			.attr('width',width)
			.attr('height', height)
		.append('g')
			.attr('transform', `translate(${margin.left}, ${margin.top})`)
	
		this.x = d3.scaleTime()
			.range([0, w])

		this.y = d3.scaleLinear()
			.range([h, 0])

		this.opacity = d3.scaleLinear()
		.range(opacityRange)

		this.color = d3.scaleLinear()
		.range(color)
      	.interpolate(colorInterpolate)

		this.xAxis = d3.axisBottom()
			.scale(this.x)
			.ticks(xTicks)
			.tickPadding(8)
			.tickSize(tickSize)

		this.yAxis = d3.axisLeft()
			.scale(this.y)
			.ticks(yTicks)
			.tickPadding(8)
			.tickSize(tickSize)
			.tickFormat(tickFormat)

		this.chart.append('g')
			.attr('class', 'x axis')
			.attr('transform',`translate(0, ${h+axisPadding})`)
			.call(this.xAxis)

		this.chart.append('g')
      		.attr('class', 'y axis')
      		.attr('transform', `translate(${-axisPadding}, 0)`)
      		.call(this.yAxis)
	}

	/**
   * Prepate domains for subsequent render methods.
   */

 	prepare(data, options) {
	    const { x, y } = this

	    const yMin = d3.min(data, d => d3.min(d.bins, d => d.bin))
	    const yMax = d3.max(data, d => d.bins[d.bins.length-1].bin)
	    const yStep = yMax / data[0].bins.length

	    x.domain(d3.extent(data, d => d.bin))
	    y.domain([yMin, yMax + yStep])

	    this.yStep = yStep
  	}

	renderAxis(data, options){
		const {chart, xAxis, yAxis} = this

		const c = options.animate ? chart.transition() : chart

		c.select('.y.axis').call(xAxis)
		c.select('.x.axis').call(yAxis)
	}

	renderBuckets(data){
		const { chart, x, y, color, opacity, gap, yStep, mouseover, mouseout } = this
		const [w, h] = this.dimensions()

		const bw = (w/data.length)
		const bh = (h/data[0].bins.length)
		const col = chart.selectAll('.column')
			.data(data)

		col.enter().append('g')
			.attr('class', 'column')

		col.attr('transform', (d, i) => `translate(${x(d.bin)}, 0)`)

		col.exit().remove()

		const bin = col.selectAll('.bin')
			.data(d => d.bins)

		//enter
		bin.enter().append('rect')
			.attr('class', 'bin')

		// update
		bin.style('fill', d=> color(d.count))
			.style('fill-opacity', d => opacity(d.count))
			.attr('width', bw - gap)
			.attr('height', bh - gap)
			.attr('x', 0)
			.attr('y', d => y(d.bin+ yStep))

		bin.on('mouseover', mouseover)
      		.on('mouseleave', mouseout)

    	// exit
    	bin.exit().remove()
	}

	render(data, options = {}) {
		this.prepare(data,options)
		this.renderAxis(data, options)
		this.renderBuckets(data,options)
	}

	// updates the chart with given data
	update(data){
		this.render(data, {
			animate: true
		})
	}

}

/*
const Chart = (props) => {
    return 
        <div> </div>;
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);
*/
