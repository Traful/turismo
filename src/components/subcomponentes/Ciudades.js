import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col, Button, ButtonGroup } from "reactstrap";

class Ciudades extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            ciudades: [],
            selected: {
                id: 0,
                nombre: ""
            }
        };
        this.findCiudades = this.findCiudades.bind(this);
    }

    handleCiudadesClick = (id, nombre, e) => {
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

    findCiudades = (idDepartamento) => {
        if(idDepartamento === 0) {
            this.setState({
                loading: false,
                ciudades: [{id: 0, nombre: "..."}],
                selected: {
                    id: 0,
                    nombre: "..."
                }
            });
        } else {
            fetch(process.env.REACT_APP_URL_API_SERVER + "/ciudades.php?idDep=" + idDepartamento)
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
                            ciudades: datos,
                            selected: {
                                id: datos[0].id,
                                nombre: datos[0].nombre
                            }
                        });
                    });
                } else {
                    this.setState({
                        loading: false,
                        ciudades: [{id: 0, nombre: "Error al obtener los datos!"}],
                        selected: {
                            id: 0,
                            nombre: "Error al obtener los datos!"
                        }
                    });
                }
            });
        }
    }

    componentDidMount() {
        //Obtener todas las Ciudades
        this.findCiudades(this.props.idDepartamento);
    }

    componentDidUpdate(prevProps) {
        if(this.props.idDepartamento !== prevProps.idDepartamento) {
            this.findCiudades(this.props.idDepartamento);
        }
    }

    render() {
        const loading = this.state.loading;
        const ciudades = this.state.ciudades;
        return(
            <div className="Ciudades">
                {
                    loading ?
                    <Loading />
                    :
                    <div>
                        <Row>
                            <Col>
                                <ButtonGroup vertical style={{width: "100%"}}>
                                    {
                                        ciudades.map((element) => {
                                            return(
                                                <Button block key={element.id} tag="button" className="bg-warning text-dark" onClick={(e) => this.handleCiudadesClick(element.id, element.nombre, e)}>
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

export default Ciudades;