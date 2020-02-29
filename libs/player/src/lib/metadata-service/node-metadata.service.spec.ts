import { TestBed } from '@angular/core/testing';

import { NodeId3TagsService } from './node-id3-tags.service';

describe('NodeMetadataService', () => {
  let service: NodeId3TagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeId3TagsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
