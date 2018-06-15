import React, {Component} from 'react'
import { Grid, Col,Row, Button, FormControl } from 'react-bootstrap';



export default class SetFee extends Component {
    
    constructor(props) {
        super(props);


        this.state = {
            newFee:  (this.props.feeDivider) ? this.props.feeMultiplier / this.props.feeDivider * 100 : 0,
            newLimit: this.props.feeLimit
        };

        this.handleChange   = this.handleChange.bind(this);
        this.setParams      = this.setParams.bind(this);
    }

    componentWillReceiveProps(nextProps)
    {
        this.setState({
            newFee:  (nextProps.feeDivider) ? nextProps.feeMultiplier / nextProps.feeDivider * 100 : 0,
            newLimit: nextProps.feeLimit
        });
        
    }

    handleChange(event)
    {
        let value = event.target.value;
        if(value < 0) {
            this.setState({[event.target.name]: Math.abs(value)});
        }else{
            this.setState({[event.target.name]: value})
        }
    }

    setParams()
    {
        this.props.setParams(this.state.newFee, this.state.newLimit);
    }    
    
    
    render() {

        const current = this.props.feeMultiplier / this.props.feeDivider * 100;

        return (
            <div>
                <p>Current %: {current}</p>
                <p>Current Limit: {this.props.feeLimit}</p>
                <Grid fluid className="caption-grid">
                    <Row>
                        <Col sm={4}>
                            <h3>Fee (%)</h3>
                        </Col>
                        <Col sm={4}>
                            <FormControl
                                name="newFee"
                                type="number"
                                value={this.state.newFee}
                                onChange={this.handleChange}
                            />
                        </Col>
    
                    </Row>
    
                        <Row>
                        <Col sm={4}>
                            <h3>Limit</h3>
                        </Col>
    
                        <Col sm={4} >
                            <FormControl
                                name="newLimit"
                                type="number"
                                value={this.state.newLimit}
                                onChange={this.handleChange}
                            />
                        </Col>
    
                    </Row>
    
                    <Row>
                        <Col sm={4}>
    
                        </Col>
    
                        <Col sm={4} >
                            <Button bsStyle="primary" onClick={this.setParams}>Set</Button>
                        </Col>
    
                    </Row>
    
                </Grid>
            </div>
        );
    }
}
    