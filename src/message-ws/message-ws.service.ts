import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients {
  [id: string]: {
    socket: Socket;
    user: User; // Cambio para que la conexion traiga ademas del socket, al usuario
  };
}

@Injectable()
export class MessageWsService {
  //

  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Registra la conexion del cliente segun su id
  async registerClient(client: Socket, userId: string) {
    // Verificacion de la existencia del usuario
    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) throw new Error(`User not found)`);
    if (!user.isActive) throw new Error(`User not active)`);

    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }

  // Elimina la conexion del cliente segun el id
  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return this.connectedClients ? Object.keys(this.connectedClients) : [];
  }

  getUserFullName(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }
}
