import { TestBed } from '@angular/core/testing';

import { NodeFileLoaderService } from './node-file-loader.service';

describe('NodeFileLoaderService', () => {
  let service: NodeFileLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeFileLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
