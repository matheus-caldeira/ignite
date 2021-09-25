import {InMemoryUsersRepository} from '../../repositories/in-memory/InMemoryUsersRepository'
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { CreateUserError } from './CreateUserError';

let usersRepositoryInMemory: InMemoryUsersRepository;

let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create an user", async () => {
    const user: ICreateUserDTO = {
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    };

    const result = await createUserUseCase.execute(user);

    expect(result).toHaveProperty("id");
  });

  it("should not be able to create two users with the same email", async () => {
    const user: ICreateUserDTO = {
      email: "user@user.com",
      password: "1234",
      name: "User Test Error",
    };

    await createUserUseCase.execute(user);

    await expect(
      createUserUseCase.execute(user)
    ).rejects.toBeInstanceOf(CreateUserError);
  });
});
