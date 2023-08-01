import {ConfigTemplateEntry, DefaultsJobs,} from '../../../../common/entities/job/JobDTO';
import {Job} from './Job';
import {backendTexts} from '../../../../common/BackendTexts';
import {SortingMethods} from '../../../../common/entities/SortingMethods';
import {DatePatternFrequency, DatePatternSearch, SearchQueryDTO, SearchQueryTypes} from '../../../../common/entities/SearchQueryDTO';
import {ObjectManagers} from '../../ObjectManagers';
import {PhotoEntity} from '../../database/enitites/PhotoEntity';
import {EmailMediaMessenger} from '../../mediamessengers/EmailMediaMessenger';


export class TopPickSendJob extends Job<{
  searchQuery: SearchQueryDTO,
  sortBy: SortingMethods[],
  pickAmount: number,
  emailTo: string,
  emailFrom: string,
  emailSubject: string,
  emailText: string,
}> {
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
    }, {
      id: 'emailTo',
      type: 'string-array',
      name: backendTexts.emailTo.name,
      description: backendTexts.emailTo.description,
      defaultValue: [],
    },  {
      id: 'emailSubject',
      type: 'string',
      name: backendTexts.emailSubject.name,
      description: backendTexts.emailSubject.description,
      defaultValue: 'Latest photos for you',
    }, {
      id: 'emailText',
      type: 'string',
      name: backendTexts.emailText.name,
      description: backendTexts.emailText.description,
      defaultValue: 'I hand picked these photos just for you:',
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
    this.Progress.log('Sending emails');
    const messenger = new EmailMediaMessenger();
    await messenger.sendMedia({
      to: this.config.emailTo,
      subject: this.config.emailSubject,
      text: this.config.emailText
    }, this.mediaList);
    this.Progress.Processed++;
    return false;
  }
}
