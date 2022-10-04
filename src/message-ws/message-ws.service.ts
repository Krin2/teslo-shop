import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface ConnectedClients {
  [id: string]: Socket;
}

@Injectable()
export class MessageWsService {
  //

  private connectedClients: ConnectedClients = {};

  // Registra la conexion del cliente segun su id
  registerClient(client: Socket) {
    this.connectedClients[client.id] = client;
  }

  // Elimina la conexion del cliente segun el id
  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return this.connectedClients ? Object.keys(this.connectedClients) : [];
  }
}
