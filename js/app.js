// Variables y selectores
const formulario = document.querySelector('#agregar-gasto');
const gastoListado = document.querySelector('#gastos ul');

// Eventos
eventListeners();
function eventListeners(){
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto );

    formulario.addEventListener('submit', agregarGasto)
}


// Clases
class Presupuesto{
    constructor(presupuesto){
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto){
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce( (total, gasto) => total + gasto.cantidad, 0 );
        this.restante = this.presupuesto - gastado;
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id !== id);
        this.calcularRestante();
    }
}

class UI{
    insertarPresupuesto( cantidad ){
        // Realizar desestructuración del objeto 
        const { presupuesto, restante } = cantidad;
        // Se agrega al html
        document.querySelector('#total').textContent = presupuesto;
        document.querySelector('#restante').textContent = restante;
    }

    imprimirAlerta(mensaje, tipo){
        // Comprobar si la alerta ya ha sido creada
        const alerta = document.querySelector('#alert');
        if(alerta){
            alerta.remove();
        }

        // Crear alerta
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');
        divMensaje.id = 'alert';

        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        } else {
            divMensaje.classList.add('alert-success');
        } 
        
        // Mensaje de error
        divMensaje.textContent = mensaje;

        // Insertar en el html
        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        // quitar la alerta
        setTimeout(() => {
            divMensaje.remove()
        }, 3500);
    }

    mostrarGastos(gastos){ 
        // Limpia el HTML previo
        this.limpiarHTML();
        // Iterar sobre los gastos 
        gastos.forEach( gasto => {
            const { nombre, cantidad, id } = gasto;
            // Crear un LI
            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list-group-item d-flex justify-content-between align-items-center';
            nuevoGasto.dataset.id = id;
            
            // Agregar el HTML del gasto
            nuevoGasto.innerHTML = `<strong>${nombre}</strong> <span class="badge badge-primary badge-pill"> $${cantidad} </span>`;
            
            // Botón para borrar el gasto 
            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-danger', 'borrar-gasto');
            btnBorrar.innerHTML = 'Borrar &times;';
            btnBorrar.onclick = () => {
                eliminarGasto(id);
            }
            nuevoGasto.appendChild(btnBorrar);
            
            // Agregar el HTML
            gastoListado.appendChild(nuevoGasto);
            
        })
    }
    
    limpiarHTML(){
        while(gastoListado.firstChild){
            gastoListado.removeChild(gastoListado.firstChild);
        }
    }

    actualizarRestante(restante){
        document.querySelector('#restante').textContent = restante;
    }

    comprobarPresupuesto(presupuestObj){
        // Desestructura las propiedades que se requieren del objeto
        const { presupuesto, restante } = presupuestObj;
        const restanteUi = document.querySelector('.restante');

        // calculo del porcentaje restante del dinero
        let porcentajeRestante = (restante / presupuesto) * 100;

        // verificación del porcentaje
        if( porcentajeRestante <= 25 ){
            restanteUi.classList.remove('alert-warning', 'alert-success');
            restanteUi.classList.add('alert-danger');
        } else if ( porcentajeRestante <= 50 ){
            restanteUi.classList.remove('alert-success', 'alert-danger');
            restanteUi.classList.add('alert-warning');
        } else {
            restanteUi.classList.add('alert-success');
            restanteUi.classList.remove('alert-danger', 'alert-warning');
        }

        // Si el total es 0 o menor 
        if( restante <= 0 ){
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            // Prevenir que se introduzca mas información
            formulario.querySelector('button[type="submit"]').disable = true;
        }
    }
}

// Instancias 
const ui = new UI();
let presupuesto;

// Funciones
function preguntarPresupuesto(){
    // Recibir el presupuesto del usuario
    const presupuestoUsuario = prompt('¿Cuál es tu presupuesto?');

    // Comprobar que sea un tipo de dato adecuado 
    if(presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ){
        window.location.reload();
    }

    // Presupuesto valido 
    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto);
}

// Añadir gastos
function agregarGasto(e) {
    e.preventDefault();

    // Leer los datos del formulario
    let nombre = document.querySelector('#gasto').value;
    let cantidad = document.querySelector('#cantidad').value;   

    // Validar 
    if(nombre === '' || cantidad === ''){
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
        return;
    } else if ( cantidad <= 0 || isNaN(cantidad)){
        ui.imprimirAlerta('La cantidad debe ser un valor numérico y debe ser mayor a 0', 'error');
        return;
    }

    // convertir la cantidad a numérico
    cantidad = Number(cantidad);

    // Generar un objeto con el gasto 
    const gasto = { nombre, cantidad, id: Date.now() };

    // Añade un nuevo gasto 
    presupuesto.nuevoGasto(gasto);
    ui.imprimirAlerta('Gasto agregado correctamente');

    // Imprimir los gastos
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos( gastos );

    //  Se pasa información sobre el valor restante
    ui.actualizarRestante(restante);

    ui.comprobarPresupuesto(presupuesto);

    // Restablecer el formulario
    formulario.reset();
}

function eliminarGasto(id){
    // Elimina del objeto
    presupuesto.eliminarGasto(id);

    // Elimina los gastos del HTML
    const { gastos, restante } = presupuesto;
    ui.mostrarGastos( gastos )
    ui.actualizarRestante(restante);
    ui.comprobarPresupuesto(presupuesto);
}


