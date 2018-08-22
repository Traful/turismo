import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col } from "reactstrap";

class Tarifas extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            menu: this.props.menu,
            menu_opt_sistema: true,
            advertencia: this.props.advertencia,
            idGuia: this.props.idGuia,
            allTarifas: [{id: 0, descripcion: "S/Datos", visible: false}],
            allTarifasSelected: 0,
            guiaTarifas: []
        };
        this.findTarifas = this.findTarifas.bind(this);
        this.handleAllTarifasChange = this.handleAllTarifasChange.bind(this);
        this.handleAddTarifa = this.handleAddTarifa.bind(this);
        this.handleDeleteTarifa = this.handleDeleteTarifa.bind(this);
        this.procesar = this.procesar.bind(this);
    }

    handleAddTarifa = (event) => {
        /*
        event.preventDefault();
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/servicio/add/${this.state.allTarifasSelected}`, {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 201) {
                    this.findTarifas();
                } else {
                    /
                        Error (Posible 409 - Conflicto la tarifa ya existe en la guia)
                        No debería ocurrir dada la lógica del componente el cual oculta
                        las Tarifas que ya posee la guia de la seleccion para agregar.
                    /
                }
            });
        });
        */
    }

    handleDeleteTarifa = (id) => {
        /*
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
                this.findTarifas();
            });
        });
        */
    }

    handleAllTarifasChange = (event) => {
        this.setState({allTarifasSelected: event.target.value});
    }
    
    procesar = () => {
        //var updatedTicket = Object.assign({}, this.state.ticket, {flightNo:'1010'});
        let alse = Object.assign([], this.state.allTarifas);
        let firstOK = 0;
        alse = alse.map((valor) => {
            let x = this.state.guiaTarifas.findIndex((e) => {
                if(valor.id === e.idtarifa) {
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
                allTarifas: [{id: 0, descripcion: "S/Datos", visible: false}],
                allTarifasSelected: 0,
                loading: false
            });
        } else {
            console.log("Aca!");
            this.setState({
                menu_opt_sistema: true,
                allTarifas: alse,
                allTarifasSelected: firstOK,
                loading: false
            });
        }
    }

    findTarifas = () => {
        //Obtener todas las Tarifas
        let TodosLosTarifas = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/tarifas`, {
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
                            allTarifas: res
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas las Tarifas");
                }
            });
        });
        //Obtener todos los Tarifas de la guia
        let ServicosDeLaGuia = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/tarifas`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            guiaTarifas: data.data.registros
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas las Tarifas de la guia");
                }
            });
        });
        Promise.all([TodosLosTarifas, ServicosDeLaGuia]).then(values => { 
            this.setState({
                allTarifasSelected: this.state.allTarifas[0].id
            });
            this.procesar();
        });
    }

    componentDidMount() {
        //Obtener los Tarifas
        this.findTarifas();
    }

    render() {
        const loading = this.state.loading;
        const menu = this.state.menu;
        const menu_opt_sistema = this.state.menu_opt_sistema;
        const opciones = this.state.allTarifas.map((alse) => {
            return(
                alse.visible
                ?
                <option key={`o-${alse.id}`} value={alse.id}>{alse.descripcion}</option>
                :
                ""
            );
        });
        const Tarifas = this.state.guiaTarifas.map((gserv) => {
            return(
                <span key={`Serv-${gserv.id}`} className="badge badge-pill badge-primary d-flex align-items-center">
                    <strong className="mr-2">{gserv.descripcion}</strong>
                    {
                         menu
                         ?
                         <i className="fas fa-times-circle" onClick={this.handleDeleteTarifa.bind(this, gserv.id)}></i>
                         :
                         ""
                    }
                </span>
            );
        });
        return(
            <div className="Tarifas">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-4">
                        <Row>
                            <Col xs="12" md="12">
                                <div className="d-flex flex-column justify-content-start mb-3">
                                    <label>Tarifas</label>
                                    {
                                        menu && menu_opt_sistema
                                        ?
                                        <div className="d-flex flex-nowrap justify-content-start">
                                            <select className="form-control" value={this.state.allTarifasSelected} onChange={this.handleAllTarifasChange}>
                                                {opciones}
                                            </select>
                                            <button className="btn btn-primary ml-2" onClick={this.handleAddTarifa}><i className="fas fa-arrow-circle-down"></i></button>
                                        </div>
                                        :
                                        ""
                                    }
                                    <hr />
                                    <div className="d-flex flex-wrap justify-content-start">
                                        {Tarifas}
                                    </div>
                                    {
                                        this.state.advertencia
                                        ?
                                        <div className="alert alert-warning mt-4" role="alert">
                                            Advertencia!: Los cambios realizados a las Tarifas se guardan automáticamente!.
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

export default Tarifas;