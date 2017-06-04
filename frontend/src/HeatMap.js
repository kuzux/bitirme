
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

  ydMax: 1,

  ydMin: 0,

  // mouseover callback for tooltips or value display
  mouseover: _ => {
  	
  },

  // mouseout callback for tooltips or value display
  mouseout: _ => {
  	
  }
}

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22", "00"];
const tickMap = {"hour": hours , "month": months, "day": days};

export default class Heatmap {

	constructor(config) {
		Object.assign(this, defaults, config);
		this.init();
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

		this.x = d3.scaleTime()
			.range([0, w])

		this.y = d3.scaleTime()
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
		  .tickPadding(10)
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

		this.chart.append('text') // x axis label
			.attr('class', 'x label')
			.attr("x", w/2)
			.attr("y", h+margin.bottom-2)
			.style("text-anchor", "middle")
			.text("Hour")

		this.chart.append('text')
			.attr('class', 'y label')
			.attr('transform', 'rotate(-90)')
			.attr("x", 0 - h/2 )
			.attr("y", 0 - margin.left)
			.attr("dy", "1em")
			.style("text-anchor", "middle")
			.text("Day")
	}

	prepare(data, options ) {
		console.log("prepare: ")

		const { x, y} = this
		this.minC = d3.min(data, d=> d3.min(d.bins, d => d.count))

		//const xMin = d3.min(data, d=> d.bin)
		//const xMax = d3.max(data, d=> d.bin)
		let ymin = 0;
		let ymax = 1;

		if(options.yTime != null){
			ymin = parseInt(data[0].bins[0].bin, 10)
			ymax = parseInt(data[0].bins[0].bin, 10)

			//console.log("y: ", ymin, " ", ymax)
			//console.log(data.length, " ", data[0].bins.length)

			for (var i = 0; i < data.length; i++){
				var b = data[i].bins
				for(var j =0; j< b.length; j++){
					let v =  parseInt(b[j].bin, 10)
					//console.log("v: ", v)
					if( v > ymax) ymax = v;
					if( v < ymin) ymin = v;
				}	
			}
		}

		console.log("y min-max: ", ymin, " ", ymax)
		x.domain([0, data.length])
		y.domain([ymin, ymax])
		this.ydMax = ymax;
		this.ydMin = ymin;
	}

	renderAxis(data, options) {
		console.log("render axis: ")
		const { chart, xAxis, yAxis} = this

		console.log(tickMap[options.yTime][0])
		
		this.xAxis = d3.axisBottom()
		  .scale(this.x)
		  .tickFormat(function(d, i){
		  	return tickMap[options.xTime][i]
		  })

		this.yAxis = d3.axisLeft()
		  .scale(this.y)
		  .tickFormat(function(d, i){
		  	console.log("y axis tick ",i,": ", tickMap[options.yTime][i]);
		  	return tickMap[options.yTime][i]
		  })

		const c = chart.transition()

		c.select('.x.axis').call(xAxis)
		c.select('.y.axis').call(yAxis)

		c.select('.x.label').text(options.xTime)
		c.select('.y.label').text(options.yTime)
	}

	renderBuckets(data) {
		console.log("render buckets: " )
		const { chart, color, opacity, gap, ydMin, ydMax} = this
		const [w, h] = this.dimensions()

		// max count
		const zMax = d3.max(data, d => d3.max(d.bins, d => d.count))

		//const ydMin = d3.min(data, d => d3.min(d.bins, d => parseInt(d.bin)))
		//const ydMax = d3.max(data, d => d3.max(d.bins, d => parseInt(d.bin)))

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

		this.renderBinRect(col, bw, bh, gap)
	}

	renderBinRect(col, bw, bh, gap) {
		const { opacity, color, minC, mouseover, mouseout } = this

		const bin = col.selectAll('.bin')
		  .data(d => d.bins)

		// enter
		bin.enter().append('rect')
		  .attr('class', 'bin')

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
		if(data.length >0 && options.xTime != null && options.yTime != null){
			console.log("rendera geldik: xTime :", options.xTime ," , yTime:", options.yTime)
			console.log(data)
			this.prepare(data, options)
			this.renderAxis(data, options)
			this.renderBuckets(data, options)
		}
	}

	update(data, options) {
		this.render(data, options)
	}
}

