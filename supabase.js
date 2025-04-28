// Configura Supabase
const supabaseUrl = 'TU_URL_SUPABASE';
const supabaseKey = 'TU_API_KEY_PUBLICA';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Elementos del DOM
const plantasContainer = document.getElementById('plantas-container');
const buscador = document.getElementById('buscador');
const filtroTipo = document.getElementById('filtro-tipo');
const btnSequia = document.getElementById('btn-sequia');
const modal = document.getElementById('modal');
const cerrarModal = document.getElementById('cerrar-modal');
const modalContent = document.getElementById('modal-content');

// Cargar plantas al iniciar
document.addEventListener('DOMContentLoaded', cargarPlantas);

// Función principal: Cargar y mostrar plantas
async function cargarPlantas(filtros = {}) {
  let query = supabase.from('plantas').select('*');

  // Aplicar filtros
  if (filtros.tipo && filtros.tipo !== 'todas') {
    query = query.eq('tipo', filtros.tipo);
  }
  if (filtros.sequia) {
    query = query.eq('tolerante_sequia', true);
  }
  if (filtros.busqueda) {
    query = query.ilike('nombre', `%${filtros.busqueda}%`);
  }

  const { data: plantas, error } = await query;

  if (error) {
    console.error('Error cargando plantas:', error);
    return;
  }

  mostrarPlantas(plantas);
}

// Mostrar plantas en el DOM
function mostrarPlantas(plantas) {
  plantasContainer.innerHTML = '';

  plantas.forEach(planta => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow';
    card.innerHTML = `
      <img src="${planta.imagen_url || 'https://via.placeholder.com/300x200?text=Planta'}" 
           alt="${planta.nombre}" 
           class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-xl text-green-700">${planta.nombre}</h3>
        <p class="text-gray-600">${planta.tipo}</p>
        ${planta.tolerante_sequia ? '<span class="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-2">🌵 Tolera sequía</span>' : ''}
        <button onclick="mostrarDetalles(${planta.id})" 
                class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          Ver detalles
        </button>
      </div>
    `;
    plantasContainer.appendChild(card);
  });
}

// Mostrar detalles en modal
async function mostrarDetalles(idPlanta) {
  const { data: planta, error } = await supabase
    .from('plantas')
    .select('*')
    .eq('id', idPlanta)
    .single();

  if (error) {
    console.error('Error cargando detalles:', error);
    return;
  }

  modalContent.innerHTML = `
    <h2 class="text-2xl font-bold text-green-800 mb-4">${planta.nombre}</h2>
    <img src="${planta.imagen_url || 'https://via.placeholder.com/600x400?text=Planta'}" 
         alt="${planta.nombre}" 
         class="w-full h-64 object-cover mb-4 rounded">
    <p><span class="font-semibold">Tipo:</span> ${planta.tipo}</p>
    ${planta.tolerante_sequia ? '<p class="mt-2"><span class="font-semibold">🌵</span> Tolera sequía</p>' : ''}
    ${planta.repele_plagas ? `<p class="mt-2"><span class="font-semibold">🛡️ Repele:</span> ${planta.repele_plagas.join(', ')}</p>` : ''}
    <p class="mt-4">${planta.descripcion || 'Sin descripción adicional.'}</p>
  `;

  modal.classList.remove('hidden');
}

// Event Listeners
buscador.addEventListener('input', (e) => {
  cargarPlantas({ busqueda: e.target.value });
});

filtroTipo.addEventListener('change', (e) => {
  cargarPlantas({ tipo: e.target.value });
});

btnSequia.addEventListener('click', () => {
  btnSequia.classList.toggle('bg-green-200');
  const filtroSequia = btnSequia.classList.contains('bg-green-200');
  cargarPlantas({ sequia: filtroSequia });
});

cerrarModal.addEventListener('click', () => {
  modal.classList.add('hidden');
});

// Hacer funciones globales (para los onclick en HTML)
window.mostrarDetalles = mostrarDetalles;
