import {InMemoryStatementsRepository} from '../../repositories/in-memory/InMemoryStatementsRepository'
import {InMemoryUsersRepository} from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { IGetStatementOperationDTO } from './IGetStatementOperationDTO'
import { GetStatementOperationError } from './GetStatementOperationError'
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
    );
  });

  it("should be able to get statement ID", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement = await statementsRepositoryInMemory.create({
      amount: 10,
      description: 'teste',
      type: OperationType.DEPOSIT,
      user_id: user.id || ''
    });


    const result = await getStatementOperationUseCase.execute({
      statement_id: statement.id || '',
      user_id: user.id || '',
    });

    expect(result).toEqual(statement);
  });

  it("should not be able to get statement with nonexistent user", async () => {
    const statement: IGetStatementOperationDTO = {
      user_id: 'nonexistent',
      statement_id: '',
    }

    await expect(
      getStatementOperationUseCase.execute(statement)
    ).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get statement with nonexistent statement", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement: IGetStatementOperationDTO = {
      user_id: user.id || '',
      statement_id: 'nonexistent',
    }

    await expect(
      getStatementOperationUseCase.execute(statement)
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

  it("should not be able to get statement with nonexistent statement", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const statement: IGetStatementOperationDTO = {
      user_id: user.id || '',
      statement_id: 'nonexistent',
    }

    await expect(
      getStatementOperationUseCase.execute(statement)
    ).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
