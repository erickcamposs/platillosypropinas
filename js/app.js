//**** Selector ****//
const btnGuardarCliente = document.querySelector('#guardar-cliente');

//**** Variables Globales ****//
let cliente = {
    mesa: '',
    hora: '',
    pedido: []
}
const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

//**** Cargar Evento ****//
window.onload = function(){
    btnGuardarCliente.addEventListener('click', validarFormulario);
}

//****  Funciones ****//

function validarFormulario(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //Validacion de formulario
    const camposLlenos = [mesa, hora].some(valor => valor === '');

    if(camposLlenos){
        imprimirAlerta('Ambos campos son obligatorios...');
        return;
    }
    //Agregar la mesa y la hora a el objeto de cliente
    cliente = {...cliente, mesa, hora};

    //Cerrar la ventana modal por medio de una instancia de BootStrap
    const formulario = document.querySelector('#formulario');
    const modalBootStrap = bootstrap.Modal.getInstance(formulario);
    modalBootStrap.hide(); 

    //Mostrar Secciones
    mostrarSecciones();

    //Consultar API
    consultarAPI();
}

function consultarAPI(){
    const url = '../bd.json';

    fetch(url)
        .then(resolve => resolve.json())
        .then(respuesta => mostrarAPI(respuesta['platillos']))
        .catch(error => console.log(error))
}

function mostrarAPI(platillos){
    //Selector del contenido en donde se van a inyectar los valores
    const contenido = document.querySelector('#platillos .contenido');

    platillos.forEach( plato => {
        const { nombre, precio, id, categoria } = plato;

        const row = document.createElement('DIV');
        row.classList.add('row', 'py-2', 'border-top');

        //**** Scripting Platillos ****//
        const nombrePlatillo = document.createElement('DIV');
        nombrePlatillo.textContent = nombre;
        nombrePlatillo.classList.add('col-md-4');

        const precioPlatillo = document.createElement('DIV');
        precioPlatillo.textContent = `$ ${precio}`;
        precioPlatillo.classList.add('col-md-3', 'fw-bold', 'text-center');

        const categoriaPlatillo = document.createElement('DIV');
        categoriaPlatillo.textContent = categorias[categoria];
        categoriaPlatillo.classList.add('col-md-3', 'text-center');

        const botonInput = document.createElement('INPUT');
        botonInput.type = 'number';
        botonInput.value = 0;
        botonInput.min = 0;
        botonInput.id = `producto-${id}`;
        botonInput.classList.add('form-control');

        //Función para agregar el resumen de platillos consumidos
        botonInput.onclick = function(){
            const cantidad = parseInt(botonInput.value);
            agregarResumen({...plato, cantidad});
        }

        //Agregamos boton a un div
        const agregar = document.createElement('DIV');
        agregar.classList.add('col-md-2')
        agregar.appendChild(botonInput);

         //Agregar al ROW
         row.appendChild(nombrePlatillo);
         row.appendChild(precioPlatillo);
         row.appendChild(categoriaPlatillo);
         row.appendChild(agregar);
 
         //Agregar al HTML
         contenido.appendChild(row);
    })
}

function agregarResumen(plato){
    const { pedido } = cliente;

    if(plato.cantidad > 0){
        //Conocer si ya existe el plato que vamos a insertar en el arreglo
        const platoExistente = pedido.some(articulo => articulo.id === plato.id);
        if(platoExistente){
            const platoNUevo = pedido.map(articulo => {
                if(articulo.id === plato.id){
                    articulo.cantidad = plato.cantidad;
                }
                return articulo;
            })
            cliente.pedido = [...platoNUevo];
        }else{
            cliente.pedido = [...pedido, plato];
        }
        
    }else{
        //Eliminar del Arreglo
        const platoEliminado = pedido.filter(articulo => articulo.id !== plato.id);
        cliente.pedido = [...platoEliminado];
    }
    
    const contenido = document.querySelector('#resumen .contenido');
    limpiarHTML(contenido);

    if(cliente.pedido.length){
        //Mostrar HTML
        mostrarPlatillos();
    }else{
        mostrarMensajeVacio();
    }
}

