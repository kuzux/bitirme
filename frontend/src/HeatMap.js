
import * as d3 from "d3";

/**
 * Default config.
 */

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
  color: ['rgb(0, 180, 240)', 'rgb(243, 42, 55)'],

  // color interpolation function
  colorInterpolate: d3.interpolateHcl,

  // opacity range for the domain 0-N
  opacityRange: [0.10, 1],

  // gap size
  gap: 1,

  // mouseover callback for tooltips or value display
  mouseover: _ => {},

  // mouseout callback for tooltips or value display
  mouseout: _ => {}
}

/**
 * Zero margin.
 */

const zeroMargin = { top: 0, right: 0, bottom: 0, left: 0 }

/**
 Tick formats
 

const monthDayFormat = d3.time.format('%m.%d')
const hourFormat = d3.time.format('%H')
const dayFormat = d3.time.format('%j')
const timeFormat = d3.time.format('%Y-%m-%dT%X')

*/

/**
 * Heatmap.
 */

export default class Heatmap {

	/**
	* Construct with the given `config`.
	*/

	constructor(config) {
		this.set(config)
		if (!this.axis) this.margin = zeroMargin
		this.init()
	}

	/**
	* Set configuration options.
	*/

	set(config) {
		Object.assign(this, defaults, config)
	}

	/**
	* Dimensions without margin.
	*/

	dimensions() {
		const { width, height, margin } = this
		const w = width - margin.left - margin.right
		const h = height - margin.top - margin.bottom
		return [w, h]
	}

	/**
	* Initialize the chart.
	*/

	init() {
		const { target, width, height, margin, axisPadding, interpolate } = this
		const { tickSize, xTicks, yTicks, axisType, tickFormat } = this
		const { color, colorInterpolate, opacityRange } = this

		const [w, h] = this.dimensions()

		this.chart = d3.select(target)
		    .attr('width', width)
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
		  .attr('transform', `translate(0, ${h+axisPadding})`)
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

	/**
	* Render axis.
	*/

	renderAxis(data, options) {
		const { chart, xAxis, yAxis } = this

		const c = options.animate ? chart.transition() : chart

		c.select('.x.axis').call(xAxis)
		c.select('.y.axis').call(yAxis)
	}

	/**
	* Update axis
	*/

	updateAxis(data, options){

		var ticks 
		if(options.tickFormat === 'hour'){
			this.tickFormat = d3.timeFormat('%H')
			ticks = 24
			console.log('hour ticks')
			this.renderBuckets(data, options)
		}else if(options.tickFormat == 'day'){
			this.tickFormat = d3.timeFormat('%a')
			ticks = 7
			console.log('day ticks')
		}else if(options.tickFormat == 'month'){
			this.tickFormat = d3.timeFormat('%m')
			ticks = 12
			console.log('month ticks')
		}
		// week -> %U

		const { chart, tickSize, tickFormat } = this
		const [_, h] = this.dimensions()
		const c = chart.transition()

		if(options.axis === 'x'){
			this.xTicks = ticks
			this.xAxis = d3.axisBottom()
				.scale(this.x)
				.ticks(this.xTicks)
				.tickPadding(8)
				.tickSize(tickSize)
				.tickFormat(tickFormat)
				c.select('.x.axis').call(this.xAxis)
		}else{
			this.y = d3.scaleTime()
				.range([h, 0])
			this.yTicks = ticks
			this.yAxis = d3.axisLeft()
				.scale(this.y)
				.ticks(this.yTicks)
				.tickPadding(8)
				.tickSize(tickSize)
				c.select('.y.axis').call(this.yAxis)
		}
		
	}

	/**
	*	Render columns for visualizing one indexed data.
	*/

	renderColumns(data){
		const { chart, x, y, color, opacity, gap, yStep } = this
		const [w, h] = this.dimensions()

		// max count
		const zMax = d3.max(data, d => d3.max(d.bins, d => d.count))

		// color domain
		color.domain([0, zMax])
		opacity.domain([0, zMax])

		// bin dimensions
		const bw = (w / data.length)
		const bh = (h / data[0].bins.length)

		const col = chart.selectAll('.column')
		  .data(data)

		// enter
		col.enter().append('g')
		  .attr('class', 'column')

		const bin = col.selectAll('.bin')
		  .data(d => d.bins)

		bin.enter().append('rect')
		  .attr('class', 'bin')

		bin.style('fill', d => color(d.count))
		  .style('fill-opacity', d => opacity(d.count))
		  .attr('width', bw - gap)
		  .attr('height', bh - gap)
		  .attr('x', 0)
		  .attr('y', d => y(d.bin + yStep))

		// update
		col.attr('transform', (d, i) => `translate(${x(d.bin)}, 0)`)

		// exit
		col.exit().remove()
	}

	/**
	* Render bins.
	*/

	renderBuckets(data) {
		const { chart, x, y, color, opacity, gap, yStep } = this
		const [w, h] = this.dimensions()

		// max count
		const zMax = d3.max(data, d => d3.max(d.bins, d => d.count))

		// color domain
		color.domain([0, zMax])
		opacity.domain([0, zMax])

		// bin dimensions
		const bw = (w / data.length)
		const bh = (h / data[0].bins.length)

		const col = chart.selectAll('.column')
		  .data(data)

		// enter
		col.enter().append('g')
		  .attr('class', 'column')

		// update
		col.attr('transform', (d, i) => `translate(${x(d.bin)}, 0)`)

		// exit
		col.exit().remove()

		this.renderBinRect(col, bw, bh, gap, yStep)
	}

	/**
	* Render rectangular bin.
	*/

	renderBinRect(col, bw, bh, gap, yStep) {
		const { opacity, color, y, mouseover, mouseout } = this

		const bin = col.selectAll('.bin')
		  .data(d => d.bins)

		// enter
		bin.enter().append('rect')
		  .attr('class', 'bin')

		// update
		bin.style('fill', d => color(d.count))
		  .style('fill-opacity', d => opacity(d.count))
		  .attr('width', bw - gap)
		  .attr('height', bh - gap)
		  .attr('x', 0)
		  .attr('y', d => y(d.bin + yStep))

		bin.on('mouseover', mouseover)
		  .on('mouseleave', mouseout)

		// exit
		bin.exit().remove()
	}


	/**
	* Render the chart against the given `data`.
	*
	* Data shape is N bins by M bins. The top level bins array
	* forms the x-axis while the nested .bins is the y-axis. The number
	* of bins in each axis should be pre-defined to the desired size,
	* as this library does not compute histograms for you.
	*
	*   [{ bin: X, bins: [{ bin: Y, count: Z }] }]
	*
	*/

	render(data, options = {}) {
		const { axis } = this
		this.prepare(data, options)
		if (axis) this.renderAxis(data, options)
		this.renderBuckets(data, options)
	}

	/**
	* Update the chart against the given `data`.
	*/

	update(data) {
		this.render(data, {
		  animate: true
		})
	}
}

