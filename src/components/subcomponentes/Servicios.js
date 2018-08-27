import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col } from "reactstrap";

class Servicios extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            menu: this.props.menu,
            menu_opt_sistema: true,
            advertencia: this.props.advertencia,
            idGuia: this.props.idGuia,
            allServicios: [{id: 0, descripcion: "S/Datos", visible: false}],
            allServiciosSelected: 0,
            guiaServicios: [],
            capacidad: 0
        };
        this.findServicios = this.findServicios.bind(this);
        this.handleAllServiciosChange = this.handleAllServiciosChange.bind(this);
        this.handleAddService = this.handleAddService.bind(this);
        this.handleDeleteService = this.handleDeleteService.bind(this);
        this.procesar = this.procesar.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = (event) => {
        const target = event.target;
		const name = target.name;
		var value = target.type === "checkbox" ? target.checked : target.value;
		if(target.type === "number") {
			if(value === "") {
				value = 0;
			} else {
				if(isFinite(value)) {
					let x = parseFloat(value, 10);
					if(x < 0) {
						x = 0;
					}
					value = x; //Por algun motivo queda un 0 ver!
				} else {
					value = 0;
				}
			}
		}
		this.setState({
				[name]: value
		});
    }

    handleAddService = (event) => {
        event.preventDefault();
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/servicio/add/${this.state.allServiciosSelected}`, {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({capacidad: this.state.capacidad})
            })
            .then(res => {
                if(res.ok && res.status === 201) {
                    this.setState({
                        capacidad: 0
                    });
                    this.findServicios();
                } else {
                    /*
                        Error (Posible 409 - Conflicto el servicio ya existe en la guia)
                        No debería ocurrir dada la lógica del componente el cual oculta
                        los servicios que ya posee la guia de la seleccion para agregar.
                    */
                }
            });
        });
    }

    handleDeleteService = (id) => {
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/servicio/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                this.findServicios();
            });
        });
    }

    handleAllServiciosChange = (event) => {
        this.setState({allServiciosSelected: event.target.value});
    }
    
    procesar = () => {
        let alse = Object.assign([], this.state.allServicios);
        let firstOK = 0;
        alse = alse.map((valor) => {
            let x = this.state.guiaServicios.findIndex((e) => {
                if(valor.id === e.idservicio) {
                    return true;
                } else {
                    return false;
                }
            });
            if(x > -1) {
                return {...valor, visible: false}
            } else {
                if(firstOK === 0) {
                    firstOK = valor.id;
                }
                return valor;
            }
        });
        if(firstOK === 0) {
            this.setState({
                menu_opt_sistema: false,
                allServicios: [{id: 0, descripcion: "S/Datos", visible: false}],
                allServiciosSelected: 0,
                loading: false
            });
        } else {
            this.setState({
                menu_opt_sistema: true,
                allServicios: alse,
                allServiciosSelected: firstOK,
                loading: false
            });
        }
    }

    findServicios = () => {
        //Obtener todos los servicios
        let TodosLosServicios = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/servicios`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        let res = data.data.registros.map((s) => {
                            return({
                                id: s.id,
                                descripcion: s.descripcion,
                                visible: true
                            });
                        });
                        this.setState({
                            allServicios: res
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todos los servicios");
                }
            });
        });
        //Obtener todos los servicios de la guia
        let ServicosDeLaGuia = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/servicios`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            guiaServicios: data.data.registros
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todos los servicios de la guia");
                }
            });
        });
        Promise.all([TodosLosServicios, ServicosDeLaGuia]).then(values => { 
            this.setState({
                allServiciosSelected: this.state.allServicios[0].id
            });
            this.procesar();
        });
    }

    componentDidMount() {
        //Obtener los Servicios
        this.findServicios();
    }

    render() {
        const loading = this.state.loading;
        const menu = this.state.menu;
        const menu_opt_sistema = this.state.menu_opt_sistema;
        const opciones = this.state.allServicios.map((alse) => {
            return(
                alse.visible
                ?
                <option key={`o-${alse.id}`} value={alse.id}>{alse.descripcion}</option>
                :
                ""
            );
        });
        const servicios = this.state.guiaServicios.map((gserv) => {
            return(
                <span key={`Serv-${gserv.id}`} className="badge badge-pill badge-primary d-flex align-items-center">
                    <strong className="mr-2">{gserv.descripcion}</strong>
                    {
                        gserv.capacidad > 0
                        ?
                        <strong>({gserv.capacidad})&nbsp;&nbsp;</strong>
                        :
                        ""
                    }
                    {
                        menu
                        ?
                        <i className="fas fa-times-circle" onClick={this.handleDeleteService.bind(this, gserv.id)}></i>
                        :
                        ""
                    }
                </span>
            );
        });
        return(
            <div className="Servicios">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-4">
                        <Row>
                            <Col xs="12" md="12">
                                <div className="d-flex flex-column justify-content-start mb-3">
                                    <label>Servicios</label>
                                    {
                                        menu && menu_opt_sistema
                                        ?
                                        <div className="row">
                                            <div className="col-xs-6 col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="idservicio">Tipo</label>
                                                    <select className="form-control" name="idservicio" id="idservicio" value={this.state.allServiciosSelected} onChange={this.handleAllServiciosChange}>
                                                        {opciones}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="capacidad">Capacidad</label>
                                                    <input type="number" className="form-control" name="capacidad" id="capacidad" value={this.state.capacidad} onChange={this.handleChange} style={{textAlign: "right"}}/>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-1 d-flex justify-content-end align-items-center">
                                                <button type="button" className="btn btn-primary ml-2 mt-2" onClick={this.handleAddService}><i className="fas fa-arrow-circle-down"></i></button>
                                            </div>
                                        </div>
                                        :
                                        ""
                                    }
                                    <hr />
                                    <div className="d-flex flex-wrap justify-content-start">
                                        {servicios}
                                    </div>
                                    {
                                        this.state.advertencia
                                        ?
                                        <div className="alert alert-warning mt-4" role="alert">
                                            Advertencia!: Los cambios realizados a los servicios se guardan automáticamente!.
                                        </div>
                                        :
                                        ""
                                    }
                                </div>
                            </Col>
                        </Row>
                    </div>
                }
                <style jsx="true">{`
                    .badge-pill {
                        padding: 8px;
                        font-size: 18px;
                        margin-right: 5px;
                        margin-bottom: 5px;
                    }
                    .fa-times-circle {
                        cursor: pointer;
                    }
                `}</style>
            </div>
        );
    }
}

export default Servicios;