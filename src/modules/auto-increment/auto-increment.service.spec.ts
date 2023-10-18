import { Test, TestingModule } from '@nestjs/testing';
import { AutoIncrementService } from './auto-increment.service';

describe('AutoIncrementService', () => {
  let service: AutoIncrementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutoIncrementService],
    }).compile();

    service = module.get<AutoIncrementService>(AutoIncrementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
