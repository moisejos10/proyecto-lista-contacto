// Importamos la lógica de negocio (guardar, borrar, traer datos) desde el otro archivo
import contactsService from "./contacts.js";

// --- SELECTORES DEL DOM ---
// Buscamos los elementos del HTML para poder manipularlos con JavaScript
const form = document.querySelector('#main-form'); // El formulario principal
const inputName = document.querySelector('#name-input'); // Input de nombre (arriba)
const inputPhone = document.querySelector('#phone-input'); // Input de teléfono (arriba)
const formButton = document.querySelector('#main-form-btn'); // Botón "Crear"

const contactsList = document.querySelector('#contacts-list'); // La lista <ul> donde van los contactos
const contactItemTemplate = document.querySelector('#template-contact-item'); // El molde (template) para crear nuevos contactos

// --- EXPRESIONES REGULARES (REGEX) ---
// Reglas para validar texto.
// Nombre: Inicia mayúscula, letras, espacio opcional, Segundo nombre mayúscula.
const NAME_REGEX = /^[A-Z][a-z]*[ ][A-Z][a-z]{3,}[ ]{0,1}$/;
// Teléfono: Empieza en 0, código de operadora venezolana, seguido de 7 números.
const PHONE_REGEX = /^[0](414|424|416|426|422|412|212)[0-9]{7}$/;

// --- ESTADO GLOBAL ---
// Variables bandera para saber si el formulario principal está listo para enviarse
let isValidName = false;
let isValidPhone = false;

// --- FUNCIÓN DE VALIDACIÓN VISUAL ---
// Se encarga de pintar de rojo/verde y mostrar/ocultar el mensaje de ayuda
const handleStateInput = (input, isValid) => {
  // Busamos el elemento hermano siguiente (el <p> con el mensaje de error)
  const helperText = input.nextElementSibling;
  
  if (!input.value) {
    // Si el input está vacío, limpiamos todas las clases (ni verde ni rojo)
    input.classList.remove('input-invalid');
    input.classList.remove('input-valid');
    helperText.classList.remove('show-helper-text');
  } else if (isValid) {
    // Si es válido: Borde verde, quitamos rojo, ocultamos mensaje
    input.classList.add('input-valid');
    input.classList.remove('input-invalid');
    helperText.classList.remove('show-helper-text');
  } else {
    // Si es inválido: Borde rojo, quitamos verde, MOSTRAMOS mensaje
    input.classList.add('input-invalid');
    input.classList.remove('input-valid');
    helperText.classList.add('show-helper-text');
  }
}

// --- ESTADO DEL BOTÓN CREAR ---
// Habilita o deshabilita el botón basándose en si ambos campos son válidos
const handleFormBtnState = () => {
  if (isValidName && isValidPhone) {
    formButton.disabled = false; // Activa el botón
  } else {
    formButton.disabled = true;  // Desactiva el botón
  }
}

// --- RENDERIZADO DE LA LISTA ---
// Borra la lista actual y la vuelve a dibujar con los datos actualizados
const renderContacts = (contacts) => {
  contactsList.innerHTML = '';
  contacts.forEach(contact => {
    const li = contactItemTemplate.content.cloneNode(true).children[0];
    li.id = contact.id;

    // --- CORRECCIÓN USANDO CHILDREN ---
    // Antes era: li.children[0].children[0]
    // Ahora bajamos un nivel más porque pusiste un div envoltorio:
    
    // Ruta: inputs-container -> wrapper nombre -> input
    const liNameInput = li.children[0].children[0].children[0];
    
    // Ruta: inputs-container -> wrapper telefono -> input
    const liPhoneInput = li.children[0].children[1].children[0]; 
  
    liNameInput.value = contact.name;
    liPhoneInput.value = contact.phone

    contactsList.append(li);
  });
}


// --- EVENTO INPUT NOMBRE (Formulario Principal) ---
// Se ejecuta cada vez que escribes una letra en el nombre
inputName.addEventListener('input', e => {
  isValidName = NAME_REGEX.test(inputName.value); // Probamos si cumple el Regex
  handleStateInput(inputName, isValidName); // Actualizamos colores/mensajes
  handleFormBtnState(); // Revisamos si activamos el botón
});

// --- EVENTO INPUT TELÉFONO (Formulario Principal) ---
// Igual que el anterior, pero para el teléfono
inputPhone.addEventListener('input', e => {
  isValidPhone = PHONE_REGEX.test(inputPhone.value);
  handleStateInput(inputPhone, isValidPhone);
  handleFormBtnState();
});

// --- EVENTO SUBMIT (Crear Contacto) ---
form.addEventListener('submit', e => {
  e.preventDefault(); // Evita que la página se recargue (comportamiento default)
  
  // Doble chequeo de seguridad: si algo no es válido, no guardamos
  if (!isValidName || !isValidPhone) return;
  
  // Usamos el servicio para agregar el contacto al array
  contactsService.addContact({name: inputName.value, phone: inputPhone.value});
  contactsService.saveContactsInBrowser(); // Guardamos en LocalStorage
  
  // Obtenemos la lista actualizada y la pintamos de nuevo
  const contacts = contactsService.getContacts();
  renderContacts(contacts);
  
  // Opcional: Aquí podrías agregar form.reset() para limpiar los campos
});