function mostrarPlatillos(){
    const contenido = document.querySelector('#resumen .contenido');

    //**** Card de Resumen de Consumo
    const resumen = document.createElement('DIV');
    resumen.classList.add('col-md-6', 'card', 'py-4', 'px-2', 'shadow');

    limpiarHTML(contenido);

    //**** Titulo de la seccion
    const heading = document.createElement('H3');
    heading.textContent = 'Platillos Consumidos';
    heading.classList.add('my-4', 'text-center');

    //**** Mesa
    const mesa = document.createElement('P');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');
    const mesaSpan = document.createElement('SPAN');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');

    //**** Hora
    const hora = document.createElement('P');
    hora.textContent = 'Hora: ';
    hora.classList.add('fw-bold');
    const horaSpan = document.createElement('SPAN');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');

    //Agregar el SPAN al P
    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //Creamos el GRUPO de los platillos consumidos
    const grupo = document.createElement('UL');
    grupo.classList.add('list-group');

    //Iterar sobre el array para mostrar los platos consumidos
    const { pedido } = cliente;
    pedido.forEach(articulo => {
        const {nombre, cantidad, precio, id} = articulo;
        //**** LI
        const lista = document.createElement('LI');
        lista.classList.add('list-group-item'); 

        //**** Nombre
        const nombreEl = document.createElement('H4');
        nombreEl.classList.add('my-3');
        nombreEl.textContent = nombre;

        //**** ROW
        const row = document.createElement('DIV');
        row.classList.add('row');

        //**** Cantidad
        const cantidadEl = document.createElement('P');
        cantidadEl.classList.add('my-3', 'fw-bold', 'col-md-6', 'text-center');
        cantidadEl.textContent = 'Cantidad: ';
        const cantidadValor = document.createElement('SPAN');
        cantidadValor.classList.add('my-3', 'fw-normal');
        cantidadValor.textContent = cantidad;

        //**** Precio
        const precioEl = document.createElement('P');
        precioEl.classList.add('my-3', 'fw-bold', 'col-md-6', 'text-center');
        precioEl.textContent = 'Precio: $ ';
        const precioValor = document.createElement('SPAN');
        precioValor.classList.add('my-3', 'fw-normal');
        precioValor.textContent = precio;

        //**** Subtotal
        const subtotalEl = document.createElement('P');
        subtotalEl.classList.add('my-3', 'fw-bold');
        subtotalEl.textContent = 'Subtotal: $ ';
        const subtotalValor = document.createElement('SPAN');
        subtotalValor.classList.add('my-3', 'fw-normal');
        subtotalValor.textContent = calcularSubtotal(precio, cantidad);

        //****Boton Eliminar
        const btnEliminar = document.createElement('BUTTON');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del Pedido';

        btnEliminar.onclick = function(){
            eliminarPedido(id);
        }


        //****Agregar el Span al P
        cantidadEl.appendChild(cantidadValor);
        precioEl.appendChild(precioValor);
        subtotalEl.appendChild(subtotalValor);

        //**** Agregar al row
        row.appendChild(nombreEl);
        row.appendChild(cantidadEl);
        row.appendChild(precioEl);

        //**** Agregar a la Lista
        lista.appendChild(row);
        lista.appendChild(subtotalEl);
        lista.appendChild(btnEliminar);

        //**** Agregar al grupo
        grupo.appendChild(lista);
    });

    //Agregar el P,H3 al DIV de Resumen
    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    //Agregar al HTML
    contenido.appendChild(resumen);

    //**** Card de Propinas
    mostrarPropinas();

}
function eliminarPedido(id){
    const contenido = document.querySelector('#resumen .contenido');
    const { pedido } = cliente;
    //Eliminar del Arreglo
    const platoEliminado = pedido.filter(articulo => articulo.id !== id);
    cliente.pedido = [...platoEliminado];

    limpiarHTML(contenido);

    if(cliente.pedido.length){
        //Mostrar HTML
        mostrarPlatillos();
    }else{
        mostrarMensajeVacio();
    }

    //**** Seleccionar INPUT con el ID
    const idInput = `#producto-${id}`;
    const buttonInput = document.querySelector(idInput);
    buttonInput.value = 0;

}

function mostrarPropinas(){
    const contenido = document.querySelector('#resumen .contenido');

    //**** Card de Propinas Padre (COL-GRID)
    const propinas = document.createElement('DIV');
    propinas.classList.add('col-md-6', 'formulario');

    //**** Card de Propinas
    const divPropinas = document.createElement('DIV');
    divPropinas.classList.add('card', 'py-4', 'px-2', 'shadow', 'propi');

    //**** Heading de Propinas
    const heading = document.createElement('H3');
    heading.textContent = 'Propinas';
    heading.classList.add('text-center', 'my-4');

    //**** Radio Button 10%
    const radio10 = document.createElement('INPUT') ;
    radio10.type = 'radio';
    radio10.value = '10';
    radio10.name = 'propina';
    radio10.classList.add('form-check-input')
    radio10.onclick = calcularTotal;

    const radio10Label = document.createElement('LABEL');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('DIV');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10Label);
    radio10Div.appendChild(radio10);

    //**** Radio Buttons 20%
    const radio20 = document.createElement('INPUT');
    radio20.type = 'radio';
    radio20.name = 'propina';
    radio20.value = '20';
    radio20.classList.add('form-check-input');
    radio20.onclick = calcularTotal;

    const radio20Label = document.createElement('LABEL');
    radio20Label.textContent = '20%';
    radio20Label.classList.add('form-check-label');

    const radio20Div = document.createElement('DIV');
    radio20Div.classList.add('form-check');

    radio20Div.appendChild(radio20Label);
    radio20Div.appendChild(radio20);

    //**** Radio Buttons 30%
    const radio30 = document.createElement('INPUT');
    radio30.type = 'radio';
    radio30.name = 'propina';
    radio30.value = '30';
    radio30.classList.add('form-check-input');
    radio30.onclick = calcularTotal;

    const radio30Label = document.createElement('LABEL');
    radio30Label.textContent = '30%';
    radio30Label.classList.add('form-check-label');

    const radio30Div = document.createElement('DIV');
    radio30Div.classList.add('form-check');

    radio30Div.appendChild(radio30Label);
    radio30Div.appendChild(radio30);

    //**** Radio Buttons 50%
    const radio50 = document.createElement('INPUT');
    radio50.type = 'radio';
    radio50.name = 'propina';
    radio50.value = '50';
    radio50.classList.add('form-check-input');
    radio50.onclick = calcularTotal;

    const radio50Label = document.createElement('LABEL');
    radio50Label.textContent = '50%';
    radio50Label.classList.add('form-check-label');

    const radio50Div = document.createElement('DIV');
    radio50Div.classList.add('form-check');

    radio50Div.appendChild(radio50Label);
    radio50Div.appendChild(radio50);


    //**** Agregar el radio button divPropinas
    divPropinas.appendChild(heading);
    divPropinas.appendChild(radio10Div);
    divPropinas.appendChild(radio20Div);
    divPropinas.appendChild(radio30Div);
    divPropinas.appendChild(radio50Div);

    //**** Agregar el divPropinas a el card padre
    propinas.appendChild(divPropinas);

    //**** Agregar el div de Propinas al HTML
    contenido.appendChild(propinas);
}

