import {InMemoryStatementsRepository} from '../../repositories/in-memory/InMemoryStatementsRepository'
import {InMemoryUsersRepository} from '../../../users/repositories/in-memory/InMemoryUsersRepository'
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { IGetBalanceDTO } from './IGetBalanceDTO'
import { GetBalanceError } from './GetBalanceError'
import { ICreateStatementDTO } from '../createStatement/ICreateStatementDTO';

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepositoryInMemory: InMemoryUsersRepository;

let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {
  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepositoryInMemory = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepositoryInMemory,
      usersRepositoryInMemory
    );
  });

  it("should be able to get balance", async () => {
    const user = await usersRepositoryInMemory.create({
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    });

    const balance: IGetBalanceDTO = {
      user_id: user.id || '',
    }

    const result = await getBalanceUseCase.execute(balance);

    expect(result).toHaveProperty("balance");
    expect(result.balance).toEqual(0)
    expect(result.statement.length).toEqual(0)
  });

  it("should be able to get balance with statements", async () => {
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

    await statementsRepositoryInMemory.create(statement);
    await statementsRepositoryInMemory.create(statement);
    await statementsRepositoryInMemory.create(statement);
    await statementsRepositoryInMemory.create(statement);


    const balance: IGetBalanceDTO = {
      user_id: user.id || '',
    }

    const result = await getBalanceUseCase.execute(balance);

    expect(result).toHaveProperty("balance");
    expect(result.balance).toEqual(40)
    expect(result.statement.length).toEqual(4)
  });

  it("should not be able to get balance with nonexistent user", async () => {
    const statement: IGetBalanceDTO = {
      user_id: 'nonexistent',
    }

    await expect(
      getBalanceUseCase.execute(statement)
    ).rejects.toBeInstanceOf(GetBalanceError);
  });
});
