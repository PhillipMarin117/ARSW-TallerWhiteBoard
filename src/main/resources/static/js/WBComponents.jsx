// Retorna la url del servicio. Es una función de configuración.
// La url de contacto del service
function BBServiceURL() {
    var host = window.location.host;
    // heroku wss local ws
    var url = 'wss://' + (host) + '/bbService';
    console.log("URL Calculada: " + url);
    return url;
}

//web socket
class WSBBChannel {
    constructor(URL, callback) {// call back para el canvas
        this.URL = URL;
        this.wsocket = new WebSocket(URL);
        this.wsocket.onopen = (evt) => this.onOpen(evt);
        this.wsocket.onmessage = (evt) => this.onMessage(evt);
        this.wsocket.onerror = (evt) => this.onError(evt);
        this.receivef = callback;
    }

    //Cuando se abre
    onOpen(evt) {
        console.log("In onOpen", evt);
    }
    //Cuando llega un mensaje (recibe puntos)
    onMessage(evt) {
        console.log("In onMessage", evt);
        // Este if permite que el primer mensaje del servidor no se tenga en cuenta.
        // El primer mensaje solo confirma que se estableció la conexión.
        // De ahí en adelante intercambiaremos solo puntos(x,y) con el servidor
        if (evt.data != "Connection established.") {
            this.receivef(evt.data);
        }
    }
    // Manda el error en la consola
    onError(evt) {
        console.error("In onError", evt);
    }
    // envia datos (puntos)
    send(x, y) {
        let msg = '{ "x": ' + (x) + ', "y": ' + (y) + "}";
        console.log("sending: ", msg);
        this.wsocket.send(msg);
    }


}

/*Crea el canvas del proyecto */
class BBCanvas extends React.Component {
    constructor(props) { //Constructor
        super(props);
        // Crea una instancia del canal
        this.comunicationWS =
                new WSBBChannel(BBServiceURL(),
                        (msg) => {
                    var obj = JSON.parse(msg);
                    console.log("On func call back ", msg);
                    this.drawPoint(obj.x, obj.y);
                });
        this.myp5 = null; // Libreria de p5
        this.state = {loadingState: 'Loading Canvas ...'} // Estado del canvas
        let wsreference = this.comunicationWS; // referencia al mismo objeto para crear la funcion para que el servidor no se confunda
        // Dibuja los puntos
        this.sketch = function (p) {
            let x = 100;
            let y = 100;
            p.setup = function () {
                p.createCanvas(700, 410);
            };
            p.draw = function () {
                if (p.mouseIsPressed === true) {
                    p.fill(0, 0, 0);
                    p.ellipse(p.mouseX, p.mouseY, 20, 20);
                    wsreference.send(p.mouseX, p.mouseY);
                }
                if (p.mouseIsPressed === false) {
                    p.fill(255, 255, 255);
                }
            };
        }
    }

    drawPoint(x, y) {
        this.myp5.ellipse(x, y, 20, 20);
    }

    componentDidMount() {
        this.myp5 = new p5(this.sketch, 'container'); // crea el container
        this.setState({loadingState: 'Canvas Loaded'}); // cambio el estado y vuelva a renderizar
    }

    render()
    {
        return(
                <div>
                    <h4>Drawing status: {this.state.loadingState}</h4>
                </div>);
    }
}

class Editor extends React.Component {
    render() {
        return (
                <div>
                    <h1>Hello, {this.props.name}</h1>
                    <hr/>
                    <div id="toolstatus"></div>
                    <hr/>
                    <div id="container"></div>
                    <BBCanvas/>
                    <hr/>
                    <div id="info"></div>
                    <hr/>

                </div>
                );
    }
}

ReactDOM.render(
        <Editor name="Felipe"/>,
        document.getElementById('root')
        );