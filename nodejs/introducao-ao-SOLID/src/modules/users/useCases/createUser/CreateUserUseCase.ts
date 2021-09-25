import { User } from "../../model/User";
import { IUsersRepository } from "../../repositories/IUsersRepository";

interface IRequest {
  name: string;
  email: string;
}

class CreateUserUseCase {
  constructor(private usersRepository: IUsersRepository) {}

  execute({ email, name }: IRequest): User {
    const check = this.usersRepository.findByEmail(email);

    if (check) throw new Error("Email já cadastrado");

    const user = this.usersRepository.create({ email, name });

    return user;
  }
}

export { CreateUserUseCase };
