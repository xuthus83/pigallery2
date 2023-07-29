import {ConfigTemplateEntry, DefaultsJobs,} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import {backendTexts} from '../../../../common/BackendTexts';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {DatePatternFrequency, DatePatternSearch, SearchQueryDTO, SearchQueryTypes} from '../../../../common/entities/SearchQueryDTO';
import {ObjectManagers} from '../../ObjectManagers';
import {PhotoEntity} from '../../database/enitites/PhotoEntity';


export class TopPickSendJob extends Job<{ searchQuery: SearchQueryDTO, sortBy: SortingMethods[], pickAmount: number }> {
  public readonly Name = DefaultsJobs[DefaultsJobs['Top Pick Sending']];
  public readonly Supported: boolean = true;
  public readonly ConfigTemplate: ConfigTemplateEntry[] = [
    {
      id: 'searchQuery',
      type: 'SearchQuery',
      name: backendTexts.searchQuery.name,
      description: backendTexts.searchQuery.description,
      defaultValue: {
        type: SearchQueryTypes.date_pattern,
        daysLength: 7,
        frequency: DatePatternFrequency.every_year
      } as DatePatternSearch,
    }, {
      id: 'sortby',
      type: 'sort-array',
      name: backendTexts.sortBy.name,
      description: backendTexts.sortBy.description,
      defaultValue: [SortingMethods.descRating],
    }, {
      id: 'pickAmount',
      type: 'number',
      name: backendTexts.pickAmount.name,
      description: backendTexts.pickAmount.description,
      defaultValue: 5,
    },
  ];
  private status: 'Listing' | 'Sending' = 'Listing';
  private mediaList: PhotoEntity[] = [];


  protected async init(): Promise<void> {
    this.status = 'Listing';
    this.mediaList = [];
    this.Progress.Left = 2;
  }


  protected async step(): Promise<boolean> {

    switch (this.status) {
      case 'Listing':
        if (!await this.stepListing()) {
          this.status = 'Sending';
        }
        return true;
      case 'Sending':
        await this.stepSending();
    }
    return false;
  }

  private async stepListing(): Promise<boolean> {
    this.Progress.log('Collecting Photos and videos to Send');
    this.Progress.Processed++;
    this.mediaList = await ObjectManagers.getInstance().SearchManager.getNMedia(this.config.searchQuery, this.config.sortBy, this.config.pickAmount);
   // console.log(this.mediaList);
    return false;
  }

  private async stepSending(): Promise<boolean> {
    return false;
  }
}
