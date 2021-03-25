import { UserNotFoundError } from '@errors/not-found';

import { env } from '@infra/environment';
import { Users } from '@infra/data-source/model';
import { Mongo } from '@infra/data-source/database';
import { MongoUserRepository } from '@infra/data-source/database/mongo/repositories/user';

let mongo: Mongo;
let repo: MongoUserRepository;
let userName: string;

describe('Mongo user repository', () => {
  beforeAll(async done => {
    try {
      userName = 'Rafael Arantes';
      mongo = new Mongo(env.mongodb);
      repo = (await mongo.createRepositoryFactories()).users.make();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterEach(async done => {
    try {
      await Users.deleteMany();
      done();
    } catch (error) {
      done(error);
    }
  });

  afterAll(async done => {
    try {
      mongo.disconnect();
      done();
    } catch (error) {
      done(error);
    }
  });

  it('should be able to get user from username', async done => {
    await Users.create({
      userName,
      passHash: '123456',
    });
    await expect(
      repo.getUserFromUsername(userName)
    ).resolves.toEqual(expect.objectContaining({userName}));
    done();
  });

  it('should be able to create user', async done => {
    await repo.saveUser({
      userName,
      passHash: '654321',
      role: 'USER'
    });
    await expect(
      Users.findOne({ userName })
    ).resolves.toEqual(expect.objectContaining({
      userName,
      passHash: '654321',
      role: 'USER'
    }));
    done();
  });

  it('should not be able to get inexistent user from username', async done => {
    await expect(
      repo.getUserFromUsername(userName)
    ).rejects.toBeInstanceOf(UserNotFoundError);
    done();
  });
});
