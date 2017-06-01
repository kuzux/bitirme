import React from 'react';
import { connect } from 'react-redux';
import HeatMap from './HeatMap';
import UploadForm from './UploadForm';

import { ButtonGroup, Button} from 'react-bootstrap';

const getdata = (int1, int2, op, op_field) => {
	// serverdan cek
	// geny usulu row bak
	// iki input al: intervals = ['hour', 'day', 'week', 'month']
	// channel inputu al (aktif, kapasitif, enduktif vs)

	const data = []
	let query

	// iki index varsa :
	if (int1 != null && int2 != null) query = 'http://localhost:5000/group-time/'+int1+'/'+int2+'/'+op+'/'+op_field

	// tek index varsa:
	if(int1 == null) query = 'http://localhost:5000/group-time/'+int2+'/'+op+'/'+op_field
	if(int2 == null) query = 'http://localhost:5000/group-time/'+int1+'/'+op+'/'+op_field
	
	// hicbir buton yoksa
	if(int1 == null && int2 == null) return "";

	console.log("query: ",query)	

	fetch(query,{
			method: 'GET'
		})
		.then(function(response) {
			response.text().then(function(json) {
				//console.log('parsed json he', JSON.parse(json))
				// data = json.load(data_file)
				let parsed = JSON.parse(json);
				for (let key in parsed.result) {
					let y;
					if (int1 != null && int2 != null){
						y = [];
						for(let subkey in parsed.result[key]) {
							y.push({
								bin: subkey,
								count: parsed.result[key][subkey]
							});
					    }
					}else{
						y = parsed.result[key]
					}
					//console.log("parseladi")
				    data.push({
				      bin: key,
				      bins: y
				    })
				}
			}).catch(function(err) {
				console.log(' get parsing failed', err)
			});
		});
	return data;
}

const buttonStyle = { false: "primary", true: "info" };
const buttonClicked = (x, y, b) => { 
	return (x === b || y === b)? true : false;
}

class Plot extends React.Component {
	
	constructor(props){
		super(props)
		this.state = {
			data: "",
			x: "hour",
			y: "day"
		};
		//console.log(buttonStyle[buttonClicked(this.state.x, this.state.y, 'hour')])
  		//console.log("constructed")
	}

  	componentDidMount() {
  		//console.log("did mount")
		this.c = new HeatMap({
			target: this.refs.c,
			width: 800,
			height: 400
		})
		this.setState({
			data: getdata(this.state.x, this.state.y, 'sum', 'AKTIF'),
		})
		this.changeData(this.state.data) 
	}

	componentDidUpdate() {
  		//console.log("did update")
		this.changeData(this.state.data) 
	}

	buildTensor = () => {
		fetch('http://localhost:5000/build-tensor',{
				method: 'GET'
			})
			.then((response) => {
				response.text().then((json) => {
					//console.log('parsed json', JSON.parse(json))
					this.changeData(JSON.parse(json).result)
				}).catch((err) => {
					console.log('parsing failed in build tensor', err)
				});
			});
	}

	changeData(){
  		//console.log("change data")
  		console.log("change data: ", this.state.data)
		this.c.render(this.state.data, {
			x: this.state.x,
			y: this.state.y
		})
	}

	changeAxis = (e) => {
		let button = e.target.name
		let x = this.state.x
		let y = this.state.y
		
		if ( x === button ) {
			x = y;
			y = null;
		}else if ( y === button ) {
			y = null;
		}else{
			if( x === null ){
				x = button;
			}else if( y === null ){
				y = button;
			}else{
				// 3.butona basmasina izin vermiyoz, degistirmeden cik, returnle
				return;
			}
		}

		console.log("button clicked")
		console.log('x: ',x , " y: ", y)
		this.setState({
			data: getdata(x, y, 'sum', "AKTIF"),
			x: x,
			y: y
		})
		
		this.changeData()
	}

	render() {
		return <div>
			<div>
				<UploadForm data={this.props.data} />
			</div>

			<Button name='build' bsStyle="primary" onClick={this.buildTensor}>Build Tensor</Button>
			<Button name='update' bsStyle="primary" onClick={ () => {this.changeData(this.state.data)} }>Update</Button>

			<ButtonGroup>
				<Button name='hour' bsStyle={buttonStyle[buttonClicked(this.state.x, this.state.y, 'hour')]} onClick={this.changeAxis}>Hour</Button>
				<Button name='day' bsStyle={buttonStyle[buttonClicked(this.state.x, this.state.y, 'day')]} onClick={this.changeAxis}>Day</Button>
				<Button name='month' bsStyle={buttonStyle[buttonClicked(this.state.x, this.state.y, 'month')]} onClick={this.changeAxis}>Month</Button>
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