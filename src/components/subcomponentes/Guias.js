import React, { Component } from "react";
import { Link } from "react-router-dom";
import Loading from "../../utils/loading";
import { Table, FormGroup, Label, Input } from "reactstrap";

class Guias extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            guias: [],
            filtro: ""
        };
        this.findGuias = this.findGuias.bind(this);
        this.handleFiltroChange = this.handleFiltroChange.bind(this);
    }

    handleFiltroChange = (event) => {
        let texto = event.target.value.toLowerCase();
        this.setState({filtro: texto});
        let buffer = this.state.guias.map((v) => {
            let inLegajo = v.legajo.toLowerCase().search(texto);
            let inNombre = v.nombre.toLowerCase().search(texto);
            if(inLegajo > -1 || inNombre > -1) {
                return {
                    id: v.id,
                    legajo: v.legajo,
                    nombre: v.nombre,
                    estilo: {display: "table-row"}
                }
            } else {
                return {
                    id: v.id,
                    legajo: v.legajo,
                    nombre: v.nombre,
                    estilo: {display: "none"}
                }
            }
        });
        this.setState({guias: buffer});
    }

    findGuias = (idCiudad) => {
        if(idCiudad === 0) {
            this.setState({
                loading: false,
                guias: []
            });
        } else {
            fetch(process.env.REACT_APP_URL_API_SERVER_2 + "/guias/ciudad/" + idCiudad, {
                headers: new Headers({
                    "Authorization": localStorage.getItem("WebTurToken")
                })
            })
            .then(res => {
                if(res.ok && res.status === 200) {
                    res.json().then((data) => {
                        let datos = data.data.registros.map((d) => {
                            return {
                                id: d.id,
                                legajo: d.legajo,
                                nombre: d.nombre,
                                estilo: {display: "table-row"}
                            }
                        });
                        this.setState({
                            loading: false,
                            guias: datos
                        });
                    });
                }
            });
        }
    }

    componentDidMount() {
        //Obtener todas las Guias de la Ciudad seleccionada
        if(this.props.idCiudad !== 0) {
            this.findGuias(this.props.idCiudad);
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.idCiudad !== prevProps.idCiudad) {
            this.setState({filtro: ""});
            this.findGuias(this.props.idCiudad);
        }
    }

    render() {
        const loading = this.state.loading;
        const guias = this.state.guias;
        return(
            <div className="Guias">
                {
                    loading ?
                    <Loading />
                    :
                    <div className="mb-2 rounded shadow p-2 bg-white">
                        <div>
                            <FormGroup>
                                <Label for="filtro">Filtrar</Label>
                                <Input type="text" name="filtro" id="filtro" placeholder="Buscar Legajo/Nombre" value={this.state.filtro} onChange={this.handleFiltroChange} />
                            </FormGroup>
                        </div>
                        <div className="table-responsive">
                            <Table bordered striped hover>
                                <caption>Listado de Guias</caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Legajo</th>
                                        <th scope="col">Nombre</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        guias.map((v) => {
                                            return (
                                                <tr key={v.id} style={v.estilo}>
                                                    <th scope="row">{v.legajo}</th>
                                                    <td>{v.nombre}</td>
                                                    <td style={{textAlign: "right"}}><Link to={"/guia/" + v.id}><i className="fas fa-search text-primary" style={{cursor: "pointer"}}></i></Link></td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </Table>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

export default Guias;