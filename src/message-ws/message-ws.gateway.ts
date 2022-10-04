import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageWsService } from './message-ws.service';

// El WebSocketGateway actua como un Controlador
// En este punto la conexion ya esta andando. se puede verificar obteniendo una respuesta de:
// localhost:3000/socket.io/socket.io.js
// La cual es una direccion reservada y contiene toda la documentacion necesaria para realizar la conexion.
@WebSocketGateway({ cors: true })
export class MessageWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server; // genera una instancia del websocket server. wss tiene la info de todos los clientes conectados

  constructor(private readonly messageWsService: MessageWsService) {}

  // estas interfaces (provenientes de: OnGatewayConnection y OnGatewayDisconnect) me permiten saber cuando alguien se conecta o desconecta del namespace
  handleConnection(client: Socket) {
    // cada socket tiene un id unico. El mismo cambiara cuando el cliente se desconecte y vuelva a conectarse
    // console.log('Cliente conectado', client.id);
    this.messageWsService.registerClient(client);

    // Este emit, da la informacion de los clientes conectados, por medio del evento "client-updated" a todos los clientes conectados(wss)
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    // console.log('Cliente desconectado', client.id);
    this.messageWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messageWsService.getConnectedClients(),
    );
  }
}
