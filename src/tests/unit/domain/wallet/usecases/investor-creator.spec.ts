import { InvestorCreator } from '@domain/wallet/usecases';
import { InvestorData } from '@domain/wallet/usecases/dtos';

let investorData: InvestorData
let useCase: InvestorCreator;

describe('Investor creator', () => {
  beforeAll(() => {
    investorData = {
      id: 'myID',
      name: 'My Name',
    }
    useCase = new InvestorCreator(data => ({...data, walletIds: []}));
  });

  it('should be able create investor', async done => {
    const investor = await useCase.create(investorData);
    expect(investor.id).toEqual(investorData.id);
    expect(investor.name).toEqual(investorData.name);
    expect(investor.getWallets()).toEqual([]);
    done();
  });
});
