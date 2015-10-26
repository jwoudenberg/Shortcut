import React from 'react';
import { Alert, Row, Col } from 'react-bootstrap';
import { List } from 'immutable';
import { on } from 'flyd';

export default class ErrorDisplay extends React.Component {
    constructor (props) {
        super(props);
        this.state = { errors: List() };
        const addToErrorsList = error => error && this.setState(({ errors }) => ({ errors: errors.push(error) }));
        on(addToErrorsList, props.errors);
    }
    dismissError () {
        this.setState(({ errors }) => ({ errors: errors.shift() }));
    }
    render () {
        const { errors } = this.state;
        const visibleError = errors.first();
        const visibility = visibleError ? 'visible' : 'hidden';
        return (
            <Row>
                <Col xs={6} xsOffset={3}>
                    <div style={{ height: '5em', visibility }} >
                        <Alert
                            bsStyle='warning'
                            onDismiss={::this.dismissError}
                            >
                            {visibleError}
                        </Alert>
                    </div>
                </Col>
            </Row>
        );
    }
}

