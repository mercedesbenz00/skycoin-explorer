import { switchMap, filter, first } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ExplorerService } from '../../../services/explorer/explorer.service';
import { Block } from '../../../app.datatypes';
import { ApiService } from 'app/services/api/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-block-details',
  templateUrl: './block-details.component.html',
  styleUrls: ['./block-details.component.scss']
})
export class BlockDetailsComponent implements OnInit, OnDestroy {
  block: Block;
  loadingMsg = 'general.loadingMsg';
  longErrorMsg: string;
  blockCount: number;
  blockID = '';

  private pageSubscriptions: Subscription[] = [];

  constructor(
    private explorer: ExplorerService,
    private route: ActivatedRoute,
    private api: ApiService,
  ) { }

  ngOnInit() {

    this.pageSubscriptions.push(this.api.getBlockchainMetadata().pipe(first()).subscribe(blockchain => this.blockCount = blockchain.blocks));

    this.pageSubscriptions.push(this.route.params.pipe(filter(params => +params['id'] !== null),
      switchMap((params: Params) => {
        this.blockID = params['id'];
        return this.explorer.getBlock(+this.blockID);
      })).subscribe((block: Block) => {
        if (block != null) {
          this.block = block;
        } else {
          this.loadingMsg = 'general.noData';
          this.longErrorMsg = 'blockDetails.doesNotExist';
        }
      }, error => {
        if (error.status >= 400 && error.status < 500) {
          this.loadingMsg = 'general.noData';
          this.longErrorMsg = 'blockDetails.doesNotExist';
        } else {
          this.loadingMsg = 'general.shortLoadingErrorMsg';
          this.longErrorMsg = 'general.longLoadingErrorMsg';
        }

      }));
  }

  ngOnDestroy() {
    this.pageSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
