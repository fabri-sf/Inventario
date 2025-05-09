// Estructura de datos del sistema
// {
//     inventarios: {
//         "inventario1": {
//             nombre: "Inventario Enero 2025",
//             secciones: {
//                 "seccion1": {
//                     nombre: "Dormitorio 1",
//                     articulos: [
//                         {
//                             id: "uuid",
//                             nombre: "Cama matrimonial",
//                             cantidad: 1,
//                             estado: "Bueno",
//                             descripcion: "Cama de madera con colchón",
//                             imagen: "data:image/jpeg;base64,..."
//                         }
//                     ]
//                 }
//             }
//         }
//     },
//     inventarioActual: "inventario1"
// }

// Funciones de utilidad
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function guardarDatos(datos) {
    localStorage.setItem('sistemaInventario', JSON.stringify(datos));
}

function cargarDatos() {
    const datos = localStorage.getItem('sistemaInventario');
    return datos ? JSON.parse(datos) : { inventarios: {}, inventarioActual: null };
}

// Variables globales
let datosApp = cargarDatos();

// Elementos DOM
const periodoSelect = document.getElementById('periodo');
const nuevoPeriodoNombre = document.getElementById('nuevo-periodo-nombre');
const crearPeriodoBtn = document.getElementById('crear-periodo');
const seccionSelect = document.getElementById('seccion');
const nuevaSeccionNombre = document.getElementById('nueva-seccion-nombre');
const crearSeccionBtn = document.getElementById('crear-seccion');
const filtroSeccionSelect = document.getElementById('filtro-seccion');
const inventarioItems = document.getElementById('inventario-items');
const inventarioTitulo = document.getElementById('inventario-titulo');

const nombreArticuloInput = document.getElementById('nombre');
const cantidadArticuloInput = document.getElementById('cantidad');
const estadoArticuloSelect = document.getElementById('estado');
const descripcionArticuloInput = document.getElementById('descripcion');
const imagenArticuloInput = document.getElementById('imagen');
const imagenPreview = document.getElementById('imagen-preview');
const agregarArticuloBtn = document.getElementById('agregar-articulo');
const generarPdfBtn = document.getElementById('generar-pdf');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    cargarInventarios();
    actualizarInterfaz();
    
    // Event listeners
    crearPeriodoBtn.addEventListener('click', crearInventario);
    crearSeccionBtn.addEventListener('click', crearSeccion);
    periodoSelect.addEventListener('change', cambiarInventarioActual);
    seccionSelect.addEventListener('change', seleccionarSeccion);
    filtroSeccionSelect.addEventListener('change', filtrarArticulosPorSeccion);
    agregarArticuloBtn.addEventListener('click', agregarArticulo);
    generarPdfBtn.addEventListener('click', generarPDF);
    
    // Manejo de imagen
    imagenArticuloInput.addEventListener('change', previsualizarImagen);
});

// Funciones principales
function cargarInventarios() {
    periodoSelect.innerHTML = '<option value="">-- Crear Nuevo Inventario --</option>';
    
    const inventarios = Object.entries(datosApp.inventarios);
    inventarios.forEach(([id, inventario]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = inventario.nombre;
        periodoSelect.appendChild(option);
    });
    
    if (datosApp.inventarioActual && datosApp.inventarios[datosApp.inventarioActual]) {
        periodoSelect.value = datosApp.inventarioActual;
    }
}

function actualizarInterfaz() {
    const inventarioActual = datosApp.inventarioActual;
    
    // Actualizar estado de botones y campos
    nuevoPeriodoNombre.disabled = !!inventarioActual;
    crearPeriodoBtn.disabled = !!inventarioActual;
    
    // Reiniciar los selectores de sección
    seccionSelect.innerHTML = '<option value="">-- Seleccionar Sección --</option>';
    filtroSeccionSelect.innerHTML = '<option value="todas">Todas las secciones</option>';
    
    // Si hay un inventario activo
    if (inventarioActual && datosApp.inventarios[inventarioActual]) {
        const inventario = datosApp.inventarios[inventarioActual];
        
        // Actualizar título
        inventarioTitulo.textContent = `Inventario: ${inventario.nombre}`;
        
        // Cargar secciones
        cargarSecciones(inventario);
        
        // Mostrar artículos
        mostrarArticulos();
    } else {
        inventarioTitulo.textContent = 'Inventario';
        inventarioItems.innerHTML = '<p class="no-items">No hay un inventario seleccionado</p>';
    }
}

