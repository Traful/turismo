import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col, Button, ButtonGroup } from "reactstrap";

class Departamentos extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            departamentos: [],
            selected: {
                id: 0,
                nombre: ""
            }
        };
    }

    handleDepartamentoClick = (id, nombre, e) => {
        this.setState({
            selected: {
                id: id,
                nombre:  nombre
            }
        });
        if(this.props.notificar === true) {
            this.props.handleEventClick(id, nombre);
        }
    }

    componentDidMount() {
        //Obtener todos los Departamentos
        fetch(process.env.REACT_APP_URL_API_SERVER + "/departamentos.php")
        .then(res => {
            if(res.ok && res.status === 200) {
                res.json().then((data) => {
                    let datos = data.map((d) => {
                        return {
                            id: d.id,
                            nombre: d.nombre
                        }
                    });
                    this.setState({
                        loading: false,
                        departamentos: datos,
                        selected: {
                            id: datos[0].id,
                            nombre: datos[0].nombre
                        }
                    });
                });
            }
        });
    }

    render() {
        const loading = this.state.loading;
        const departamentos = this.state.departamentos;
        return(
            <div className="Departamentos">
                {
                    loading ?
                    <Loading />
                    :
                    <div>
                        <Row>
                            <Col>
                                <ButtonGroup vertical style={{width: "100%"}}>
                                    {
                                        departamentos.map((element) => {
                                            return(
                                                <Button block key={element.id} tag="button" className="bg-info text-white" onClick={(e) => this.handleDepartamentoClick(element.id, element.nombre, e)}>
                                                    <strong>{element.nombre}</strong>
                                                </Button>
                                            );
                                        })
                                    }
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </div>
                }
            </div>
        );
    }
}

export default Departamentos;