function calcularTotal(){
    const { pedido } = cliente;
    const subtotal = pedido.reduce((total, articulo) => {
        return total + articulo.cantidad * articulo.precio;
    }, 0)
    
    //Seleccionar el input activo (checked) y su valor
    const inputActivo = document.querySelector('[name = "propina"]:checked').value;
    const porcentaje = parseInt(inputActivo);

    const propinas = (subtotal * porcentaje) / 100;
    
    const total = subtotal + propinas;

    mostrarTotal(subtotal, propinas, total);
}

function mostrarTotal(subtotals, propina, total){
    const formulario = document.querySelector('.formulario > div');
    const divTotal = document.createElement('DIV');
    divTotal.classList.add('total-pagar');

    //****Mostrar Subtotal en el HTML
    const subtotal = document.createElement('P');
    subtotal.classList.add('fw-bold', 'fs-5', 'mt-3');
    subtotal.textContent = 'Subtotal: $ '
    const subtotalValor = document.createElement('SPAN');
    subtotalValor.classList.add('fw-normal');
    subtotalValor.textContent = subtotals;
    subtotal.appendChild(subtotalValor);
 
    //****Mostrar Propina en el HTML
    const propinaE = document.createElement('P');
    propinaE.classList.add('fw-bold', 'fs-5', 'mt-2');
    propinaE.textContent = 'Propina: $ '
    const propinaValor = document.createElement('SPAN');
    propinaValor.classList.add('fw-normal');
    propinaValor.textContent = propina;
    propinaE.appendChild(propinaValor);
 
    //****Mostrar total en el HTML
    const totalFinal = document.createElement('P');
    totalFinal.classList.add('fw-bold', 'fs-3', 'mt-5');
    totalFinal.textContent = 'Total: $ '
    const totalFinalValor = document.createElement('SPAN');
    totalFinalValor.classList.add('fw-normal', 'text-danger');
    totalFinalValor.textContent = total;
    totalFinal.appendChild(totalFinalValor);

    //****Eliminar el HTML previo del TOTAL
    const totales = document.querySelector('.total-pagar');
    if(totales){
        totales.remove();
    }

    divTotal.appendChild(subtotal);
    divTotal.appendChild(propinaE);
    divTotal.appendChild(totalFinal);

    formulario.appendChild(divTotal);

}

//**** Funciones Complementarias ****//
function calcularSubtotal(precio, cantidad){
    return `${precio * cantidad}`;
}

function mostrarSecciones(){
    const secciones = document.querySelectorAll('.d-none');
    
    secciones.forEach(seccion => {
        seccion.classList.remove('d-none');
    })
}

function mostrarMensajeVacio(){
    const contenido = document.querySelector('#resumen .contenido');
    
    const mensaje = document.createElement('P');
    mensaje.classList.add('text-center');
    mensaje.textContent = 'Añade los elementos del pedido... :D';

    contenido.appendChild(mensaje);
}

function imprimirAlerta(mensaje){
    const error = document.querySelector('.invalid-feedback');
    const contenido = document.querySelector('.modal-body');
    if(!error){
        const div = document.createElement('DIV');
        div.textContent = mensaje;
        div.classList.add('invalid-feedback', 'd-block', 'text-center');
        contenido.appendChild(div);

        setTimeout(() => {
            div.remove();
        }, 2000);
    }
}

function limpiarHTML(div){
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
}