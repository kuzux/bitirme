import React from 'react';
import { connect } from 'react-redux';
import HeatMap from './HeatMap';
import UploadForm from './UploadForm';

import { ButtonGroup, Button} from 'react-bootstrap';

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
			hourClicked: false,
			dayClicked: false,
			monthClicked: false,
			bs1: "primary",
			bs2: "primary",
			bs3: "primary",
			nClicked : 0,
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
		this.changeData(gen(55, 20))
	}

	buildTensor = () => {
		fetch('http://localhost:5000/build',{
				method: 'GET',
				mode: 'no-cors'
			})
			.then(function(response) {
				console.log(response.text())
			}).then(function(json) {
				console.log('parsed json', json)
			}).catch(function(err) {
				console.log('parsing failed', err)
			})
	}

	changeData = (e) => {
		//console.log(e.target.name)
		this.c.render(gen(55, 20))
	}

	changeAxis = (e) => {
		const button = e.target.name
		var nClicked = this.state.nClicked
		var axis, timeFormat
		console.log('degismeden once:')
		console.log(this.state.hourClicked, this.state.dayClicked, this.state.monthClicked)
		console.log(this.state.nClicked)
		if(button === 'hour'){
			if(this.state.hourClicked){
				this.setState({
					bs1: "primary",
					hourClicked: false,
					nClicked: nClicked - 1
				})
				if(nClicked-1 === 1) {
					axis = 'x'
					if(this.state.dayClicked) timeFormat = 'day'
					if(this.state.monthClicked) timeFormat = 'month'
				}
			} else {
				this.setState({
					bs1: "info",
					hourClicked: true,
					nClicked: nClicked+1
				})
				timeFormat = 'hour'
				axis = nClicked>0 ? 'y' : 'x'
			}
		}else if(button === 'day'){
			if(this.state.dayClicked){
				this.setState({
					bs2: "primary",
					dayClicked: false,
					nClicked: nClicked - 1
				})
				if(nClicked-1 === 1) {
					axis = 'x'
					if(this.state.hourClicked) timeFormat = 'hour'
					if(this.state.monthClicked) timeFormat = 'month'
				}
			} else {
				this.setState({
					bs2: "info",
					dayClicked: true,
					nClicked: nClicked + 1
				})
				timeFormat = 'day'
				axis = nClicked>0 ? 'y' : 'x'
			}
		}else if(button === 'month'){
			if(this.state.monthClicked){
				this.setState({
					bs3: "primary",
					monthClicked: false,
					nClicked: nClicked- 1
				})
				if(nClicked-1 === 1) {
					axis = 'x'
					if(this.state.dayClicked) timeFormat = 'day'
					if(this.state.hourClicked) timeFormat = 'hour'
				}
			} else {
				this.setState({
					bs3: "info",
					monthClicked: true,
					nClicked: nClicked + 1
				})
				timeFormat = 'month'
				axis = nClicked>0 ? 'y' : 'x'
			}
		}

		console.log('degisti:', axis, timeFormat)

		this.c.updateAxis(gen(55, 20),{
			axis: axis,
			tickFormat: timeFormat
		})
	}

	render() {
		return <div>
			<div>
				<UploadForm data={this.props.data} />
			</div>

			<Button name='build' bsStyle="primary" onClick={this.buildTensor}>Build Tensor</Button>
			<Button name='update' bsStyle="primary" onClick={this.changeData}>Update</Button>

			<ButtonGroup>
				<Button name='hour' bsStyle={this.state.bs1} onClick={this.changeAxis}>Hour</Button>
				<Button name='day' bsStyle={this.state.bs2} onClick={this.changeAxis}>Day</Button>
				<Button name='month' bsStyle={this.state.bs3} onClick={this.changeAxis}>Month</Button>
			</ButtonGroup>

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