import { WebSocketGateway } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';

// En este punto la conexion ya esta andando. se puede verificar obteniendo una respuesta de:
// localhost:3000/socket.io/socket.io.js
// La cual es una direccion reservada y contiene toda la documentacion necesaria para realizar la conexion.
@WebSocketGateway({ cors: true })
export class MessageWsGateway {
  constructor(private readonly messageWsService: MessageWsService) {}
}
