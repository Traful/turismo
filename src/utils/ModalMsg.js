import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

class ModalMsg extends Component {
	constructor(props) {
        super(props);
        this.state = {
            open: false,
            msg: "",
            onlyOk: false
        };
    }

    componentDidUpdate(prevProps) {
        if(this.props.msg !== prevProps.msg) {
            this.setState({msg: this.props.msg});
        }
        if(this.props.onlyOk !== prevProps.onlyOk) {
            this.setState({onlyOk: this.props.onlyOk});
        }
        if(this.props.open !== prevProps.open) {
            this.setState({open: this.props.open});
        }
    }

    render() {
        const msg = this.state.msg;
        const onlyOk = this.state.onlyOk;
        return(
            <div className="ModalMsg">
                <Modal isOpen={this.state.open} toggle={this.toggle}>
                    <ModalHeader toggle={this.toggle}>{this.props.titulo}</ModalHeader>
                    <ModalBody>
                        <p>{msg}</p>
                        {this.props.children}
                    </ModalBody>
                    <ModalFooter>
                        {
                            onlyOk
                            ?
                                <Button color="primary" onClick={this.props.handleAceptar}>Aceptar</Button>
                            :
                                <div>
                                    <Button color="primary" onClick={this.props.handleAceptar}>Aceptar</Button>{' '}
                                    <Button color="secondary" onClick={this.props.handleCancelar}>Cancelar</Button>
                                </div>
                        }
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}

export default ModalMsg;