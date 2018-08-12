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
            guiaServicios: []
        };
        this.findServicios = this.findServicios.bind(this);
        this.handleAllServiciosChange = this.handleAllServiciosChange.bind(this);
        this.handleAddService = this.handleAddService.bind(this);
        //this.handleDeleteService = this.handleDeleteService.bind(this);
        this.procesar = this.procesar.bind(this);
    }

    handleAddService = (event) => {
        event.preventDefault();
        this.setState({
            loading: true
        }, () => {
            const data = new FormData();
            data.append("idguia", this.state.idGuia);
            data.append("idservicio", this.state.allServiciosSelected);
            fetch(process.env.REACT_APP_URL_API_SERVER + "/addguiaservicio.php", {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                },
                body: data
            })
            .then(res => {
                this.findServicios();
            });
        });
    }

    handleDeleteService = (id) => {
        this.setState({
            loading: true
        }, () => {
            const data = new FormData();
            data.append("id", id);
            fetch(process.env.REACT_APP_URL_API_SERVER + "/delguiaservicio.php", {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                },
                body: data
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
        //var updatedTicket = Object.assign({}, this.state.ticket, {flightNo:'1010'});
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
            fetch(`${process.env.REACT_APP_URL_API_SERVER}/servicios.php`)
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        let res = data.map((s) => {
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
            fetch(`${process.env.REACT_APP_URL_API_SERVER}/guiaservicios.php?idGuia=${this.state.idGuia}`)
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            guiaServicios: data
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
                                        <div className="d-flex flex-nowrap justify-content-start">
                                            <select className="form-control" value={this.state.allServiciosSelected} onChange={this.handleAllServiciosChange}>
                                                {opciones}
                                            </select>
                                            <button className="btn btn-primary ml-2" onClick={this.handleAddService}><i className="fas fa-arrow-circle-down"></i></button>
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