// --- DELEGACIÓN DE EVENTOS EN LA LISTA ---
// Detectamos clics en toda la lista y filtramos si fue en borrar o editar
contactsList.addEventListener('click' , e => {
  // Busamos si el clic ocurrió dentro de un botón de borrar o editar
  const deleteBtn = e.target.closest('.delete-btn');
  const editBtn = e.target.closest('.edit-btn');

  // CASO 1: BORRAR
  if (deleteBtn) {
    const li = deleteBtn.closest('.contacts-list-item'); // Buscamos el LI padre
    contactsService.deleteContact(li.id); // Borramos del array
    contactsService.saveContactsInBrowser(); // Actualizamos LocalStorage
    li.remove(); // Quitamos el elemento del HTML visualmente
  }

  // CASO 2: EDITAR
  if (editBtn) {
    const li = editBtn.closest('.contacts-list-item'); // Buscamos el LI padre
    
    // Aquí usamos querySelector porque es más seguro para buscar dentro del LI
    // busca el input que tenga esa clase ESPECÍFICA dentro de ESTE li
    const liNameInput = li.querySelector('.contacts-list-item-name-input');
    const liPhoneInput = li.querySelector('.contacts-list-item-phone-input');
    
    // Verificamos si estamos en modo "Editando" (guardar) o modo "Lectura" (empezar a editar)
    // dataset.editing devuelve un string ("true" o "false")
    const isEditing = li.dataset.editing === 'true';
    
    // Definimos los íconos para intercambiarlos
    const pencilIcon = '<ion-icon name="create-outline"></ion-icon>';
    const saveIcon = '<ion-icon name="checkmark-outline"></ion-icon>';

    // --- SI ESTAMOS GUARDANDO LOS CAMBIOS ---
    if (isEditing) {
      // 1. Validamos antes de guardar
      const isNameValid = NAME_REGEX.test(liNameInput.value);
      const isPhoneValid = PHONE_REGEX.test(liPhoneInput.value);

      // Si hay error, mostramos visuales y DETENEMOS la función (return)
      if (!isNameValid || !isPhoneValid) {
        handleStateInput(liNameInput, isNameValid);
        handleStateInput(liPhoneInput, isPhoneValid);
        alert("Corrige los errores indicados en el mensaje.");
        return; // IMPORTANTE: Esto evita que se guarde data mala
      }

      console.log('Guardando...');
      // Bloqueamos los inputs de nuevo
      liNameInput.setAttribute('readonly', '');
      liPhoneInput.setAttribute('readonly', '');
      li.dataset.editing = 'false'; // Cambiamos bandera a "no editando"
      
      // Actualizamos el contacto en el servicio
      contactsService.updateContact(li.id, { name: liNameInput.value, phone: liPhoneInput.value });
      contactsService.saveContactsInBrowser();

      // Limpieza visual: quitamos bordes rojos/verdes y ocultamos mensajes
      liNameInput.classList.remove('input-valid', 'input-invalid', 'contact-item-input-editing');
      liPhoneInput.classList.remove('input-valid', 'input-invalid', 'contact-item-input-editing');
      
      // Forzamos ocultar el mensaje de error usando el hermano siguiente
      liNameInput.nextElementSibling.classList.remove('show-helper-text');
      liPhoneInput.nextElementSibling.classList.remove('show-helper-text');

      // Volvemos a poner el ícono de lápiz
      editBtn.innerHTML = pencilIcon;

    // --- SI ESTAMOS EMPEZANDO A EDITAR ---
    } else {
      console.log('Editando...');
      // Quitamos readonly para poder escribir
      liNameInput.removeAttribute('readonly');
      liPhoneInput.removeAttribute('readonly');

      // Agregamos borde gris para indicar que es editable
      liNameInput.classList.add('contact-item-input-editing');
      liPhoneInput.classList.add('contact-item-input-editing');
      
      liNameInput.focus(); // Ponemos el cursor en el nombre
      editBtn.innerHTML = saveIcon; // Cambiamos ícono a Check (Guardar)
      li.dataset.editing = 'true'; // Cambiamos bandera a "editando"

      // --- VALIDACIÓN EN TIEMPO REAL (LISTA) ---
      // Asignamos la función oninput para validar mientras el usuario escribe en la lista
      liNameInput.oninput = () => {
        const isValid = NAME_REGEX.test(liNameInput.value);
        handleStateInput(liNameInput, isValid); // Reutilizamos la función visual
      };

      liPhoneInput.oninput = () => {
        const isValid = PHONE_REGEX.test(liPhoneInput.value);
        handleStateInput(liPhoneInput, isValid);
      };
    }
  }
})

// --- CARGA INICIAL ---
// Cuando la ventana termina de cargar, recuperamos los datos
window.onload = () => {
  contactsService.getContactsFromBrowser(); // Traer del LocalStorage
  const contacts = contactsService.getContacts(); // Obtener el array
  renderContacts(contacts); // Dibujar en pantalla
}