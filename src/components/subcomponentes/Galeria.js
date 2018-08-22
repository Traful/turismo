import React, { Component } from "react";
import Loading from "../../utils/loading";
import { Row, Col, Card, Button, CardImg, CardImgOverlay, Input } from "reactstrap";
import ModalMsg from "../../utils/ModalMsg";

class Galeria extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            idGoG: 0,
            idGaleria: 0,
            galeria: [],
            modal: {
                idDelete: 0,
                msg: "",
                open: false,
                onlyOk: false
            }
        };
        this.findGalery = this.findGalery.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleImgChange = this.handleImgChange.bind(this);
    }

    handleImgChange = (event) => {
        const data = new FormData();
        data.append("imgup", event.target.files[0]);
        fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/imagen/${this.state.idGoG}/${this.state.idGaleria}`, {
            method: "POST",
            headers: {
                "Authorization": localStorage.getItem("WebTurToken"),
                //"Content-Type": "multipart/form-data"
            },
            body: data
        })
        .then(res => {
            if(res.ok && res.status === 201) {
                this.setState({
                    loading: true
                }, () => {
                    this.findGalery();
                });
            }
        });
    }

    handleCancel = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                open: false
            }
        });
    }

    handleDelete = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                open: false
            }
        });
        //alert(`Eliminar: ${this.state.modal.idDelete}`);
        fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/imagen/${this.state.modal.idDelete}`, {
            method: "DELETE",
			headers: {
				"Authorization": localStorage.getItem("WebTurToken")
			}
        })
        .then(res => {
            if(res.ok && res.status === 200) {
                this.setState({
                    loading: true
                }, () => {
                    this.findGalery();
                });
            } else {
                res.json().then((data) => {
                    alert(data.errMsg);
                });
            }
        });
    }

    askDelete = (id, imagen, e) => {
        this.setState({
            modal: {
                ...this.state.modal,
                idDelete: id,
                msg: `Seguro de eliminar la imagen? (${imagen})`,
                open: true
            }
        });
    }

    findGalery = () => {
        fetch(`${process.env.REACT_APP_URL_API_SERVER_2}/guia/${this.props.idGaleria}/imagenes`)
        .then(res => {
            if(res.ok && res.status === 200) {
                res.json().then((data) => {
                    this.setState({
                        galeria: data.data.registros,
                        idGoG: this.props.idGoG,
                        idGaleria: this.props.idGaleria,
                        loading: false
                    });
                });
            }
        });
    }

    componentDidMount() {
        //Obtener la Galeria
        this.findGalery();
    }

    render() {
        const loading = this.state.loading;
        const galeria = this.state.galeria.map((g) => {
            return(
                <Col xs="6" md="3" key={`g-${g.id}`}>
                    <Card inverse className="mb-4">
                        <CardImg width="100%" className="img-card" src={`${process.env.REACT_APP_URL_API_SERVER_2}/imagenes/${g.imagen}`} alt="Img" />
                        <CardImgOverlay>
                            <Button className="close bg-dark p-2 rounded" aria-label="Close" onClick={(e) => this.askDelete(g.id, g.imagen, e)}>
                                <span aria-hidden="true">&times;</span>
                            </Button>
                        </CardImgOverlay>
                    </Card>
                </Col>
            );
        });
        return(
            <div className="Galeria">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-4">
                        <Row>
                            <Col xs="12" md="12">
                                <div className="d-flex justify-content-start mb-3">
                                    <Input id="uploadImage" name="uploadImage" type="file" className="d-none" accept="image/*" onChange={this.handleImgChange} />
                                    <Button color="primary" onClick={(e) => {document.getElementById("uploadImage").click()}}><i className="fas fa-camera"></i></Button>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            {galeria}
                        </Row>
                        <Row>
                            <Col xs="12" md="12">
                                <div className="alert alert-warning mt-4" role="alert">
                                    Advertencia!: Los cambios realizados a la galería de imágenes se guardan automáticamente!.
                                </div>
                            </Col>
                        </Row>
                    </div>
                }
                <ModalMsg open={this.state.modal.open} titulo="Eliminar" msg={this.state.modal.msg} onlyOk={this.state.modal.onlyOk} handleAceptar={this.handleDelete} handleCancelar={this.handleCancel} />
                <style jsx="true">{`
                    .card-img-ovelay {
                        padding: 5px;
                    }
                    .card-img {
                        height: 200px;
                    }
                    @media only screen and (max-width: 990px) {
                        .card-img {
                            height: 100px;
                        }
                    }
                    @media only screen and (max-width: 778px) {
                        .card-img {
                            height: 200px;
                        }
                    }
                    @media only screen and (max-width: 400px) {
                        .card-img {
                            height: 130px;
                        }
                    }
                `}</style>
            </div>
        );
    }
}

export default Galeria;