
import * as d3 from "d3";

const defaults = {

  target: '#chart',

  width: 400,

  height: 400,

  margin: { top: 15, right: 0, bottom: 35, left: 60 },

  axisPadding: 5,

  interpolate: 'basis',

  color: ['rgb(0, 180, 240)', 'rgb(243, 42, 55)'],

  colorInterpolate: d3.interpolateHcl,

  opacityRange: [0.5, 1],

  gap: 1,

  minC: 0,

  // mouseover callback for tooltips or value display
  mouseover: _ => {},

  // mouseout callback for tooltips or value display
  mouseout: _ => {}
}

export default class Heatmap {

	constructor(config) {
		this.set(config)
		this.init()
	}

	set(config) {
		Object.assign(this, defaults, config);
	}

	dimensions() {
		const { width, height, margin } = this
		const w = width - margin.left - margin.right
		const h = height - margin.top - margin.bottom
		return [w, h]
	}

	init() {
		const { target, width, height, margin, axisPadding } = this
		const { color, colorInterpolate, opacityRange } = this

		const [w, h] = this.dimensions()

		this.chart = d3.select(target)
		    .attr('width', width)
		    .attr('height', height)
		  .append('g')
		    .attr('transform', `translate(${margin.left}, ${margin.top})`)

		this.x = d3.scaleLinear()
			.range([0, w])

		this.y = d3.scaleLinear()
			.range([h, 0])

		//this.y = d3.scaleTime()
		//	.range([h, 0])

		this.opacity = d3.scaleLinear()
			.range(opacityRange)

		this.color = d3.scaleLinear()
			.range(color)
			.interpolate(colorInterpolate)

		this.xAxis = d3.axisBottom()
		  .scale(this.x)
		  .tickPadding(8)
		  .tickFormat(d3.timeFormat('%H'))

		this.yAxis = d3.axisLeft()
		  .scale(this.y)
		  .tickPadding(8)
		  .tickFormat(d3.timeFormat('%a'))

		this.chart.append('g')
		  .attr('class', 'x axis')
		  .attr('transform', `translate(0, ${h+axisPadding})`)
		  .call(this.xAxis)

		this.chart.append('g')
		  .attr('class', 'y axis')
		  .attr('transform', `translate(${-axisPadding}, 0)`)
		  .call(this.yAxis)
	}

	prepare(data, options ) {
		const { x, y } = this
		//console.log(data[0].bins[0].bin)
		//console.log("hele")
		const ydMin = d3.min(data, d => d3.min(d.bins, d => d.bin))
		const ydMax = d3.max(data, d => d3.max(d.bins, d => d.bin))
		const yStep = ydMax / (ydMax - ydMin + 1)
		this.minC = d3.min(data, d=> d3.min(d.bins, d => d.count))

		const xMin = d3.min(data, d=> d.bin)
		const xMax = d3.max(data, d=> d.bin)

		//for(var i in data){

			//console.log(data[i].bin)
		//}

		//console.log("Data: ", data[10].bin)
		//console.log(xMin, " ", xMax)
		x.domain(d3.extent(data, d => d.bin))
		y.domain([ydMin-1, ydMax])
		this.yStep = yStep;
		this.ydMax = ydMax;
		this.ydMin = ydMin;
	}

	tickCount(type){
		var ticks, tickFormat
		if(type === 'hour'){
			tickFormat = d3.timeFormat('%H')
			//ticks = 24
			//console.log('hour ticks')
		}else if(type === "day"){
			tickFormat = d3.timeFormat('%a')
			//ticks = 7
			//console.log("day ticks")
		}else if(type === 'month'){
			tickFormat = d3.timeFormat('%m')
			//ticks = 12
			//console.log('month ticks')
		}
		// week -> %U
		return [ticks, tickFormat]
	}

	renderAxis(data, options) {
		const { chart, xAxis, yAxis} = this
		//const { xTicks, yTicks } = this

		let xTick = this.tickCount(options.xTime)
		//this.xTicks = xTick[0]
		let xTickFormat = xTick[1]

		let yTick = this.tickCount(options.yTime)
		//this.yTicks = yTick[0]
		let yTickFormat = yTick[1]

		//console.log("X Format: ", xTickFormat, " ticks: ", xTicks)
		//console.log("Y Format: ", yTickFormat, " ticks: ", yTicks)

		this.xAxis = d3.axisBottom()
		  .scale(this.x)
		  .ticks(24)
		  .tickFormat(xTickFormat)

		this.yAxis = d3.axisLeft()
		  .scale(this.y)
		  .ticks(d3.timeDay.every(1))
		  .tickFormat(yTickFormat)

		const c = chart.transition()

		c.select('.x.axis').call(xAxis)
		c.select('.y.axis').call(yAxis)
	}

	renderBuckets(data) {
		const { chart, color, opacity, gap, yStep } = this
		const [w, h] = this.dimensions()

		// max count
		const zMax = d3.max(data, d => d3.max(d.bins, d => d.count))
		const ydMin = d3.min(data, d => d3.min(d.bins, d => d.bin))
		const ydMax = d3.max(data, d => d3.max(d.bins, d => d.bin))

		// color domain
		color.domain([0, zMax])
		opacity.domain([0, zMax])

		// bin dimensions
		const bw = (w / data.length)
		const bh = (h / (ydMax - ydMin + 1))

		this.yAxis.ticks(ydMax - ydMin)

		//console.log("bin width " + bw)
		//console.log("bin height " + bh)

		const col = chart.selectAll('.column')
		  .data(data)

		// enter
		col.enter().append('g')
		  .attr('class', 'column')

		// update
		col.attr('transform', (d, i) => `translate(${i*bw}, 0)`)

		// exit
		col.exit().remove()

		this.renderBinRect(col, bw, bh, gap, yStep)
	}

	renderBinRect(col, bw, bh, gap, yStep) {
		const { opacity, color, minC, mouseover, mouseout } = this

		const bin = col.selectAll('.bin')
		  .data(d => d.bins)

		// enter
		bin.enter().append('rect')
		  .attr('class', 'bin')

		//console.log("ystep " + this.yStep)

		// update
		bin.style('fill', d => color(d.count-minC))
		  .style('fill-opacity', d => opacity(d.count-minC))
		  .attr('width', bw - gap)
		  .attr('height', bh - gap)
		  .attr('x', 0)
		  .attr('y', d => bh * (this.ydMax - d.bin))

		bin.on('mouseover', mouseover)
		  .on('mouseleave', mouseout)

		// exit
		bin.exit().remove()
	}

	render(data, options) {
		this.prepare(data, options)
		this.renderAxis(data, options)
		//console.log(data)
		this.renderBuckets(data, options)
	}

	update(data) {
		this.render(data, {
		  animate: true
		})
	}
}

