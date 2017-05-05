import React from 'react';
import { connect } from 'react-redux';

import { ButtonGroup, Button, FormControl, FormGroup, ControlLabel, HelpBlock } from 'react-bootstrap';



const UploadForm = (props) => {
    return(
    	<form>
			<FormGroup controlId = "formControlsFile">
				<ControlLabel>File</ControlLabel>
				<FormControl type ="file"/>
				<HelpBlock> You can upload a JSON or CSV data. </HelpBlock>
			</FormGroup>

    		<Button type="submit" > Submit </Button>
    	</form>
    );
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(UploadForm);