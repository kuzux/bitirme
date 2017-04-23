import React, { Component } from 'react';
import { connect } from 'react-redux';
//import * as d3 from "d3";
//import Chart from './Chart';
import Chart from './HeatMap';
//import Chart from './HeatMap2';

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

class Home extends Component {
	componentDidMount() {
		this.c = new Chart({
			target: this.refs.c,
			width: 800,
			height: 400
		})
		this.c.render(gen(55, 20)) /*
		this.c = new Chart({
			target: this.refs.c
		});*/
	}

	componentDidUpdate() {
		this.changeData()
	}

	changeData = _ => {
		this.c.render(gen(55, 20))
	}

  render() {
    return <div>
      <div id="actions">
        <button onClick={this.changeData}>Animate</button>
      </div>

      <section>
        <svg ref="c" className="chart"></svg>
      </section>

    </div>
  }
}

/*
const Home = (props) => {
    return 
        <div>
            <p>Home</p>
            //<Hadi data={props.data} />
            <Hadi />
        </div>; 
} */

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);