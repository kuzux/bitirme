import React, { Element } from 'react';
import { connect } from 'react-redux';
import HeatMap from './HeatMap';

const geny = n => {
  const data = []

  for (var i = 0; i < n; i++) {
    data.push({
      bin: i * 150,
      count: Math.random() * (25 * (n - i))
    })
  }

  return data
}

const gen = (x, y) => {
  const data = []

  for (var i = 0; i < x; i++) {
    data.push({
      bin: i,
      bins: geny(y)
    })
  }

  return data
}

class Plot extends React.Component {
	
	constructor(props){
		super(props)
		this.state = {
			timeFormat: 'h',
		};
	}

  	componentDidMount() {
		this.c = new HeatMap({
			target: this.refs.c,
			width: 800,
			height: 400
		})
		this.changeData(gen(55, 20)) 
	}

	componentDidUpdate() {
		this.changeData()
	}

	changeData = _ => {
		this.c.render(gen(55, 20))
	}

	render() {
		const {
			timeFormat
		} = this.state;
		return <div>
			<div id="actions">
				<button onClick={this.changeData}>Update</button>
			</div>

			<div id="Hour">
				<button onClick={()=>{
					this.c.updateAxis(gen(55, 20),{
						axis: 'x',
						tickFormat: 'hour'
					})
				}}>Hour</button>
			</div>

			<div id="Day">
				<button onClick={()=>{
					this.c.updateAxis(gen(55, 20),{
						axis: 'x',
						tickFormat: 'day'
					})
				}}>Day</button>
			</div>

			<section>
				<svg ref="c" className="chart"></svg>
			</section>

		</div>
	}
}

const Chart = (props) => {
    return(
    	<Plot />
    );
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Chart);