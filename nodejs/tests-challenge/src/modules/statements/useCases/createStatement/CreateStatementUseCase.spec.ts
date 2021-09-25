import {InMemoryStatementsRepository} from '../../repositories/in-memory/InMemoryStatementsRepository'
import {InMemoryUsersRepository} from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from './ICreateStatementDTO'
import { CreateStatementError } from './CreateStatementError'

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );
  });

  it("should be able to create an statement: deposit", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement: ICreateStatementDTO = {
      amount: 10,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id || '',
    }

    const result = await createStatementUseCase.execute(statement);

    expect(result).toHaveProperty("id");
  });

  it("should be able to create an statement: withdraw", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement: ICreateStatementDTO = {
      amount: 10,
      description: 'Test',
      type: OperationType.DEPOSIT,
      user_id: user.id || '',
    }

    await createStatementUseCase.execute(statement);

    const result = await createStatementUseCase.execute({
      ...statement,
      type: OperationType.WITHDRAW
    });

    expect(result).toHaveProperty("id");
  });

  it("should not be able to withdraw wihtout money", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement: ICreateStatementDTO = {
      amount: 10,
      description: 'Test',
      type: OperationType.WITHDRAW,
      user_id: user.id || '',
    }

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });

  it("should not be able to create an statement with nonexistent user", async () => {
    const statement: ICreateStatementDTO = {
      amount: 10,
      description: 'Test',
      type: OperationType.WITHDRAW,
      user_id: 'nonexistent',
    }

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });
});
