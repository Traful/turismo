import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col } from "reactstrap";
import ModalMsg from "../../utils/ModalMsg"


class Redes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            advertencia: this.props.advertencia,
            idGuia: this.props.idGuia,
            menu: this.props.menu,
            menu_opt_sistema: true,
            link: "",
            redes: {
                data: [{id: 0, nombre: "Cargando...", icono: "", visible: true}],
                selected: 0
            },
            redes_guia: [],
            modalRedes: {
                open: false,
                msg: "Redes Sociales",
                onlyOk: false
            },
            deleteId: 0
        };
        this.findRedes = this.findRedes.bind(this);
        this.handleComboRedesChange = this.handleComboRedesChange.bind(this);
        this.handleDeleteRed = this.handleDeleteRed.bind(this);
        this.handleAddRed = this.handleAddRed.bind(this);
        this.handleRedesMsgOk = this.handleRedesMsgOk.bind(this);
        this.handleRedesMsgClose = this.handleRedesMsgClose.bind(this);
    }

    handleRedesMsgClose = () => {
        this.setState({
            modalRedes: {
                ...this.state.modalRedes,
                open: false
            }
        })
    }

    handleRedesMsgOk = () => {
        //Eliminar la Red
        this.setState({
            modalRedes: {
                ...this.state.modalRedes,
                open: false
            },
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/red/${this.state.deleteId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    this.findRedes();
                    this.setState({
                        menu_opt_sistema: true,
                        link: ""
                    });
                }
            });
        });
    }

    handleAddRed = () => {
        this.setState({
            loading: true
        }, () => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.state.idGuia}/red/add/${this.state.redes.selected}`, {
                method: "POST",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({link: this.state.link})
            })
            .then(res => {
                if(res.ok && res.status === 201) {
                    this.findRedes();
                } else {
                    res.json().then((data) => {
                        this.setState({
                            loading: false
                        }, () => {
                            alert(data.errMsg);
                        });
                    });
                }
            });
        });
    }

    handleComboRedesChange = (event) => {
        this.setState({
            redes: {
                ...this.state.redes,
                selected: event.target.value
            }
        }, () => {
            console.log(this.state.redes);
        });
    }

    handleDeleteRed = (id, nombre) => {
        this.setState({
            modalRedes: {
                ...this.state.modalRedes,
                msg: `Seguro de eliminar ${nombre}?`,
                open: true
            },
            deleteId: id
        });
    }

    findRedes = () => {
        //Obtener las Redes Sociales
        let TodasLasRedes = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/redes`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        let config_redes = data.data.registros.map((red) => {
                            return {
                                id: red.id,
                                nombre: red.nombre,
                                visible: true
                            };
                        });
                        this.setState({
                            redes: {
                                data: config_redes,
                                selected: config_redes[0].id
                            }
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas la redes.");
                }
            });
        });
        //Obtener todas los redes de la guia
        let TodasLasRedesDeLaGuia = new Promise((resolve, reject) => {
            fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.props.idGuia}/redes`, {
                method: "GET",
                headers: {
                    "Authorization": localStorage.getItem("WebTurToken")
                }
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        this.setState({
                            redes_guia: data.data.registros
                        }, () => {
                            resolve("Ok");
                        });
                    });
                } else {
                    reject("Error al obtener todas las redes de la guia");
                }
            });
        });
        Promise.all([TodasLasRedes, TodasLasRedesDeLaGuia]).then(values => {
            //Ocultar del combo las redes que ya están cargadas y opcionalmente ocultar el menu
            //menu_add
            if(this.state.redes_guia.length) {
                let id_visible = false;
                let redes_style = this.state.redes.data.map((red) => {
                    let x = this.state.redes_guia.findIndex((e) => {
                        if(red.id === e.idred) {
                            return true;
                        } else {
                            return false;
                        }
                    });
                    if(x > -1) {
                        return {...red, visible: false}
                    } else {
                        if(id_visible === false) {
                            id_visible = red.id;
                        }
                        return red;
                    }
                });
                if(id_visible) {
                    this.setState({
                        redes: {
                            data: redes_style,
                            selected: id_visible
                        }
                    });
                } else {
                    this.setState({menu_opt_sistema: false});
                }
            }
            this.setState({loading: false});
        });
    }

    componentDidMount() {
        this.findRedes();
    }

    render() {
        const loading = this.state.loading;
        const menu = this.state.menu;
        const menu_opt_sistema = this.state.menu_opt_sistema;
        const opciones = this.state.redes.data.map((r) => {
            return(
                r.visible
                ?
                <option key={`red-${r.id}`} value={r.id}>{r.nombre}</option>
                :
                ""
            );
        });
        const redes = this.state.redes_guia.map((rg) => {
            return(
                <span key={`RG-${rg.id}`} className="badge badge-pill badge-primary d-flex align-items-center">
                    <i className={`icon-social ${rg.icono}`}></i> <a className="social-link" href={rg.link} target="_blank"><strong className="mr-2">{rg.nombre}</strong></a>
                    {
                         menu
                         ?
                         <i className="fas fa-times-circle" onClick={this.handleDeleteRed.bind(this, rg.id, rg.nombre)}></i>
                         :
                         ""
                    }
                </span>
            );
        });
        return(
            <div className="Redes">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-4">
                        <Row>
                            <Col xs="12" md="12">
                                <div className="d-flex flex-column justify-content-start mb-3">
                                    <label>Redes Sociales</label>
                                    {
                                        menu && menu_opt_sistema
                                        ?
                                        <div className="row">
                                            <div className="col-xs-6 col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="idred">Red</label>
                                                    <select className="form-control mb-2" name="idred" id="idred" value={this.state.redes.Selected} onChange={this.handleComboRedesChange}>
                                                        {opciones}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="dweb">Web</label>
                                                    <div className="input-group">
                                                        <div className="input-group-prepend">
                                                            <span className="input-group-text">http://</span>
                                                        </div>
                                                        <input type="text" className="form-control" name="dweb" id="dweb" value={this.state.link} placeholder="Dirección Web" onChange={(e) => this.setState({link: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-6 col-md-1 d-flex justify-content-end align-items-center">
                                                <button type="button" className="btn btn-primary ml-2 mt-2" onClick={this.handleAddRed}><i className="fas fa-arrow-circle-down"></i></button>
                                            </div>
                                        </div>
                                        :
                                        ""
                                    }
                                    <hr />
                                    <div className="d-flex flex-wrap justify-content-start">
                                        {redes}
                                    </div>
                                    {
                                        this.state.advertencia
                                        ?
                                        <div className="alert alert-warning mt-4" role="alert">
                                            Advertencia!: Los cambios realizados a las redes sociales se guardan automáticamente!.
                                        </div>
                                        :
                                        ""
                                    }
                                </div>
                            </Col>
                        </Row>
                        <ModalMsg open={this.state.modalRedes.open} titulo="Redes Sociales" msg={this.state.modalRedes.msg} onlyOk={this.state.modalRedes.onlyOk} handleAceptar={this.handleRedesMsgOk} handleCancelar={this.handleRedesMsgClose} />
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
                    .icon-social {
                        margin-right: 8px;
                    }
                    .social-link {
                        text-decoration: none;
                        color: #fff;
                    }
                    @media only screen and (max-width: 575px) {
                        .flex-xs-column {
                            flex-direction: column;
                        }
                    }
                `}</style>
            </div>
        );
    }
}

export default Redes;