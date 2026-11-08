// Loads demo data into the local Firestore emulator (never into a real project).
// Run through `npm run demo`, which starts the emulator first.
import { initializeApp } from 'firebase/app';
import {
  getFirestore, connectFirestoreEmulator, doc, setDoc, Timestamp,
} from 'firebase/firestore';

const host = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8180').split(':');
const app = initializeApp({ apiKey: 'demo-api-key', projectId: 'demo-pictogram-tasks', appId: 'demo-app-id' });
const db = getFirestore(app);
connectFirestoreEmulator(db, host[0], Number(host[1]));

const days = (n) => Timestamp.fromDate(new Date(Date.now() + n * 86400000));
const menuOptions = () => ({
  Menu1: ['../../../images/Menu.png', 'Menu', 0],
  Menu2: ['../../../images/NoCarne.png', 'Sin Carne', 0],
  Menu3: ['../../../images/Triturado.png', 'Triturado', 0],
  Menu4: ['../../../images/FrutaTriturada.png', 'Fruta Triturada', 0],
  Menu5: ['../../../images/yogur_natillas.png', 'Yogur Natillas', 0],
  Menu6: ['../../../images/Fruta.png', 'Fruta', 0],
});

// Demo teacher login: user "demo", password "demo" (local emulator only).
const teachers = { 'teacher-demo': { nombre: 'demo', 'contraseña': 'demo' } };

const tasks = {
  'task-menu': {
    tipoTarea: 'Tarea Menu',
    titulo: 'Solicitar la comanda del menú del día',
    Clases: { ClaseA: menuOptions(), ClaseB: menuOptions() },
  },
  'task-steps': {
    tipoTarea: 'Tarea por pasos',
    titulo: 'Tarea por pasos',
    pasos: {
      1: { Titulo: 'Lavarse las manos', Instrucciones: 'Abre el grifo y usa jabón.', Imagen: '', Pictograma: '' },
      2: { Titulo: 'Secarse las manos', Instrucciones: 'Usa la toalla.', Imagen: '', Pictograma: '' },
      3: { Titulo: 'Sentarse a la mesa', Instrucciones: 'Busca tu sitio.', Imagen: '', Pictograma: '' },
    },
  },
  'task-material': {
    tipoTarea: 'Recogida de material',
    titulo: 'Recogida de material',
    materiales: {
      Lapices: { Cantidad: '5', Descripcion: 'Lápices de colores' },
      Tijeras: { Cantidad: '2', Descripcion: 'Tijeras de punta redonda' },
      Pegamento: { Cantidad: '1', Descripcion: 'Barra de pegamento' },
    },
  },
  'task-copies': {
    tipoTarea: 'Fotocopias',
    titulo: 'Fotocopias/Plastificado',
    tipo: 'Fotocopia',
    tipoColor: 'Color',
    cantidad: 10,
  },
};

const agenda = (...ids) => ids.map((id, i) => ({
  idTarea: doc(db, 'Tareas', id),
  fechaInicio: days(-1),
  fechaLimite: days(3 + i),
}));

// Fictional students. Visual password = two fruit ids (0 Uvas … 8 Aguacate).
const students = {
  'student-1': { nombre: 'Alumno Demo 1', edad: '10', preferenciasVista: 'Pictograma', contrasenaVisual: ['0', '5'], tareasCompletadas: 3, fotoAvatar: null, agendaTareas: agenda('task-menu', 'task-steps') },
  'student-2': { nombre: 'Alumno Demo 2', edad: '12', preferenciasVista: 'Imagenes reales', contrasenaVisual: ['3', '7'], tareasCompletadas: 5, fotoAvatar: null, agendaTareas: agenda('task-material', 'task-copies') },
  'student-3': { nombre: 'Alumno Demo 3', edad: '9', preferenciasVista: 'Texto', contrasenaVisual: ['1', '2'], tareasCompletadas: 1, fotoAvatar: null, agendaTareas: agenda('task-steps') },
};

const write = (col, docs) => Promise.all(Object.entries(docs).map(([id, data]) => setDoc(doc(db, col, id), data)));
await write('Profesores', teachers);
await write('Tareas', tasks);
await write('Estudiantes', students);
console.log('Seeded Firestore emulator: 1 teacher, 4 tasks, 3 students.');
process.exit(0);
