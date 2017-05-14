import React from 'react';
import { connect } from 'react-redux';
//import ReactDOM from 'react-dom';

import { Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';



class UploadForm extends React.Component {

	upload(){
		var file = this.input.files[0]
		var formData = new FormData()
		formData.append('file', file)
		formData.append('user', 'evin')
		var extension = file.name.split('.').pop()
		console.log(extension)
		switch(extension){
			case 'json':
				fetch('http://localhost:5000/upload',{
					method: 'POST',
					header: {
						'Accept':'application/json'
					},
  					body: formData
				})
				.then(function(response){
					console.log(response.ok)
				})
				.catch(function(error) {
		    		console.log('request failed', error)
		    	})
		    	break
			case 'csv':
				fetch('http://localhost:5000/upload/csv1',{
					method: 'POST',
					headers:{ 
						'Accept': 'application/json; charset=utf-8'     		
					},
  					body: formData
				})
				.then(function(response){
					console.log(response.ok)
				})
				.catch(function(error) {
		    		console.log('request failed', error)
		    	})
		    	break
		    default:
		    	console.log('Error: Cannot read data')
		}
		
	}

	render(){
		return(
	    	<form onSubmit={this.upload.bind(this)} >
				<FormGroup controlId="formControlsFile">
					<ControlLabel>File</ControlLabel>
					<FormControl type="file" inputRef={ref => { this.input = ref; }}/>
					<HelpBlock> You can upload a JSON or CSV data. </HelpBlock>
					<Button type="submit"> Submit </Button>
				</FormGroup>
	    	</form>
    	);
	}
}

/*
const UploadForm = (props) => {
    return(
		/* set properties 
 		const options = {
    	baseUrl: 'http://127.0.0.1',
    	query: {
      		warrior: 'fight'
    	}
  	}
  	/* Use ReactUploadFile with options */
  	/* Custom your buttons 
 	return (
  		<ReactUploadFile options={options} chooseFileButton={<YourChooseButton />} uploadFileButton={<YourUploadButton />} />
  	);

    <form>
			<FormGroup controlId = "formControlsFile">
				<ControlLabel>File</ControlLabel>
				<FormControl type="file" inputRef={ref => { this.input = ref; }}/>
				<HelpBlock> You can upload a JSON or CSV data. </HelpBlock>
			</FormGroup>

    		<Button type="submit" > Submit </Button>
    	</form>
    );
}*/

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadForm);