import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export class Footer extends Component {

    state = {
        year: ''
    }

    componentDidMount() {
        setInterval(() => {
            var d = new Date();
            var year = d.getFullYear()
            this.setState({ year })
        }, 1000)
    }

    render() {
        return (
            <footer id="footer" className="w3-container w3-indigo w3-padding w3-tiny">
                <label>{this.state.year} <FontAwesomeIcon icon="copyright"></FontAwesomeIcon> Copyright Fong Dai Goresmack</label>
            </footer>
        );
    }
}

export default Footer