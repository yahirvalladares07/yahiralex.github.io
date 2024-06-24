document.addEventListener('DOMContentLoaded', async () => {
    const map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    class Evento {
        constructor(title, description, date, time, location, type, image) {
            this.title = title;
            this.description = description;
            this.date = date;
            this.time = time;
            this.location = location;
            this.type = type;
            this.image = image;
        }
    }

    async function cargarEventos() {
        try {
            const response = await fetch('../data/events.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar los eventos');
            }
            const eventos = await response.json();
            return eventos.map(evento => new Evento(
                evento.title,
                evento.description,
                evento.date,
                evento.time,
                evento.location,
                evento.type,
                evento.image
            ));
        } catch (error) {
            console.error('Error al cargar eventos:', error);
            return [];
        }
    }

    async function mostrarEventosEnMapa(eventos) {
        eventos.forEach(evento => {
            const marker = L.marker([evento.location.lat, evento.location.lng]).addTo(map);
            
            const popupContent = `
                <img src="${evento.image}" alt="${evento.title}" style="max-width: 200px;">
            `;
    
            marker.bindPopup(popupContent);
    
            marker.on('click', () => {
                showEventDetails(evento);
            });
        });
    }

    async function mostrarListaEventos(eventos = null, filtroTipo = null) {
        if (!eventos) {
            eventos = await cargarEventos();
        }
        const eventListElement = document.getElementById('event-list');
        if (!eventListElement) {
            console.error('Elemento #event-list no encontrado en el DOM.');
            return;
        }
        eventListElement.innerHTML = '';

        let eventosFiltrados = eventos;
        if (filtroTipo) {
            eventosFiltrados = eventos.filter(evento => evento.type === filtroTipo);
        }

        eventosFiltrados.forEach(evento => {
            const listItem = document.createElement('div');
            listItem.classList.add('event-item');
            listItem.innerHTML = `
                <h3>${evento.title}</h3>
                <p><strong>Fecha:</strong> ${evento.date}</p>
                <p><strong>Hora:</strong> ${evento.time}</p>
                <p><strong>Descripción:</strong> ${evento.description}</p>
                <p><strong>Tipo:</strong> ${evento.type}</p>
            `;
            eventListElement.appendChild(listItem);

            listItem.addEventListener('click', () => {
                showEventDetails(evento);
                map.setView([evento.location.lat, evento.location.lng], 15);
            });
        });

        eventListElement.style.display = 'block'; // Mostrar la lista de eventos
    }

    function showEventDetails(evento) {
        const eventDetailsElement = document.getElementById('event-details');
        if (!eventDetailsElement) {
            console.error('Elemento #event-details no encontrado en el DOM.');
            return;
        }
    
        const additionalDetailsElement = document.getElementById('additional-details');
        if (!additionalDetailsElement) {
            console.error('Elemento #additional-details no encontrado en el DOM.');
            return;
        }
    
        additionalDetailsElement.innerHTML = `
            <p><strong>Descripción:</strong> ${evento.description}</p>
            <p><strong>Enlaces Externos:</strong></p>
            <ul id="external-links-list">
                <!-- Aquí puedes agregar los enlaces externos como elementos de lista -->
            </ul>
        `;
        
        
        
        const externalLinksList = document.getElementById('external-links-list');
        if (evento.externalLinks && evento.externalLinks.length > 0) {
            evento.externalLinks.forEach(link => {
                const listItem = document.createElement('li');
                const anchor = document.createElement('a');
                
                anchor.href = link.url;
                anchor.textContent = link.label;
                anchor.target = '_blank'; // Opcional: abre el enlace en una nueva pestaña
                
                listItem.appendChild(anchor); // Agrega el elemento <a> como hijo del <li>
                externalLinksList.appendChild(listItem); // Agrega el <li> al <ul> o <ol>
            });
        } else {
            // Si no hay enlaces externos disponibles, muestra un mensaje dentro de un <li>
            externalLinksList.innerHTML = '<li><a href="https://www.google.com" target="_blank">No se han encontrado enlaces disponibles.</a></li>';
        }
    }
        

    async function buscarEventoYCentrarMapa(eventos, searchTerm) {
        const eventoEncontrado = eventos.find(evento =>
            evento.title.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (eventoEncontrado) {
            showEventDetails(eventoEncontrado);
            map.setView([eventoEncontrado.location.lat, eventoEncontrado.location.lng], 15);
        } else {
            alert('No se encontró ningún evento con ese nombre.');
        }
    }

    const dropdownBtn = document.querySelector('.dropdown-btn');
    const dropdownContent = document.getElementById('dropdownContent');

    dropdownBtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    dropdownContent.addEventListener('click', async (e) => {
        if (e.target.tagName === 'A') {
            const tipo = e.target.dataset.type;
            await mostrarListaEventos(null, tipo);
            dropdownContent.classList.remove('show');
        }
    });

    document.getElementById('searchButton').addEventListener('click', async () => {
        const searchTerm = document.getElementById('searchInput').value;
        const eventos = await cargarEventos();
        buscarEventoYCentrarMapa(eventos, searchTerm);
    });

    async function init() {
        const eventos = await cargarEventos();
        mostrarEventosEnMapa(eventos);
        mostrarListaEventos(eventos);
    }

    init();
});



// JavaScript para manejar eventos dinámicos y filtros

// Función para filtrar eventos por tipo
document.querySelectorAll('.dropdown-content a').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        let eventType = this.getAttribute('data-type');
        filterEventsByType(eventType);
    });
});

// Función para filtrar eventos por tipo (simulación)
function filterEventsByType(eventType) {
    // Aquí puedes implementar la lógica para filtrar eventos por tipo y actualizar visualmente
    console.log(`Filtrando por tipo: ${eventType}`);
}

// Función para agregar detalles adicionales dinámicamente
function addAdditionalDetails(details) {
    let additionalDetailsElement = document.getElementById('additional-details');
    additionalDetailsElement.innerHTML = details;
    
    // Aquí puedes manejar la lógica para mostrar la información del lugar al que estás asistiendo
    let getTicketsButton = document.createElement('button');
    getTicketsButton.textContent = 'Conseguir Entrada';
    getTicketsButton.addEventListener('click', function() {
        // Simulación de acción al hacer clic en "Conseguir Entrada"
        console.log('Botón Conseguir Entrada clickeado');
    });
    
    additionalDetailsElement.appendChild(getTicketsButton);
}


// Simulación de carga de detalles adicionales
let additionalDetails = `
    <p>Detalles adicionales sobre cada evento:</p>
    <ul>
        <li>Fecha: ejemplos </li>
        <li>Lugar: ejemplos </li>
        <li>Hora: ejemplos </li>
        <li>Descripción: ejemplos </li>
    </ul>
`;


addAdditionalDetails(additionalDetails);

// Función para manejar el calendario de eventos
function showEventCalendar(events) {
    let calendarElement = document.getElementById('event-calendar');
    // Aquí puedes generar visualmente el calendario de eventos según los datos recibidos
    calendarElement.innerHTML = '<p>Calendario de eventos aqui</p>';
}

