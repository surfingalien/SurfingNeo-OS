type Client = { id: string; projectId: string; controller: ReadableStreamController<Uint8Array>; };

class SSEManager {
  private clients = new Map<string, Client>();
  private projectClients = new Map<string, Set<string>>();

  addClient(projectId: string, controller: ReadableStreamController<Uint8Array>): string {
    const id = crypto.randomUUID();
    const client: Client = { id, projectId, controller };
    this.clients.set(id, client);
    if (!this.projectClients.has(projectId)) this.projectClients.set(projectId, new Set());
    this.projectClients.get(projectId)!.add(id);
    this.sendToClient(id, { type: 'connected', clientId: id });
    return id;
  }

  removeClient(id: string) {
    const client = this.clients.get(id);
    if (client) { this.projectClients.get(client.projectId)?.delete(id); this.clients.delete(id); }
  }

  sendToClient(clientId: string, data: unknown) {
    const client = this.clients.get(clientId);
    if (client) { client.controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`)); }
  }

  broadcastToProject(projectId: string, data: unknown) {
    const clientIds = this.projectClients.get(projectId);
    if (!clientIds) return;
    const msg = `data: ${JSON.stringify(Object.assign({}, data as object, { timestamp: new Date().toISOString() }))}\n\n`;
    const encoded = new TextEncoder().encode(msg);
    for (const id of Array.from(clientIds)) {
      const client = this.clients.get(id);
      if (client) { try { client.controller.enqueue(encoded); } catch { this.removeClient(id); } }
    }
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      projects: Array.from(this.projectClients.keys()).map(p => ({ projectId: p, clients: this.projectClients.get(p)!.size })),
    };
  }
}

export const sseManager = new SSEManager();