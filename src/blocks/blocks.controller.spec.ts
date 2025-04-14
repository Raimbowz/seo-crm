import { Test, TestingModule } from '@nestjs/testing';
import { BlocksController } from './blocks.controller';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { Block, BlockType } from './entities/block.entity';

describe('BlocksController', () => {
  let controller: BlocksController;
  let service: BlocksService;

  const mockBlock: Block = {
    id: 1,
    name: 'Test Block',
    type: BlockType.HEADER,
    content: '<h1>Test</h1>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBlocksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlocksController],
      providers: [
        {
          provide: BlocksService,
          useValue: mockBlocksService,
        },
      ],
    }).compile();

    controller = module.get<BlocksController>(BlocksController);
    service = module.get<BlocksService>(BlocksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a block', async () => {
      const createBlockDto: CreateBlockDto = {
        name: 'Test Block',
        type: BlockType.HEADER,
        content: '<h1>Test</h1>',
      };

      mockBlocksService.create.mockResolvedValue(mockBlock);

      expect(await controller.create(createBlockDto)).toEqual(mockBlock);
      expect(service.create).toHaveBeenCalledWith(createBlockDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of blocks', async () => {
      mockBlocksService.findAll.mockResolvedValue([mockBlock]);

      expect(await controller.findAll()).toEqual([mockBlock]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single block', async () => {
      mockBlocksService.findOne.mockResolvedValue(mockBlock);

      expect(await controller.findOne('1')).toEqual(mockBlock);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a block', async () => {
      const updateBlockDto: UpdateBlockDto = {
        content: '<h1>Updated Test</h1>',
      };

      mockBlocksService.update.mockResolvedValue({
        ...mockBlock,
        ...updateBlockDto,
      });

      expect(await controller.update('1', updateBlockDto)).toEqual({
        ...mockBlock,
        ...updateBlockDto,
      });
      expect(service.update).toHaveBeenCalledWith(1, updateBlockDto);
    });
  });

  describe('remove', () => {
    it('should remove a block', async () => {
      mockBlocksService.remove.mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
