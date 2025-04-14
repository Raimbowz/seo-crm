import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlocksService } from './blocks.service';
import { Block, BlockType } from './entities/block.entity';
import { NotFoundException } from '@nestjs/common';

describe('BlocksService', () => {
  let service: BlocksService;
  let repository: Repository<Block>;

  const mockBlock: Block = {
    id: 1,
    name: 'Test Block',
    type: BlockType.HEADER,
    content: '<h1>Test</h1>',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlocksService,
        {
          provide: getRepositoryToken(Block),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BlocksService>(BlocksService);
    repository = module.get<Repository<Block>>(getRepositoryToken(Block));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new block', async () => {
      const createBlockDto = {
        name: 'Test Block',
        type: BlockType.HEADER,
        content: '<h1>Test</h1>',
      };

      mockRepository.create.mockReturnValue(mockBlock);
      mockRepository.save.mockResolvedValue(mockBlock);

      const result = await service.create(createBlockDto);

      expect(result).toEqual(mockBlock);
      expect(repository.create).toHaveBeenCalledWith(createBlockDto);
      expect(repository.save).toHaveBeenCalledWith(mockBlock);
    });
  });

  describe('findAll', () => {
    it('should return an array of blocks', async () => {
      mockRepository.find.mockResolvedValue([mockBlock]);

      const result = await service.findAll();

      expect(result).toEqual([mockBlock]);
      expect(repository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single block', async () => {
      mockRepository.findOne.mockResolvedValue(mockBlock);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBlock);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if block not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a block', async () => {
      const updateBlockDto = {
        content: '<h1>Updated Test</h1>',
      };

      const updatedBlock = {
        ...mockBlock,
        ...updateBlockDto,
      };

      mockRepository.findOne.mockResolvedValue(mockBlock);
      mockRepository.merge.mockReturnValue(updatedBlock);
      mockRepository.save.mockResolvedValue(updatedBlock);

      const result = await service.update(1, updateBlockDto);

      expect(result).toEqual(updatedBlock);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.merge).toHaveBeenCalledWith(mockBlock, updateBlockDto);
      expect(repository.save).toHaveBeenCalledWith(updatedBlock);
    });

    it('should throw an error if block not found', async () => {
      const updateBlockDto = {
        content: '<h1>Updated Test</h1>',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateBlockDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a block', async () => {
      mockRepository.findOne.mockResolvedValue(mockBlock);
      mockRepository.remove.mockResolvedValue(mockBlock);

      await service.remove(1);

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.remove).toHaveBeenCalledWith(mockBlock);
    });

    it('should throw an error if block not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