function cargarSecciones(inventario) {
    const secciones = Object.entries(inventario.secciones || {});
    
    secciones.forEach(([id, seccion]) => {
        // Agregar al selector de secciones para agregar artículos
        const optionSeccion = document.createElement('option');
        optionSeccion.value = id;
        optionSeccion.textContent = seccion.nombre;
        seccionSelect.appendChild(optionSeccion);
        
        // Agregar al filtro de secciones
        const optionFiltro = document.createElement('option');
        optionFiltro.value = id;
        optionFiltro.textContent = seccion.nombre;
        filtroSeccionSelect.appendChild(optionFiltro);
    });
}

function crearInventario() {
    const nombre = nuevoPeriodoNombre.value.trim();
    
    if (!nombre) {
        alert('Por favor, ingrese un nombre para el inventario.');
        return;
    }
    
    const inventarioId = generarId();
    datosApp.inventarios[inventarioId] = {
        nombre: nombre,
        secciones: {}
    };
    
    datosApp.inventarioActual = inventarioId;
    guardarDatos(datosApp);
    
    // Limpiar campo
    nuevoPeriodoNombre.value = '';
    
    // Actualizar interfaz
    cargarInventarios();
    actualizarInterfaz();
}

function cambiarInventarioActual() {
    const inventarioId = periodoSelect.value;
    
    if (inventarioId) {
        datosApp.inventarioActual = inventarioId;
    } else {
        datosApp.inventarioActual = null;
    }
    
    guardarDatos(datosApp);
    actualizarInterfaz();
}

function crearSeccion() {
    if (!datosApp.inventarioActual) {
        alert('Debe seleccionar o crear un inventario primero.');
        return;
    }
    
    const nombre = nuevaSeccionNombre.value.trim();
    
    if (!nombre) {
        alert('Por favor, ingrese un nombre para la sección.');
        return;
    }
    
    const seccionId = generarId();
    datosApp.inventarios[datosApp.inventarioActual].secciones[seccionId] = {
        nombre: nombre,
        articulos: []
    };
    
    guardarDatos(datosApp);
    
    // Limpiar campo
    nuevaSeccionNombre.value = '';
    
    // Actualizar interfaz
    actualizarInterfaz();
}

function seleccionarSeccion() {
    // Esta función se llama cuando el usuario selecciona una sección del desplegable
    // No necesita implementación específica ya que solo usamos el valor del select cuando se agrega un artículo
}

function previsualizarImagen(e) {
    const file = e.target.files[0];
    
    if (!file) {
        imagenPreview.innerHTML = '';
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        
        // Limpiar preview anterior
        imagenPreview.innerHTML = '';
        imagenPreview.appendChild(img);
    };
    
    reader.readAsDataURL(file);
}

function agregarArticulo() {
    if (!datosApp.inventarioActual) {
        alert('Debe seleccionar o crear un inventario primero.');
        return;
    }
    
    const seccionId = seccionSelect.value;
    
    if (!seccionId) {
        alert('Debe seleccionar una sección primero.');
        return;
    }
    
    const nombre = nombreArticuloInput.value.trim();
    const cantidad = parseInt(cantidadArticuloInput.value);
    const estado = estadoArticuloSelect.value;
    const descripcion = descripcionArticuloInput.value.trim();
    
    if (!nombre) {
        alert('Debe ingresar un nombre para el artículo.');
        return;
    }
    
    if (!cantidad || isNaN(cantidad) || cantidad < 1) {
        alert('La cantidad debe ser un número positivo.');
        return;
    }
    
    // Nuevo artículo
    const articulo = {
        id: generarId(),
        nombre: nombre,
        cantidad: cantidad,
        estado: estado,
        descripcion: descripcion,
        imagen: imagenPreview.innerHTML ? imagenPreview.querySelector('img').src : null
    };
    
    // Agregar a la sección correspondiente
    datosApp.inventarios[datosApp.inventarioActual].secciones[seccionId].articulos.push(articulo);
    guardarDatos(datosApp);
    
    // Limpiar formulario
    nombreArticuloInput.value = '';
    cantidadArticuloInput.value = '1';
    estadoArticuloSelect.value = 'Nuevo';
    descripcionArticuloInput.value = '';
    imagenArticuloInput.value = '';
    imagenPreview.innerHTML = '';
    
    // Actualizar vista
    mostrarArticulos();
}

