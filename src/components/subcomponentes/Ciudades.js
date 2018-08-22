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
            fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/ciudades/departamento/" + idDepartamento, {
                headers: new Headers({
                    "Authorization": localStorage.getItem("WebTurToken")
                })
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            loading: false,
                            ciudades: data.data.registros,
                            selected: {
                                id: data.data.registros[0].id,
                                nombre: data.data.registros[0].nombre
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
            <div className="Ciudades mb-4">
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
                                                    {element.nombre}
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