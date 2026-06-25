export class EventManager {
  constructor() {
    this._listeners = new Map();
  }

  subscribe(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(callback);
    return () => this.unsubscribe(event, callback);
  }

  unsubscribe(event, callback) {
    const listeners = this._listeners.get(event);
    if (!listeners) return;
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  }

  notify(event, data) {
    const listeners = this._listeners.get(event);
    if (!listeners) return;
    listeners.forEach(cb => cb(data));
  }

  clear() {
    this._listeners.clear();
  }
}

export default EventManager;
