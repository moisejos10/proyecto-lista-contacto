/**
 * @typedef {object} Contact
 * @property {string} id - El id del contacto, que es aleatorio.
 * @property {string} name - El nombre y apellido del contactpo.
 * @property {string} phone - El numero telefonico venezolano del contacto.
*/

/** @type {Contact[]} */
let contacts = [];

/**
 * Crea un nuevo contacto
 * @param {object} payload 
 * @param {string} payload.name - El nombre del contacto.
 * @param {string} payload.phone - El numero del contacto
 */
const addContact = (payload) => {
  const id = crypto.randomUUID();
  const newContact = { id, ...payload };
  contacts = contacts.concat(newContact);
}

/**
 * Obtiene los contactos
 */
const getContacts = () => {
  return contacts;
}

/**
 * Elimina un contacto.
 * @param {string} id - El id del contacto a eliminar.
 */
const deleteContact = (id) => {
  contacts = contacts.filter(contact => contact.id !== id);
}

/**
 * Actualiza un contacto
 * @param {string} id - El id del contacto a actualizar
 * @param {object} payload - La informacion del contacto editado.
 * @param {string} payload.name - El nombre del contacto.
 * @param {string} payload.phone - El numero del contacto
*/
const updateContact = (id, payload) => {
  contacts = contacts.map(contact => {
    if (contact.id === id) {
      return {
        ...contact, 
        name: payload.name, 
        phone: payload.phone
      }
    } else {
      return contact;
    }
  })
}


/**
 * Guarda en el navegador
 */
const saveContactsInBrowser = () => {
  localStorage.setItem('contacts', JSON.stringify(contacts));
}

/**
 * Obtener contactos del navegador
 */
const getContactsFromBrowser = () => {
  // 1. Convertir de JSON a Javascript
  const contactsFromBrowser = localStorage.getItem('contacts') ?? [];
  // 2. Reemplazar contacts con los contctos del navegador
  contacts = JSON.parse(contactsFromBrowser);
}

const contactsService = {
  addContact,
  getContacts,
  deleteContact,
  updateContact,
  saveContactsInBrowser,
  getContactsFromBrowser
}

export default contactsService;