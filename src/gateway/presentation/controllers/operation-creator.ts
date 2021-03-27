import { SignInRequiredError } from '@errors/sign-in-required';
import { isNumber, isValidISODate } from '@utils/validators';

import { Authorization } from '@domain/user/usecases';
import { OperationCreator } from '@domain/wallet/usecases';

import {
  clientError, Controller, created, Params, Response, serverError, unauthorized
} from '@gateway/presentation/contracts';
import { operationView } from '../view/operation';
import { InvalidParameterValueError } from '@errors/invalid-parameter-value';

export class OperationCreatorController implements Controller {
  constructor(
    private readonly operationCreator: OperationCreator,
    private readonly auth: Authorization,
  ) {}

  async handle({date, quantity, value, positionId, authorization}: Params): Promise<Response> {
    const checkLoggedUserId = (id: string) => this.auth.checkId(id, authorization);
    if (!date || !quantity || !value || !positionId) {
      return clientError('Required parameters: date, quantity, value, positionId');
    }
    if (!isValidISODate(date)) {
      return clientError('Date must be in ISO format');
    }
    if (!isNumber(quantity) || !isNumber(value)) {
      return clientError('Quantity and value must be cast to valid numbers');
    }
    try {
      const operation = await this.operationCreator.create({
        date: new Date(date),
        quantity: Number(quantity),
        value: Number(value),
        positionId,
        isLogged: checkLoggedUserId
      });
      return created(operationView(operation));
    } catch (error) {
      if (error instanceof SignInRequiredError) {
        return unauthorized('Login required to this action!');
      }
      if (error instanceof InvalidParameterValueError) {
        return clientError(error.message);
      }
      return serverError(error);
    }
  }
}