function mostrarArticulos() {
    if (!datosApp.inventarioActual) {
        inventarioItems.innerHTML = '<p class="no-items">No hay un inventario seleccionado</p>';
        return;
    }
    
    const inventario = datosApp.inventarios[datosApp.inventarioActual];
    const seccionFiltro = filtroSeccionSelect.value;
    
    // Limpiar contenedor
    inventarioItems.innerHTML = '';
    
    // Array para almacenar todos los artículos
    let todosLosArticulos = [];
    
    // Si es "todas" o una sección específica
    if (seccionFiltro === 'todas') {
        // Recolectar todos los artículos de todas las secciones
        Object.entries(inventario.secciones).forEach(([seccionId, seccion]) => {
            seccion.articulos.forEach(articulo => {
                todosLosArticulos.push({...articulo, seccionId, seccionNombre: seccion.nombre});
            });
        });
    } else {
        // Solo artículos de la sección seleccionada
        const seccion = inventario.secciones[seccionFiltro];
        if (seccion) {
            seccion.articulos.forEach(articulo => {
                todosLosArticulos.push({...articulo, seccionId: seccionFiltro, seccionNombre: seccion.nombre});
            });
        }
    }
    
    // Mostrar mensaje si no hay artículos
    if (todosLosArticulos.length === 0) {
        inventarioItems.innerHTML = '<p class="no-items">No hay artículos en el inventario seleccionado</p>';
        return;
    }
    
    // Crear tarjeta para cada artículo
    todosLosArticulos.forEach(articulo => {
        const card = document.createElement('div');
        card.className = 'articulo-card';
        
        let cardHTML = `
            <div class="articulo-header">
                <h3>${articulo.nombre}</h3>
                <span class="estado-badge estado-${articulo.estado}">${articulo.estado}</span>
            </div>
            <div class="articulo-body">
                <span class="seccion-badge">${articulo.seccionNombre}</span>
                <div class="articulo-info">
                    <span class="articulo-label">Cantidad:</span>
                    <span class="articulo-value">${articulo.cantidad}</span>
                    ${articulo.descripcion ? `
                    <span class="articulo-label">Descripción:</span>
                    <span class="articulo-value">${articulo.descripcion}</span>
                    ` : ''}
                </div>
        `;
        
        // Agregar imagen si existe
        if (articulo.imagen) {
            cardHTML += `
                <div class="articulo-img-container">
                    <img src="${articulo.imagen}" alt="${articulo.nombre}" class="articulo-img">
                </div>
            `;
        }
        
        // Botones de acción
        cardHTML += `
                <div class="articulo-actions">
                    <button class="btn btn-danger" onclick="eliminarArticulo('${articulo.seccionId}', '${articulo.id}')">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        
        card.innerHTML = cardHTML;
        inventarioItems.appendChild(card);
    });
}

function eliminarArticulo(seccionId, articuloId) {
    if (!confirm('¿Está seguro de eliminar este artículo?')) {
        return;
    }
    
    const inventario = datosApp.inventarios[datosApp.inventarioActual];
    const seccion = inventario.secciones[seccionId];
    
    // Filtrar para eliminar el artículo
    seccion.articulos = seccion.articulos.filter(art => art.id !== articuloId);
    
    guardarDatos(datosApp);
    mostrarArticulos();
}

function filtrarArticulosPorSeccion() {
    mostrarArticulos();
}

function generarPDF() {
    if (!datosApp.inventarioActual) {
        alert('Debe seleccionar un inventario primero.');
        return;
    }
    
    const inventario = datosApp.inventarios[datosApp.inventarioActual];
    
    // Crear un contenedor temporal para el PDF
    const contenedorPDF = document.createElement('div');
    contenedorPDF.className = 'pdf-container';
    contenedorPDF.style.padding = '20px';
    contenedorPDF.style.maxWidth = '800px';
    contenedorPDF.style.margin = '0 auto';
    contenedorPDF.style.backgroundColor = 'white';
    
    // Título del PDF
    const titulo = document.createElement('h1');
    titulo.textContent = `Inventario: ${inventario.nombre}`;
    titulo.style.textAlign = 'center';
    titulo.style.marginBottom = '30px';
    titulo.style.color = '#003a4d';
    contenedorPDF.appendChild(titulo);
    
    // Fecha de generación
    const fechaGeneracion = document.createElement('p');
    fechaGeneracion.textContent = `Fecha de generación: ${new Date().toLocaleDateString()}`;
    fechaGeneracion.style.textAlign = 'right';
    fechaGeneracion.style.marginBottom = '20px';
    contenedorPDF.appendChild(fechaGeneracion);
    
    // Tabla de inventario
    const tabla = document.createElement('table');
    tabla.style.width = '100%';
    tabla.style.borderCollapse = 'collapse';
    tabla.style.marginBottom = '40px';
    
    // Encabezado de la tabla
    const encabezado = document.createElement('thead');
    encabezado.innerHTML = `
        <tr style="background-color: #003a4d; color: white;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Sección</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Artículo</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Cantidad</th>
            <th style="padding: 10px; text-align: center; border: 1px solid #ddd;">Estado</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Descripción</th>
        </tr>
    `;
    tabla.appendChild(encabezado);
    
    // Cuerpo de la tabla
    const cuerpo = document.createElement('tbody');
    
    // Array para almacenar todas las imágenes
    const imagenes = [];
    
    // Recorrer todas las secciones y artículos
    Object.entries(inventario.secciones).forEach(([seccionId, seccion]) => {
        seccion.articulos.forEach(articulo => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${seccion.nombre}</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${articulo.nombre}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${articulo.cantidad}</td>
                <td style="padding: 10px; text-align: center; border: 1px solid #ddd;">${articulo.estado}</td>
                <td style="padding: 10px; text-align: left; border: 1px solid #ddd;">${articulo.descripcion || ''}</td>
            `;
            cuerpo.appendChild(fila);
            
            // Guardar imagen si existe
            if (articulo.imagen) {
                imagenes.push({
                    nombre: articulo.nombre,
                    seccion: seccion.nombre,
                    imagenData: articulo.imagen
                });
            }
        });
    });
    
    tabla.appendChild(cuerpo);
    contenedorPDF.appendChild(tabla);
    
    // Sección de imágenes
    if (imagenes.length > 0) {
        const imagenesTitle = document.createElement('h2');
        imagenesTitle.textContent = 'Imágenes del Inventario';
        imagenesTitle.style.marginTop = '40px';
        imagenesTitle.style.marginBottom = '20px';
        imagenesTitle.style.color = '#003a4d';
        contenedorPDF.appendChild(imagenesTitle);
        
        const imagenesContainer = document.createElement('div');
        imagenesContainer.style.display = 'flex';
        imagenesContainer.style.flexWrap = 'wrap';
        imagenesContainer.style.gap = '20px';
        
        imagenes.forEach(img => {
            const imgContainer = document.createElement('div');
            imgContainer.style.width = '30%';
            imgContainer.style.marginBottom = '30px';
            imgContainer.style.border = '1px solid #ddd';
            imgContainer.style.padding = '10px';
            imgContainer.style.borderRadius = '5px';
            
            const imagen = document.createElement('img');
            imagen.src = img.imagenData;
            imagen.alt = img.nombre;
            imagen.style.width = '100%';
            imagen.style.height = 'auto';
            imagen.style.marginBottom = '10px';
            
            const nombreImg = document.createElement('p');
            nombreImg.textContent = `${img.nombre} (${img.seccion})`;
            nombreImg.style.textAlign = 'center';
            nombreImg.style.margin = '5px 0';
            nombreImg.style.fontWeight = 'bold';
            
            imgContainer.appendChild(imagen);
            imgContainer.appendChild(nombreImg);
            imagenesContainer.appendChild(imgContainer);
        });
        
        contenedorPDF.appendChild(imagenesContainer);
    }
    
    // Agregar a la página temporalmente
    document.body.appendChild(contenedorPDF);
    
    // Crear el PDF
    html2canvas(contenedorPDF).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        // Ajustar si la altura es mayor a una página
        let positionY = 0;
        const maxHeight = pdf.internal.pageSize.getHeight() - 10;  // margen inferior
        
        // Si la imagen es más alta que una página, dividirla en varias páginas
        if (pdfHeight > maxHeight) {
            const ratio = imgProps.width / canvas.width;
            const pageHeight = maxHeight;
            const canvasHeight = pageHeight / ratio;
            
            let totalHeight = canvas.height;
            let remainingHeight = totalHeight;
            let currentPosition = 0;
            
            while (remainingHeight > 0) {
                const tempCanvas = document.createElement('canvas');
                const tempContext = tempCanvas.getContext('2d');
                
                tempCanvas.width = canvas.width;
                const currentPageHeight = Math.min(canvasHeight, remainingHeight);
                tempCanvas.height = currentPageHeight;
                
                tempContext.drawImage(
                    canvas, 
                    0, 
                    currentPosition, 
                    canvas.width, 
                    currentPageHeight, 
                    0, 
                    0, 
                    canvas.width, 
                    currentPageHeight
                );
                
                const pageData = tempCanvas.toDataURL('image/png');
                
                if (currentPosition > 0) {
                    pdf.addPage();
                }
                
                pdf.addImage(pageData, 'PNG', 0, 0, pdfWidth, (currentPageHeight * pdfWidth) / canvas.width);
                
                remainingHeight -= currentPageHeight;
                currentPosition += currentPageHeight;
            }
        } else {
            // Si cabe en una página, simplemente agregar la imagen
            pdf.addImage(imgData, 'PNG', 0, positionY, pdfWidth, pdfHeight);
        }
        
        // Guardar el PDF
        pdf.save(`Inventario_${inventario.nombre.replace(/\s+/g, '_')}.pdf`);
        
        // Remover el contenedor temporal
        document.body.removeChild(contenedorPDF);
    });
}

// Función global para eliminar artículos (necesario para el evento onclick)
window.eliminarArticulo = eliminarArticulo;