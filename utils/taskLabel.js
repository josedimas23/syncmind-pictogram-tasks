// Short human description of a task, so teachers can tell apart tasks that
// share the same title (e.g. several "Fotocopias/Plastificado").
export function taskDetail(task) {
  switch (task.tipoTarea) {
    case 'Fotocopias':
      return `${task.tipo || 'Fotocopia'} · ${task.cantidad ?? '?'} · ${task.tipoColor || ''}`.trim();
    case 'Recogida de material':
      return Object.keys(task.materiales || {}).map((m) => (m === 'Lapices' ? 'Lápices' : m)).join(', ') || 'Sin material';
    case 'Tarea Menu':
      return Object.keys(task.Clases || {}).sort().map((c) => c.replace(/^Clase/, 'Clase ')).join(', ');
    case 'Tarea por pasos': {
      const n = Object.keys(task.pasos || {}).length;
      return `${n} paso${n === 1 ? '' : 's'}`;
    }
    default:
      return task.tipoTarea || '';
  }
}

export function taskLabel(task) {
  const detail = taskDetail(task);
  return detail ? `${task.titulo} (${detail})` : task.titulo;
}
