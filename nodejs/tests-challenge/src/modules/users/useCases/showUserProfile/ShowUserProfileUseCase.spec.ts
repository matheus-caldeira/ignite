import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { ICreateUserDTO } from '../createUser/ICreateUserDTO';
import { ShowUserProfileError } from './ShowUserProfileError';

let usersRepositoryInMemory: InMemoryUsersRepository;

let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepositoryInMemory);
  });

  it("should be able to show an user", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@user.com",
      password: "1234",
      name: "User Test Error",
    })

    const result = await showUserProfileUseCase.execute(user.id || '');

    expect(result).toEqual(user)
  });

  it("should not be able to show an nonexistent user", async () => {

    await expect(
      showUserProfileUseCase.execute('user')
    ).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
